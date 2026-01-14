from __future__ import annotations

import json
import time
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.redis_client import get_redis
from app.schemas.arbs_quote import QuoteConstraints, QuoteResult
from app.services.quote_solver import InputLeg, quote_arbitrage
from app.services.audit_store import insert_quote_snapshot  # <-- we add this next
from starlette.concurrency import run_in_threadpool

from app.db.session import SessionLocal
from sqlalchemy import text



router = APIRouter(prefix="/arbs", tags=["arbs"])

# Redis keys (must match scanner)
ARB_DETAIL_KEY = "arb:detail:{arb_id}"
ARB_FEED_KEY = "arbs:feed:{sport}"

# Defaults: keep consistent with scanner/env
PREGAME_STALE_MS_DEFAULT = 5 * 60 * 1000
LIVE_STALE_MS_DEFAULT = 30 * 1000


def _now_ms() -> int:
    return int(time.time() * 1000)


def _stale_cutoff_ms(arb: Dict[str, Any]) -> int:
    start_time_ms = arb.get("start_time_ms")
    if start_time_ms is None:
        return PREGAME_STALE_MS_DEFAULT
    return LIVE_STALE_MS_DEFAULT if _now_ms() >= int(start_time_ms) else PREGAME_STALE_MS_DEFAULT


async def _get_arb_detail_or_404(arb_id: str) -> Dict[str, Any]:
    r = await get_redis()
    key = ARB_DETAIL_KEY.format(arb_id=arb_id)
    raw = await r.get(key)
    if not raw:
        raise HTTPException(status_code=404, detail="arb not found in redis (expired or missing)")
    try:
        s = raw.decode("utf-8") if isinstance(raw, (bytes, bytearray)) else str(raw)
        return json.loads(s)
    except Exception:
        raise HTTPException(status_code=500, detail="arb detail payload malformed")


@router.get("/feed/{sport}")
async def get_arb_feed(
    sport: str,
    limit: int = Query(25, ge=1, le=200),
) -> Dict[str, Any]:
    """
    Returns a list of arb_ids ordered by score (ROI * 1e6), highest first.
    """
    r = await get_redis()
    feed_key = ARB_FEED_KEY.format(sport=sport)

    # zrevrange withscores in redis-py/aioredis returns list like [b'id', b'score', ...] or tuples depending on client
    items = await r.zrevrange(feed_key, 0, limit - 1, withscores=True)

    out = []
    for item in items:
        # Handle tuple form: (member, score)
        if isinstance(item, (list, tuple)) and len(item) == 2:
            member, score = item
        else:
            # Fallback if client returns flat list (rare)
            continue

        arb_id = member.decode("utf-8") if isinstance(member, (bytes, bytearray)) else str(member)
        out.append({"arb_id": arb_id, "score": int(score)})

    return {"sport": sport, "items": out, "count": len(out)}


@router.get("/{arb_id}")
async def get_arb_detail(arb_id: str) -> Dict[str, Any]:
    """
    Returns the arb detail blob (from Redis).
    """
    arb = await _get_arb_detail_postgres_first_then_redis(arb_id)
    return arb


class QuoteRequest(BaseModel):
    constraints: QuoteConstraints


@router.post("/{arb_id}/quote", response_model=QuoteResult)
async def quote_arb(arb_id: str, req: QuoteRequest) -> QuoteResult:
    """
    Loads arb detail from Redis, solves stake sizing given constraints,
    returns QuoteResult and persists a quote snapshot to Postgres.
    """
    arb = await _get_arb_detail_postgres_first_then_redis(arb_id)

    legs_raw = arb.get("legs") or []
    if not isinstance(legs_raw, list) or len(legs_raw) < 2:
        raise HTTPException(status_code=400, detail="arb legs missing/invalid")

    legs: List[InputLeg] = []
    for l in legs_raw:
        if not isinstance(l, dict):
            continue
        legs.append(
            InputLeg(
                outcome=str(l.get("outcome_key") or ""),
                book=str(l.get("book") or ""),
                odds_decimal=float(l.get("odds_decimal")),
                odds_american=l.get("odds_american"),  # may be absent
                line=l.get("line"),
                ts_ingested_ms=l.get("ts_ingested_ms"),
            )
        )

    cutoff = _stale_cutoff_ms(arb)

    result = quote_arbitrage(
        arb_id=arb_id,
        legs=legs,
        constraints=req.constraints,
        stale_cutoff_ms=cutoff,
    )

    # Durable audit trail (even if quote fails, we store the attempt)
    insert_quote_snapshot(
        arb_id=arb_id,
        quote_payload=result.model_dump(),
    )

    return result


# =========================
# Postgres-first arb fetch (arb_latest) with Redis fallback
# =========================

GET_ARB_LATEST = """
SELECT payload_json
FROM arb_latest
WHERE arb_id = :arb_id
"""

async def _get_arb_detail_postgres_first_then_redis(arb_id: str) -> dict:
    """
    1) Postgres first (arb_latest.payload_json)
    2) Redis second (arb:detail:{arb_id})
    Raises HTTPException(404) if missing everywhere.
    """
    # ---- 1) Postgres first (sync SessionLocal; run off event loop) ----
    def _read_from_pg():
        with SessionLocal() as db:
            row = db.execute(text(GET_ARB_LATEST), {"arb_id": arb_id}).fetchone()
            if not row:
                return None
            payload = row[0]
            return payload

    pg_payload = await run_in_threadpool(_read_from_pg)
    if pg_payload:
        # If your driver returns JSON as string, uncomment:
        if isinstance(pg_payload, str):
            pg_payload = json.loads(pg_payload)
        return pg_payload

    # ---- 2) Redis fallback ----
    key = ARB_DETAIL_KEY.format(arb_id=arb_id)
    r = await get_redis()
    raw = await r.get(key)
    if not raw:
        raise HTTPException(status_code=404, detail="arb not found (postgres+redis)")
    try:
        return json.loads(raw)
    except Exception:
        raise HTTPException(status_code=500, detail="arb detail payload malformed")



