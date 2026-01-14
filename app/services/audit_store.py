from __future__ import annotations

import json
from typing import Any, Dict

from sqlalchemy import text
from app.db.session import SessionLocal


UPSERT_ARB_LATEST = """
INSERT INTO arb_latest (arb_id, sport, event_id, market_key, line, roi_raw, payload_json)
VALUES (:arb_id, :sport, :event_id, :market_key, :line, :roi_raw, :payload_json)
ON CONFLICT (arb_id) DO UPDATE SET
  sport = EXCLUDED.sport,
  event_id = EXCLUDED.event_id,
  market_key = EXCLUDED.market_key,
  line = EXCLUDED.line,
  roi_raw = EXCLUDED.roi_raw,
  payload_json = EXCLUDED.payload_json,
  updated_at = now()
"""

INSERT_QUOTE = """
INSERT INTO quote_snapshots (arb_id, bankroll, constraints_json, result_json)
VALUES (:arb_id, :bankroll, :constraints_json, :result_json)
"""


def upsert_arb_latest(*, arb_id: str, arb_payload: Dict[str, Any]) -> None:
    sport = arb_payload.get("sport")
    event_id = arb_payload.get("event_id") or arb_payload.get("eventId")
    market_key = arb_payload.get("market_key")
    line = arb_payload.get("line")
    roi_raw = arb_payload.get("roi") or arb_payload.get("roi_raw")

    payload_json = json.dumps(arb_payload, separators=(",", ":"), default=str)

    db = SessionLocal()
    try:
        db.execute(
            text(UPSERT_ARB_LATEST),
            {
                "arb_id": str(arb_id),
                "sport": sport,
                "event_id": event_id,
                "market_key": market_key,
                "line": float(line) if line is not None else None,
                "roi_raw": float(roi_raw) if roi_raw is not None else None,
                "payload_json": payload_json,
            },
        )
        db.commit()
    finally:
        db.close()


def INSERT_QUOTE(*, arb_id: str, quote_payload: Dict[str, Any]) -> None:
    """
    Fire-and-forget audit logging to Postgres.
    Stores the quote result (ok or fail) for later analysis.
    """
    db = SessionLocal()
    try:
        db.execute(
            text(INSERT_QUOTE),
            {
                "arb_id": arb_id,
                "quote_payload": json.dumps(quote_payload),
            },
        )
        db.commit()
    finally:
        db.close()
