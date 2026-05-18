from __future__ import annotations

import json
from typing import Any

from fastapi import APIRouter, Query
from sqlalchemy import bindparam, text

from app.db.session import SessionLocal

router = APIRouter(prefix="/v1", tags=["evs"])


def _payload_from_db_row(row: Any) -> dict[str, Any]:
    payload = row.payload_json
    if isinstance(payload, str):
        try:
            payload = json.loads(payload)
        except json.JSONDecodeError:
            payload = {}
    if not isinstance(payload, dict):
        payload = {}

    payload.setdefault("ev_id", row.ev_id)
    payload.setdefault("sport", row.sport)
    payload.setdefault("league", row.league)
    payload.setdefault("event_id", row.event_id)
    payload.setdefault("event_name", row.event_name)
    payload.setdefault("start_time_ms", row.start_time_ms)
    payload.setdefault("market_key", row.market_key)
    payload.setdefault("selection", row.selection)
    payload.setdefault("line", float(row.line) if row.line is not None else None)
    payload.setdefault("book", row.book)
    payload.setdefault(
        "odds_decimal",
        float(row.odds_decimal) if row.odds_decimal is not None else None,
    )
    payload.setdefault("odds_american", row.odds_american)
    payload.setdefault(
        "implied_probability",
        float(row.implied_probability) if row.implied_probability is not None else None,
    )
    payload.setdefault(
        "fair_probability",
        float(row.fair_probability) if row.fair_probability is not None else None,
    )
    payload.setdefault("edge", float(row.edge) if row.edge is not None else None)
    payload.setdefault(
        "expected_value",
        float(row.expected_value) if row.expected_value is not None else None,
    )
    payload.setdefault("bet_url", row.bet_url)
    payload.setdefault("ts_updated_ms", row.ts_updated_ms)
    return payload


def _load_evs_from_db(*, sports: list[str] | None, limit: int) -> list[dict[str, Any]]:
    if sports:
        query = text(
            """
            SELECT ev_id, sport, league, event_id, event_name, start_time_ms,
                   market_key, selection, line, book, odds_decimal, odds_american,
                   implied_probability, fair_probability, edge, expected_value,
                   bet_url, ts_updated_ms, payload_json
            FROM ev_latest
            WHERE sport IN :sports
            ORDER BY expected_value DESC NULLS LAST, edge DESC NULLS LAST, updated_at DESC
            LIMIT :limit
            """
        ).bindparams(bindparam("sports", expanding=True))
        params = {"sports": sports, "limit": limit}
    else:
        query = text(
            """
            SELECT ev_id, sport, league, event_id, event_name, start_time_ms,
                   market_key, selection, line, book, odds_decimal, odds_american,
                   implied_probability, fair_probability, edge, expected_value,
                   bet_url, ts_updated_ms, payload_json
            FROM ev_latest
            ORDER BY expected_value DESC NULLS LAST, edge DESC NULLS LAST, updated_at DESC
            LIMIT :limit
            """
        )
        params = {"limit": limit}

    db = SessionLocal()
    try:
        rows = db.execute(query, params).all()
        return [_payload_from_db_row(row) for row in rows]
    finally:
        db.close()


@router.get("/evs")
async def list_evs(
    sport: str = Query("all", min_length=1),
    limit: int = Query(50, ge=1, le=200),
) -> dict[str, Any]:
    sport_key = sport.strip().lower()
    if sport_key == "all":
        return {"sport": "all", "evs": _load_evs_from_db(sports=None, limit=limit)}

    return {
        "sport": sport_key,
        "evs": _load_evs_from_db(sports=[sport_key], limit=limit),
    }
