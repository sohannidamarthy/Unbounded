import os
import json
from typing import Any, Dict, List, Optional

import redis
from fastapi import APIRouter, Query

router = APIRouter(prefix="/v1/arbs", tags=["arbs"])

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

ARB_FEED_KEY = "arbs:feed:{sport}"
ARB_DETAIL_KEY = "arb:detail:{arb_id}"

# Create client once per process
r = redis.Redis.from_url(REDIS_URL, decode_responses=False)


from app.schemas.arbs_quote import QuoteConstraints
from app.services.quote_solver import InputLeg, quote_arbitrage

@router.get("/quote")
def quote_arb(
    arb_id: str = Query(...),
    bankroll: float = Query(..., gt=0),

    # constraints
    min_bet: float = Query(1.0, gt=0),
    bet_increment: float = Query(0.01, gt=0),
    max_bet: float | None = Query(None, gt=0),

    # protection
    min_roi: float | None = Query(None),
    min_profit: float | None = Query(None),

    # risk
    stale_cutoff_ms: int = Query(300000, ge=1),  # 5 min default
) -> Dict[str, Any]:
    k = ARB_DETAIL_KEY.format(arb_id=arb_id)
    raw = r.get(k)
    if raw is None:
        return {"ok": False, "arb_id": arb_id, "message": "arb detail missing or expired (TTL)."}

    s = raw.decode("utf-8") if isinstance(raw, (bytes, bytearray)) else str(raw)
    arb = json.loads(s)

    legs_raw = arb.get("legs") or []
    if not isinstance(legs_raw, list) or not legs_raw:
        return {"ok": False, "arb_id": arb_id, "message": "arb has no legs"}

    legs: list[InputLeg] = []
    for leg in legs_raw:
        if not isinstance(leg, dict):
            continue

        outcome = leg.get("outcome") or leg.get("outcome_key") or leg.get("side")
        book = leg.get("book") or leg.get("book_id") or leg.get("sportsbook")
        odds_decimal = leg.get("odds_decimal")
        odds_american = leg.get("odds_american")

        # accept nested odds structure
        if odds_decimal is None and isinstance(leg.get("odds"), dict):
            odds_decimal = leg["odds"].get("decimal")
            odds_american = odds_american or leg["odds"].get("american")

        line = leg.get("line")
        ts_ingested_ms = leg.get("ts_ingested_ms") or leg.get("ts") or leg.get("ts_ms")

        if outcome is None or book is None or odds_decimal is None:
            continue

        legs.append(InputLeg(
            outcome=str(outcome),
            book=str(book),
            odds_decimal=float(odds_decimal),
            odds_american=int(odds_american) if odds_american is not None else None,
            line=float(line) if line is not None else None,
            ts_ingested_ms=int(ts_ingested_ms) if ts_ingested_ms is not None else None,
        ))

    constraints = QuoteConstraints(
        bankroll=float(bankroll),
        min_bet=float(min_bet),
        bet_increment=float(bet_increment),
        max_bet=float(max_bet) if max_bet is not None else None,
        min_roi=float(min_roi) if min_roi is not None else None,
        min_profit=float(min_profit) if min_profit is not None else None,
    )

    res = quote_arbitrage(
        arb_id=arb_id,
        legs=legs,
        constraints=constraints,
        stale_cutoff_ms=int(stale_cutoff_ms),
    )
    d = res.model_dump()
    # optionally include a tiny slice of the arb
    d["arb_meta"] = {
        "sport": arb.get("sport"),
        "event_id": arb.get("event_id") or arb.get("eventId"),
        "market_key": arb.get("market_key"),
        "line": arb.get("line"),
    }
    return d
