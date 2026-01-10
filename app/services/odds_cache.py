import json
import time
from typing import Any, Dict, Optional

from app.redis_client import get_redis
from app.core.redis_conventions import (
    REDIS_SCHEMA_VERSION,
    ns,
    ODDS_TTL_SECONDS,
    ODDS_TS_TTL_SECONDS,
    EVENT_MARKETS_TTL_SECONDS,
    normalize_market,
    normalize_book,
)

def odds_key(event_id: str, market: str) -> str:
    market = normalize_market(market)
    return ns(f"odds:{event_id}:{market}")

def odds_ts_key(event_id: str, market: str) -> str:
    market = normalize_market(market)
    return ns(f"odds_ts:{event_id}:{market}")

def event_markets_key(event_id: str) -> str:
    return ns(f"event_markets:{event_id}")

def _with_meta(payload: Dict[str, Any]) -> Dict[str, Any]:
    # Embed schema version + server timestamp so consumers can evolve safely
    now = int(time.time())
    return {
        "_v": REDIS_SCHEMA_VERSION,
        "_ts": now,
        **payload,
    }

async def upsert_odds(event_id: str, market: str, book: str, payload: Dict[str, Any]) -> None:
    r = await get_redis()

    market = normalize_market(market)
    book = normalize_book(book)

    k = odds_key(event_id, market)
    ts_k = odds_ts_key(event_id, market)
    mk_k = event_markets_key(event_id)

    enriched = _with_meta(payload)

    # store per-book odds payload (JSON)
    await r.hset(k, book, json.dumps(enriched, separators=(",", ":")))

    # freshness timestamp (unix seconds)
    now = int(time.time())
    await r.set(ts_k, str(now))

    # index market exists for event
    await r.sadd(mk_k, market)

    # TTLs (live layer)
    await r.expire(k, ODDS_TTL_SECONDS)
    await r.expire(ts_k, ODDS_TS_TTL_SECONDS)
    await r.expire(mk_k, EVENT_MARKETS_TTL_SECONDS)

async def get_odds(event_id: str, market: str) -> Dict[str, Any]:
    r = await get_redis()
    market = normalize_market(market)

    raw = await r.hgetall(odds_key(event_id, market))  # {book: json_str}
    out: Dict[str, Any] = {}
    for book, json_str in raw.items():
        try:
            out[book] = json.loads(json_str)
        except Exception:
            out[book] = {"_raw": json_str}
    return out

async def get_odds_ts(event_id: str, market: str) -> Optional[int]:
    r = await get_redis()
    market = normalize_market(market)

    ts = await r.get(odds_ts_key(event_id, market))
    return int(ts) if ts is not None else None

async def is_stale(event_id: str, market: str, max_age_seconds: int = 60) -> bool:
    ts = await get_odds_ts(event_id, market)
    if ts is None:
        return True
    return (int(time.time()) - ts) > max_age_seconds
