from __future__ import annotations

from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Tuple, Optional

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.services.odds_cache import upsert_odds
from app.services.odds_cache_v2 import write_latest_market_blob

LATEST_SQL = """
SELECT DISTINCT ON (s.event_id, s.market_id, s.book_key)
  s.event_id,
  s.market_id,
  s.book_key,
  s.book_title,
  s.odds_decimal,
  s.odds_american,
  s.fetched_at,
  s.provider_last_update,
  m.market_type,
  m.selection,
  m.line
FROM odds_snapshots s
JOIN markets m ON m.id = s.market_id
WHERE s.fetched_at >= :since_ts
ORDER BY s.event_id, s.market_id, s.book_key, s.fetched_at DESC
"""

def _rows_latest(db: Session, since_ts: datetime) -> List[Dict[str, Any]]:
    res = db.execute(text(LATEST_SQL), {"since_ts": since_ts}).mappings().all()
    return [dict(r) for r in res]

def _mk_market_key(market_type: str) -> str:
    mt = (market_type or "").strip().lower()
    # map OddsAPI-ish market_type to your Week 1 slugs
    if mt in ("h2h", "moneyline"):
        return "moneyline"
    if mt in ("spreads", "spread"):
        return "spread"
    if mt in ("totals", "total"):
        return "total"
    return mt or "unknown"

def _mk_outcome_key(selection: str, market_key: str) -> str:
    s = (selection or "").strip().lower().replace(" ", "_")
    if market_key == "total":
        if s.startswith("over"): return "over"
        if s.startswith("under"): return "under"
    return s

async def rebuild_redis_latest_odds(
    *,
    since_minutes: int = 180,
    # OPTIONAL: pass sport_key from ingestion so we can index active:events:{sport} correctly
    sport_key: str = "unknown",
    league: str = "",
) -> Dict[str, Any]:
    since_ts = datetime.now(timezone.utc) - timedelta(minutes=since_minutes)

    with SessionLocal() as db:
        rows = _rows_latest(db, since_ts)

    written = 0
    v2_groups: Dict[Tuple[str, str, Optional[float]], Dict[str, Any]] = {}

    # We don't have real commence time in this SQL right now.
    # Use "now + 6h" so events are considered active by scanner.
    now_ms = int(datetime.now(timezone.utc).timestamp() * 1000)
    start_time_ms_default = now_ms + (6 * 60 * 60 * 1000)

    for row in rows:
        event_id = str(row["event_id"])
        market_key = _mk_market_key(str(row["market_type"]))
        selection = str(row["selection"])
        outcome_key = _mk_outcome_key(selection, market_key)
        line = float(row["line"]) if row["line"] is not None else None

        book = str(row["book_key"]).strip().lower()
        odds_decimal = float(row["odds_decimal"])
        odds_american = row["odds_american"]

        # ---- Existing Week 1 schema write (unchanged)
        payload = {
            "market_type": row["market_type"],
            "selection": selection,
            "line": line,
            "book": book,
            "book_title": row["book_title"],
            "odds_decimal": odds_decimal,
            "odds_american": odds_american,
            "fetched_at": row["fetched_at"].isoformat() if row["fetched_at"] else None,
            "provider_last_update": row["provider_last_update"].isoformat() if row["provider_last_update"] else None,
        }
        await upsert_odds(event_id=event_id, market=market_key, book=book, payload=payload)

        # ---- Accumulate for Week 5 scanner schema (v2)
        gk = (event_id, market_key, line)
        g = v2_groups.get(gk)
        if g is None:
            g = {
                "sport": sport_key,
                "league": league or sport_key.upper(),
                "event_id": event_id,
                "event_name": event_id,  # TODO: join real teams later
                "start_time_ms": start_time_ms_default,  # TODO: join real commence time later
                "market_key": market_key,
                "line": line,
                "outcomes_set": set(),
                "books": {},  # book -> outcome -> leg
            }
            v2_groups[gk] = g

        g["outcomes_set"].add(outcome_key)
        books = g["books"]
        b = books.get(book)
        if b is None:
            b = {}
            books[book] = b

        # Use now_ms for ingestion time inside v2 blob
        b[outcome_key] = {
            "odds_decimal": odds_decimal,
            "odds_american": odds_american,
            "ts_ingested_ms": now_ms,
        }

        written += 1

    # ---- Flush v2 blobs (one per market instance)
    v2_written = 0
    for (_, _, _), g in v2_groups.items():
        outcomes = sorted(list(g["outcomes_set"]))
        # Require at least 2 outcomes (avoid partial junk)
        if len(outcomes) < 2:
            continue
        await write_latest_market_blob(
            sport=g["sport"],
            league=g["league"],
            event_id=g["event_id"],
            event_name=g["event_name"],
            start_time_ms=int(g["start_time_ms"]),
            market_key=g["market_key"],
            line=g["line"],
            books=g["books"],
            outcomes=outcomes,
        )
        v2_written += 1

    return {"since_minutes": since_minutes, "rows_loaded": len(rows), "redis_writes": written, "v2_blobs_written": v2_written}
