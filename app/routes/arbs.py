from __future__ import annotations

import json
import os
from typing import Any

from fastapi import APIRouter, Query

from app.redis_client import get_redis

router = APIRouter(prefix="/v1", tags=["arbs"])

ARB_DETAIL_KEY = "arb:detail:{arb_id}"
ARB_FEED_KEY = "arbs:feed:{sport}"


async def _load_arbs_from_redis(sport: str, limit: int) -> list[dict[str, Any]]:
    r = await get_redis()
    feed_key = ARB_FEED_KEY.format(sport=sport)
    ids = await r.zrevrange(feed_key, 0, max(0, limit - 1))
    if not ids:
        return []

    keys = [ARB_DETAIL_KEY.format(arb_id=arb_id) for arb_id in ids]
    payloads = await r.mget(keys)
    arbs: list[dict[str, Any]] = []
    for arb_id, raw in zip(ids, payloads):
        if not raw:
            continue
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            continue
        if isinstance(payload, dict):
            payload.setdefault("arb_id", arb_id)
            arbs.append(payload)
    return arbs


@router.get("/arbs")
async def list_arbs(
    sport: str = Query("all", min_length=1),
    limit: int = Query(50, ge=1, le=200),
) -> dict[str, Any]:
    sport_key = sport.strip().lower()
    if sport_key == "all":
        configured_sports = os.getenv("ARB_SPORTS", "nba,nfl,mlb,mls,epl")
        sports = [item.strip().lower() for item in configured_sports.split(",") if item.strip()]
        arbs_by_sport = await _load_arbs_for_sports(sports=sports, limit=limit)
        return {"sport": "all", "arbs": arbs_by_sport[:limit]}

    arbs = await _load_arbs_from_redis(sport=sport_key, limit=limit)
    return {"sport": sport_key, "arbs": arbs}


async def _load_arbs_for_sports(sports: list[str], limit: int) -> list[dict[str, Any]]:
    arbs: list[dict[str, Any]] = []
    for sport in sports:
        arbs.extend(await _load_arbs_from_redis(sport=sport, limit=limit))
    return sorted(
        arbs,
        key=lambda arb: float(arb.get("roi") or arb.get("roi_raw") or 0),
        reverse=True,
    )
