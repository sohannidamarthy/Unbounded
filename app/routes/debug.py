from fastapi import APIRouter, Body
import time
from typing import Any, Dict

from app.redis_client import get_redis
from app.services.odds_cache import upsert_odds, get_odds, get_odds_ts, is_stale
from app.services.arbs_cache import upsert_arb, get_top_arbs, get_arb

router = APIRouter(prefix="/debug", tags=["debug"])

@router.get("/redis")
async def debug_redis():
    r = await get_redis()
    now = int(time.time())
    key = "debug:redis"
    await r.set(key, f"pong:{now}", ex=30)
    return {"ok": True, "value": await r.get(key), "ttl": await r.ttl(key)}

@router.post("/odds/{event_id}/{market}/{book}")
async def debug_set_odds(
    event_id: str,
    market: str,
    book: str,
    payload: Dict[str, Any] = Body(...),
):
    await upsert_odds(event_id=event_id, market=market, book=book, payload=payload)
    return {"ok": True}

@router.get("/odds/{event_id}/{market}")
async def debug_get_odds(event_id: str, market: str):
    odds = await get_odds(event_id, market)
    ts = await get_odds_ts(event_id, market)
    stale = await is_stale(event_id, market, max_age_seconds=60)
    return {"event_id": event_id, "market": market, "ts": ts, "stale": stale, "odds": odds}

# ---- Arb debug (Step C scaffold) ----
@router.post("/arb/{sport}/{arb_id}")
async def debug_set_arb(
    sport: str,
    arb_id: str,
    roi: float,
    payload: Dict[str, Any] = Body(...),
):
    await upsert_arb(sport=sport, arb_id=arb_id, roi=roi, payload=payload, ttl_seconds=120)
    return {"ok": True}

@router.get("/arbs/{sport}")
async def debug_get_top_arbs(sport: str, limit: int = 25):
    return await get_top_arbs(sport=sport, limit=limit)

@router.get("/arb/{arb_id}")
async def debug_get_arb(arb_id: str):
    arb = await get_arb(arb_id)
    if arb is None:
        return {"ok": False, "reason": "not_found"}
    return {"ok": True, "arb": arb}
