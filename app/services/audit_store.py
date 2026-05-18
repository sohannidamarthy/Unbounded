from __future__ import annotations

from decimal import Decimal, InvalidOperation
from typing import Any, Dict, Optional

from sqlalchemy import text
from app.db.session import SessionLocal


UPSERT_ARB_LATEST = """
INSERT INTO arb_latest (
  arb_id, sport, league, event_id, event_name, start_time_ms,
  market_key, market_instance_id, line, player_id, arb_sum, roi_raw,
  ts_updated_ms, ts_min_leg_ingested_ms, legs_json, payload_json
)
VALUES (
  :arb_id, :sport, :league, :event_id, :event_name, :start_time_ms,
  :market_key, :market_instance_id, :line, :player_id, :arb_sum, :roi_raw,
  :ts_updated_ms, :ts_min_leg_ingested_ms, CAST(:legs_json AS jsonb), CAST(:payload_json AS jsonb)
)
ON CONFLICT (arb_id) DO UPDATE SET
  sport = EXCLUDED.sport,
  league = EXCLUDED.league,
  event_id = EXCLUDED.event_id,
  event_name = EXCLUDED.event_name,
  start_time_ms = EXCLUDED.start_time_ms,
  market_key = EXCLUDED.market_key,
  market_instance_id = EXCLUDED.market_instance_id,
  line = EXCLUDED.line,
  player_id = EXCLUDED.player_id,
  arb_sum = EXCLUDED.arb_sum,
  roi_raw = EXCLUDED.roi_raw,
  ts_updated_ms = EXCLUDED.ts_updated_ms,
  ts_min_leg_ingested_ms = EXCLUDED.ts_min_leg_ingested_ms,
  legs_json = EXCLUDED.legs_json,
  payload_json = EXCLUDED.payload_json,
  updated_at = now()
"""

INSERT_QUOTE_SQL = """
INSERT INTO quote_snapshots (arb_id, bankroll, constraints_json, result_json)
VALUES (:arb_id, :bankroll, CAST(:constraints_json AS jsonb), CAST(:result_json AS jsonb))
"""


def _decimal_or_none(value: Any) -> Optional[Decimal]:
    if value is None:
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return None


def _int_or_none(value: Any) -> Optional[int]:
    if value is None:
        return None
    try:
        return int(value)
    except (ValueError, TypeError):
        return None


def upsert_arb_latest(*, arb_id: str, arb_payload: Dict[str, Any]) -> None:
    sport = arb_payload.get("sport")
    league = arb_payload.get("league")
    event_id = arb_payload.get("event_id") or arb_payload.get("eventId")
    event_name = arb_payload.get("event_name") or arb_payload.get("eventName")
    start_time_ms = arb_payload.get("start_time_ms")
    market_key = arb_payload.get("market_key")
    market_instance_id = arb_payload.get("market_instance_id")
    line = arb_payload.get("line")
    player_id = arb_payload.get("player_id")
    arb_sum = arb_payload.get("S") or arb_payload.get("arb_sum")
    roi_raw = arb_payload.get("roi") or arb_payload.get("roi_raw")
    ts_updated_ms = arb_payload.get("ts_updated_ms")
    ts_min_leg_ingested_ms = arb_payload.get("ts_min_leg_ingested_ms")
    legs = arb_payload.get("legs") or []

    db = SessionLocal()
    try:
        db.execute(
            text(UPSERT_ARB_LATEST),
            {
                "arb_id": str(arb_id),
                "sport": sport,
                "league": league,
                "event_id": event_id,
                "event_name": event_name,
                "start_time_ms": _int_or_none(start_time_ms),
                "market_key": market_key,
                "market_instance_id": market_instance_id,
                "line": _decimal_or_none(line),
                "player_id": player_id,
                "arb_sum": _decimal_or_none(arb_sum),
                "roi_raw": _decimal_or_none(roi_raw),
                "ts_updated_ms": _int_or_none(ts_updated_ms),
                "ts_min_leg_ingested_ms": _int_or_none(ts_min_leg_ingested_ms),
                "legs_json": json_dumps(legs),
                "payload_json": json_dumps(arb_payload),
            },
        )
        db.commit()
    finally:
        db.close()


def json_dumps(payload: Any) -> str:
    import json

    return json.dumps(payload, separators=(",", ":"), default=str)


def insert_quote_snapshot(*, arb_id: str, quote_payload: Dict[str, Any]) -> None:
    """
    Fire-and-forget audit logging to Postgres.
    Stores the quote result (ok or fail) for later analysis.
    """
    bankroll = quote_payload.get("bankroll")
    constraints = quote_payload.get("constraints") or quote_payload.get("constraints_json") or {}
    result = quote_payload.get("result") or quote_payload.get("result_json") or quote_payload

    db = SessionLocal()
    try:
        db.execute(
            text(INSERT_QUOTE_SQL),
            {
                "arb_id": arb_id,
                "bankroll": _decimal_or_none(bankroll),
                "constraints_json": json_dumps(constraints),
                "result_json": json_dumps(result),
            },
        )
        db.commit()
    finally:
        db.close()


def INSERT_QUOTE(*, arb_id: str, quote_payload: Dict[str, Any]) -> None:
    insert_quote_snapshot(arb_id=arb_id, quote_payload=quote_payload)


INSERT_QUOTE_SNAPSHOT = insert_quote_snapshot
