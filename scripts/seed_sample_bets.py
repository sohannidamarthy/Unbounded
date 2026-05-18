from __future__ import annotations

import json
import os
import sys
from decimal import Decimal
from pathlib import Path
from typing import Any

from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url


UPSERT_SQL = text(
    """
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
)


def load_dotenv() -> None:
    env_path = Path(".env")
    if not env_path.exists():
      return
    for line in env_path.read_text().splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def database_engine_config(database_url: str) -> tuple[str, dict[str, Any]]:
    url = make_url(database_url)
    connect_args: dict[str, Any] = {}

    if url.drivername in {"postgres", "postgresql", "postgresql+psycopg"}:
        query = dict(url.query)
        sslmode = query.pop("sslmode", None)
        query.pop("channel_binding", None)
        url = url.set(drivername="postgresql+pg8000", query=query)
        if sslmode and sslmode != "disable":
            connect_args["ssl_context"] = True

    return url.render_as_string(hide_password=False), connect_args


def decimal_or_none(value: Any) -> Decimal | None:
    if value is None:
        return None
    return Decimal(str(value))


def main() -> int:
    load_dotenv()
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL is not set. Set it or add it to .env, then rerun this script.", file=sys.stderr)
        return 1

    json_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("data/sample_bets.json")
    data = json.loads(json_path.read_text())
    arbs = data.get("arbs", [])
    if not isinstance(arbs, list):
        print(f"{json_path} must contain an 'arbs' array.", file=sys.stderr)
        return 1

    engine_url, connect_args = database_engine_config(database_url)
    engine = create_engine(engine_url, connect_args=connect_args, pool_pre_ping=True)

    with engine.begin() as connection:
        for arb in arbs:
            connection.execute(
                UPSERT_SQL,
                {
                    "arb_id": str(arb["arb_id"]),
                    "sport": arb.get("sport"),
                    "league": arb.get("league"),
                    "event_id": arb.get("event_id") or arb.get("eventId"),
                    "event_name": arb.get("event_name") or arb.get("eventName"),
                    "start_time_ms": arb.get("start_time_ms"),
                    "market_key": arb.get("market_key"),
                    "market_instance_id": arb.get("market_instance_id"),
                    "line": decimal_or_none(arb.get("line")),
                    "player_id": arb.get("player_id"),
                    "arb_sum": decimal_or_none(arb.get("S") or arb.get("arb_sum")),
                    "roi_raw": decimal_or_none(arb.get("roi") or arb.get("roi_raw")),
                    "ts_updated_ms": arb.get("ts_updated_ms"),
                    "ts_min_leg_ingested_ms": arb.get("ts_min_leg_ingested_ms"),
                    "legs_json": json.dumps(arb.get("legs") or [], separators=(",", ":")),
                    "payload_json": json.dumps(arb, separators=(",", ":")),
                },
            )

    print(f"Seeded {len(arbs)} arb rows from {json_path}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
