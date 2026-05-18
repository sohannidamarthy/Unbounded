import json
import time
from typing import Any, Dict, Optional

from app.redis_client import get_redis
from app.core.redis_conventions import ns, normalize_market

def active_events_key(sport: str) -> str:
    # ZSET score = start_time_ms
    return ns(f"active:events:{sport}")

def event_markets_v2_key(event_id: str) -> str:
    # SET of "{market_key}|{market_instance_id}"
    return ns(f"event:markets:{event_id}")

def odds_latest_key(sport: str, event_id: str, market_key: str, market_instance_id: str) -> str:
    market_key = normalize_market(market_key)
    return ns(f"odds:latest:{sport}:{event_id}:{market_key}:{market_instance_id}")

def market_instance_id_for(market_key: str, line: Optional[float]) -> str:
    """
    Stable identity for line-matching:
      moneyline -> "main"
      total -> "total:{line}"
      spread -> "spread:{line}"
      alt_spread / alt_total / props -> "{market_key}:{line}"
    """
    mk = normalize_market(market_key)
    if mk in ("moneyline", "h2h"):
        return "main"
    if line is None:
        return "main"
    # keep line formatting stable
    return f"{mk}:{line}"

async def write_latest_market_blob(
    *,
    sport: str,
    league: str,
    event_id: str,
    event_name: str,
    start_time_ms: int,
    market_key: str,
    line: Optional[float],
    # books is: {book_key: {outcome_key: {odds_decimal, odds_american?, bet_url?, ts_ingested_ms}}}
    books: Dict[str, Dict[str, Dict[str, Any]]],
    outcomes: list[str],
) -> str:
    """
    Writes the single-blob-per-market-instance schema used by arb_scanner.
    Returns the redis odds key written.
    """
    r = await get_redis()

    market_key = normalize_market(market_key)
    mi = market_instance_id_for(market_key, line)
    k = odds_latest_key(sport, event_id, market_key, mi)

    now_ms = int(time.time() * 1000)

    blob = {
        "schema_version": 1,
        "sport": sport,
        "league": league,
        "event_id": event_id,
        "event_name": event_name,
        "start_time_ms": start_time_ms,

        "market_key": market_key,
        "market_instance_id": mi,
        "line": line,
        "player_id": None,

        "ts_ingested_ms": now_ms,
        "outcomes": outcomes,
        "books": books,
    }

    # Index: active events
    await r.zadd(active_events_key(sport), {event_id: start_time_ms})

    # Index: event -> market instances
    await r.sadd(event_markets_v2_key(event_id), f"{market_key}|{mi}")

    # Write the blob (no TTL; ingestion overwrites continuously)
    await r.set(k, json.dumps(blob, separators=(",", ":")))

    return k
