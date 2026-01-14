from __future__ import annotations

from typing import Any, Dict
from uuid import UUID

from sqlalchemy import text


def get_latest_odds_by_book(
    db,
    *,
    event_id: UUID,
    market_id: UUID,
) -> Dict[str, Dict[str, Any]]:
    """
    Sync Postgres query (works with your create_engine + SessionLocal).

    Returns the latest odds snapshot per book_key for a given (event_id, market_id).

    Output:
    {
      "betmgm": {
        "book_key": "betmgm",
        "book_title": "BetMGM",
        "odds_decimal": 1.9100,
        "odds_american": -110,
        "fetched_at": "2026-01-11T01:27:09.405430+00:00",
        "provider_last_update": "...",
        "_source": "postgres_snapshot"
      },
      ...
    }
    """

    sql = text("""
        SELECT DISTINCT ON (book_key)
            book_key,
            book_title,
            odds_decimal,
            odds_american,
            fetched_at,
            provider_last_update
        FROM odds_snapshots
        WHERE event_id = :event_id
          AND market_id = :market_id
        ORDER BY book_key, fetched_at DESC
    """)

    res = db.execute(sql, {"event_id": str(event_id), "market_id": str(market_id)})
    rows = res.mappings().all()

    out: Dict[str, Dict[str, Any]] = {}
    for r in rows:
        out[r["book_key"]] = {
            "book_key": r["book_key"],
            "book_title": r["book_title"],
            "odds_decimal": float(r["odds_decimal"]) if r["odds_decimal"] is not None else None,
            "odds_american": r["odds_american"],
            "fetched_at": r["fetched_at"].isoformat() if r["fetched_at"] else None,
            "provider_last_update": (
                r["provider_last_update"].isoformat()
                if r["provider_last_update"]
                else None
            ),
            "_source": "postgres_snapshot",
        }

    return out
