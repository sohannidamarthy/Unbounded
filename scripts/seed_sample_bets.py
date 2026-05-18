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

CREATE_EV_TABLE_SQL = text(
    """
    CREATE TABLE IF NOT EXISTS ev_latest (
      ev_id TEXT PRIMARY KEY,
      sport TEXT,
      league TEXT,
      event_id TEXT,
      event_name TEXT,
      start_time_ms BIGINT,
      market_key TEXT,
      selection TEXT,
      line NUMERIC,
      book TEXT,
      odds_decimal NUMERIC,
      odds_american INTEGER,
      implied_probability NUMERIC,
      fair_probability NUMERIC,
      edge NUMERIC,
      expected_value NUMERIC,
      bet_url TEXT,
      ts_updated_ms BIGINT,
      payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
    """
)

CREATE_EV_INDEXES_SQL = [
    text("CREATE INDEX IF NOT EXISTS ix_ev_latest_sport ON ev_latest (sport)"),
    text("CREATE INDEX IF NOT EXISTS ix_ev_latest_expected_value ON ev_latest (expected_value)"),
    text("CREATE INDEX IF NOT EXISTS ix_ev_latest_event_market ON ev_latest (event_id, market_key)"),
]

UPSERT_EV_SQL = text(
    """
    INSERT INTO ev_latest (
      ev_id, sport, league, event_id, event_name, start_time_ms, market_key,
      selection, line, book, odds_decimal, odds_american, implied_probability,
      fair_probability, edge, expected_value, bet_url, ts_updated_ms, payload_json
    )
    VALUES (
      :ev_id, :sport, :league, :event_id, :event_name, :start_time_ms, :market_key,
      :selection, :line, :book, :odds_decimal, :odds_american, :implied_probability,
      :fair_probability, :edge, :expected_value, :bet_url, :ts_updated_ms,
      CAST(:payload_json AS jsonb)
    )
    ON CONFLICT (ev_id) DO UPDATE SET
      sport = EXCLUDED.sport,
      league = EXCLUDED.league,
      event_id = EXCLUDED.event_id,
      event_name = EXCLUDED.event_name,
      start_time_ms = EXCLUDED.start_time_ms,
      market_key = EXCLUDED.market_key,
      selection = EXCLUDED.selection,
      line = EXCLUDED.line,
      book = EXCLUDED.book,
      odds_decimal = EXCLUDED.odds_decimal,
      odds_american = EXCLUDED.odds_american,
      implied_probability = EXCLUDED.implied_probability,
      fair_probability = EXCLUDED.fair_probability,
      edge = EXCLUDED.edge,
      expected_value = EXCLUDED.expected_value,
      bet_url = EXCLUDED.bet_url,
      ts_updated_ms = EXCLUDED.ts_updated_ms,
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
    evs = data.get("evs", [])
    if not isinstance(evs, list):
        print(f"{json_path} must contain an 'evs' array when provided.", file=sys.stderr)
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
        connection.execute(CREATE_EV_TABLE_SQL)
        for index_sql in CREATE_EV_INDEXES_SQL:
            connection.execute(index_sql)
        for ev in evs:
            connection.execute(
                UPSERT_EV_SQL,
                {
                    "ev_id": str(ev["ev_id"]),
                    "sport": ev.get("sport"),
                    "league": ev.get("league"),
                    "event_id": ev.get("event_id") or ev.get("eventId"),
                    "event_name": ev.get("event_name") or ev.get("eventName"),
                    "start_time_ms": ev.get("start_time_ms"),
                    "market_key": ev.get("market_key"),
                    "selection": ev.get("selection"),
                    "line": decimal_or_none(ev.get("line")),
                    "book": ev.get("book"),
                    "odds_decimal": decimal_or_none(ev.get("odds_decimal")),
                    "odds_american": ev.get("odds_american"),
                    "implied_probability": decimal_or_none(ev.get("implied_probability")),
                    "fair_probability": decimal_or_none(ev.get("fair_probability")),
                    "edge": decimal_or_none(ev.get("edge")),
                    "expected_value": decimal_or_none(ev.get("expected_value")),
                    "bet_url": ev.get("bet_url"),
                    "ts_updated_ms": ev.get("ts_updated_ms"),
                    "payload_json": json.dumps(ev, separators=(",", ":")),
                },
            )

    print(f"Seeded {len(arbs)} arb rows and {len(evs)} EV rows from {json_path}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
