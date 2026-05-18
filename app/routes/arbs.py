from __future__ import annotations

import json
import logging
import os
from typing import Any

from fastapi import APIRouter, Query
from sqlalchemy import bindparam, text

from app.db.session import SessionLocal
from app.redis_client import get_redis

router = APIRouter(prefix="/v1", tags=["arbs"])
logger = logging.getLogger(__name__)

ARB_DETAIL_KEY = "arb:detail:{arb_id}"
ARB_FEED_KEY = "arbs:feed:{sport}"


async def _load_arbs_from_redis(sport: str, limit: int) -> list[dict[str, Any]]:
    try:
        r = await get_redis()
        feed_key = ARB_FEED_KEY.format(sport=sport)
        ids = await r.zrevrange(feed_key, 0, max(0, limit - 1))
    except Exception:
        logger.exception("Failed to load arb feed from Redis for sport=%s", sport)
        return []

    if not ids:
        return []

    keys = [ARB_DETAIL_KEY.format(arb_id=arb_id) for arb_id in ids]
    try:
        payloads = await r.mget(keys)
    except Exception:
        logger.exception("Failed to load arb details from Redis for sport=%s", sport)
        return []
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


def _payload_from_db_row(row: Any) -> dict[str, Any] | None:
    payload = row.payload_json
    if isinstance(payload, str):
        try:
            payload = json.loads(payload)
        except json.JSONDecodeError:
            payload = {}
    if not isinstance(payload, dict):
        payload = {}

    payload.setdefault("arb_id", row.arb_id)
    payload.setdefault("sport", row.sport)
    payload.setdefault("league", row.league)
    payload.setdefault("event_id", row.event_id)
    payload.setdefault("event_name", row.event_name)
    payload.setdefault("start_time_ms", row.start_time_ms)
    payload.setdefault("market_key", row.market_key)
    payload.setdefault("market_instance_id", row.market_instance_id)
    payload.setdefault("line", float(row.line) if row.line is not None else None)
    payload.setdefault("roi", float(row.roi_raw) if row.roi_raw is not None else 0)
    return payload


def _load_arbs_from_db(*, sports: list[str] | None, limit: int) -> list[dict[str, Any]]:
    if sports:
        query = text(
            """
            SELECT arb_id, sport, league, event_id, event_name, start_time_ms,
                   market_key, market_instance_id, line, roi_raw, payload_json
            FROM arb_latest
            WHERE sport IN :sports
            ORDER BY roi_raw DESC NULLS LAST, updated_at DESC
            LIMIT :limit
            """
        ).bindparams(bindparam("sports", expanding=True))
        params = {"sports": sports, "limit": limit}
    else:
        query = text(
            """
            SELECT arb_id, sport, league, event_id, event_name, start_time_ms,
                   market_key, market_instance_id, line, roi_raw, payload_json
            FROM arb_latest
            ORDER BY roi_raw DESC NULLS LAST, updated_at DESC
            LIMIT :limit
            """
        )
        params = {"limit": limit}

    db = SessionLocal()
    try:
        rows = db.execute(query, params).all()
        return [
            payload
            for row in rows
            if (payload := _payload_from_db_row(row)) is not None
        ]
    finally:
        db.close()


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
        if not arbs_by_sport:
            arbs_by_sport = _load_arbs_from_db(sports=sports, limit=limit)
        return {"sport": "all", "arbs": arbs_by_sport[:limit]}

    arbs = await _load_arbs_from_redis(sport=sport_key, limit=limit)
    if not arbs:
        arbs = _load_arbs_from_db(sports=[sport_key], limit=limit)
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
