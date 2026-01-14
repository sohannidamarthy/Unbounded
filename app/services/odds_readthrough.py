from __future__ import annotations

from typing import Any, Dict
from uuid import UUID

import anyio

from app.services.odds_cache import get_odds, is_stale, upsert_odds
from app.services.snapshots.read_snapshots import get_latest_odds_by_book


async def get_odds_readthrough(
    db,
    *,
    event_id: UUID,
    market_id: UUID,
) -> Dict[str, Dict[str, Any]]:
    """
    Redis -> Postgres fallback (read-through):
    - Try Redis first
    - If empty/stale, query Postgres odds_snapshots (sync) in a worker thread
    - Repopulate Redis and return
    """

    # 1) Redis-first
    cached = await get_odds(str(event_id), str(market_id))
    stale = await is_stale(str(event_id), str(market_id))

    if cached and not stale:
        return cached

    # 2) Fallback to Postgres (sync query off the event loop)
    latest = await anyio.to_thread.run_sync(
        lambda: get_latest_odds_by_book(db, event_id=event_id, market_id=market_id)
    )

    if not latest:
        return {}

    # 3) Repopulate Redis
    for book_key, payload in latest.items():
        await upsert_odds(
            event_id=str(event_id),
            market=str(market_id),  # Week 3: using market_id as cache key
            book=book_key,
            payload=payload,
        )

    return latest


