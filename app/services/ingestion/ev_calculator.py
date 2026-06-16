"""
app/services/ingestion/ev_calculator.py

Reads odds blobs from Redis, computes positive EV for each outcome
using a no-vig fair probability model, and upserts results into ev_latest.

Runs as a standalone loop after ingest_odds_api.py has populated Redis.

Run standalone:
  python -m app.services.ingestion.ev_calculator
"""

from __future__ import annotations

import hashlib
import json
import logging
import os
import time
from decimal import Decimal
from typing import Any, Optional

import redis
from sqlalchemy import text

from app.db.session import SessionLocal

REDIS_URL         = os.getenv("REDIS_URL", "redis://redis:6379/0")
SCAN_SLEEP_SEC    = int(os.getenv("EV_SCAN_SLEEP_SEC", "30"))
SCAN_HORIZON_HOURS = int(os.getenv("EV_SCAN_HORIZON_HOURS", "12"))
MIN_EDGE          = float(os.getenv("EV_MIN_EDGE", "0.02"))
SPORTS            = [s.strip() for s in os.getenv("ARB_SPORTS", "nba,nfl,mlb,nhl,ncaafb,ncaamb,mls,epl,serie_a,bundesliga,ligue_1,la_liga").split(",") if s.strip()]

ACTIVE_EVENTS_KEY = "active:events:{sport}"
EVENT_MARKETS_KEY = "event:markets:{event_id}"
ODDS_KEY          = "odds:latest:{sport}:{event_id}:{market_key}:{market_instance_id}"

logger = logging.getLogger(__name__)


UPSERT_EV_LATEST = """
INSERT INTO ev_latest (
  ev_id, sport, league, event_id, event_name, start_time_ms,
  market_key, selection, line, book, odds_decimal, odds_american,
  implied_probability, fair_probability, edge, expected_value,
  bet_url, ts_updated_ms, payload_json
)
VALUES (
  :ev_id, :sport, :league, :event_id, :event_name, :start_time_ms,
  :market_key, :selection, :line, :book, :odds_decimal, :odds_american,
  :implied_probability, :fair_probability, :edge, :expected_value,
  :bet_url, :ts_updated_ms, CAST(:payload_json AS jsonb)
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


def now_ms() -> int:
    return int(time.time() * 1000)


def sha1_hex(s: str) -> str:
    return hashlib.sha1(s.encode("utf-8")).hexdigest()


def ev_id(event_id: str, market_key: str, selection: str, book: str) -> str:
    key_str = "|".join([event_id, market_key, selection, book])
    return sha1_hex(key_str)[:24]


def no_vig_fair_probs(implied: dict[str, float]) -> dict[str, float]:
    """
    Remove the vig from implied probabilities using the standard
    normalization method: divide each implied prob by the overround.
    """
    total = sum(implied.values())
    if total <= 0:
        return {}
    return {outcome: prob / total for outcome, prob in implied.items()}


def best_implied_probs(blob: dict[str, Any]) -> dict[str, float]:
    """
    For each outcome, find the best (highest) odds across all books
    and convert to implied probability. Used as the sharp line.
    """
    outcomes = blob.get("outcomes") or []
    books = blob.get("books") or {}
    best_odds: dict[str, float] = {}

    for outcome in outcomes:
        for book_data in books.values():
            leg = book_data.get(outcome)
            if not isinstance(leg, dict):
                continue
            d = leg.get("odds_decimal")
            if d is None:
                continue
            d = float(d)
            if d <= 1:
                continue
            if outcome not in best_odds or d > best_odds[outcome]:
                best_odds[outcome] = d

    return {outcome: 1.0 / odds for outcome, odds in best_odds.items() if odds > 0}


def compute_ev_rows(blob: dict[str, Any]) -> list[dict[str, Any]]:
    """
    For each book x outcome combination, compute edge and EV.
    Returns list of EV row dicts ready for DB upsert.
    """
    outcomes = blob.get("outcomes") or []
    books    = blob.get("books") or {}
    if len(outcomes) < 2:
        return []

    implied = best_implied_probs(blob)
    if len(implied) < 2:
        return []

    fair = no_vig_fair_probs(implied)
    if not fair:
        return []

    sport        = blob.get("sport", "")
    league       = blob.get("league", "")
    event_id     = blob.get("event_id", "")
    event_name   = blob.get("event_name", "")
    start_time_ms = blob.get("start_time_ms")
    market_key   = blob.get("market_key", "")
    line         = blob.get("line")
    ts_now       = now_ms()

    rows = []
    for book, book_data in books.items():
        if not isinstance(book_data, dict):
            continue
        for outcome in outcomes:
            leg = book_data.get(outcome)
            if not isinstance(leg, dict):
                continue
            odds_decimal = leg.get("odds_decimal")
            if odds_decimal is None:
                continue
            odds_decimal = float(odds_decimal)
            if odds_decimal <= 1:
                continue

            fair_prob        = fair.get(outcome)
            if fair_prob is None or fair_prob <= 0:
                continue

            implied_prob     = 1.0 / odds_decimal
            edge             = fair_prob - implied_prob
            expected_value   = (fair_prob * (odds_decimal - 1)) - (1 - fair_prob)

            if edge < MIN_EDGE:
                continue

            odds_american    = leg.get("odds_american")
            bet_url          = leg.get("bet_url")

            eid = ev_id(event_id, market_key, outcome, book)

            payload = {
                "ev_id":              eid,
                "sport":              sport,
                "league":             league,
                "event_id":           event_id,
                "event_name":         event_name,
                "start_time_ms":      start_time_ms,
                "market_key":         market_key,
                "selection":          outcome,
                "line":               line,
                "book":               book,
                "odds_decimal":       odds_decimal,
                "odds_american":      odds_american,
                "implied_probability": implied_prob,
                "fair_probability":   fair_prob,
                "edge":               edge,
                "expected_value":     expected_value,
                "bet_url":            bet_url,
                "ts_updated_ms":      ts_now,
            }
            rows.append(payload)

    return rows


def upsert_ev_rows(rows: list[dict[str, Any]]) -> int:
    if not rows:
        return 0
    db = SessionLocal()
    try:
        for row in rows:
            db.execute(
                text(UPSERT_EV_LATEST),
                {
                    "ev_id":              row["ev_id"],
                    "sport":              row["sport"],
                    "league":             row["league"],
                    "event_id":           row["event_id"],
                    "event_name":         row["event_name"],
                    "start_time_ms":      row["start_time_ms"],
                    "market_key":         row["market_key"],
                    "selection":          row["selection"],
                    "line":               row["line"],
                    "book":               row["book"],
                    "odds_decimal":       row["odds_decimal"],
                    "odds_american":      row["odds_american"],
                    "implied_probability": row["implied_probability"],
                    "fair_probability":   row["fair_probability"],
                    "edge":               row["edge"],
                    "expected_value":     row["expected_value"],
                    "bet_url":            row["bet_url"],
                    "ts_updated_ms":      row["ts_updated_ms"],
                    "payload_json":       json.dumps(row, separators=(",", ":"), default=str),
                },
            )
        db.commit()
        return len(rows)
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def get_event_ids(r: redis.Redis, sport: str) -> list[str]:
    now = now_ms()
    end = now + SCAN_HORIZON_HOURS * 60 * 60 * 1000
    key = ACTIVE_EVENTS_KEY.format(sport=sport)
    ids = r.zrangebyscore(key, now, end)
    return [e.decode("utf-8") if isinstance(e, (bytes, bytearray)) else str(e) for e in ids]


def get_market_instances(r: redis.Redis, event_id: str) -> list[tuple[str, str]]:
    key = EVENT_MARKETS_KEY.format(event_id=event_id)
    members = r.smembers(key)
    out = []
    for m in members:
        s = m.decode("utf-8") if isinstance(m, (bytes, bytearray)) else str(m)
        if "|" not in s:
            continue
        market_key, mid = s.split("|", 1)
        out.append((market_key, mid))
    return out


def run_once(r: redis.Redis) -> None:
    t0 = time.time()
    total_ev = 0

    for sport in SPORTS:
        event_ids = get_event_ids(r, sport)
        sport_ev = 0

        for event_id in event_ids:
            markets = get_market_instances(r, event_id)
            keys = [
                ODDS_KEY.format(sport=sport, event_id=event_id,
                                market_key=mk, market_instance_id=mid)
                for mk, mid in markets
            ]
            if not keys:
                continue

            values = r.mget(keys)
            for raw in values:
                if raw is None:
                    continue
                try:
                    s = raw.decode("utf-8") if isinstance(raw, (bytes, bytearray)) else str(raw)
                    blob = json.loads(s)
                except Exception:
                    continue

                rows = compute_ev_rows(blob)
                if not rows:
                    continue

                try:
                    written = upsert_ev_rows(rows)
                    sport_ev += written
                except Exception as e:
                    logger.error("[ev] db upsert failed: %s", e)

        total_ev += sport_ev
        if sport_ev:
            logger.info("[ev] sport=%-10s ev_rows=%d", sport, sport_ev)

    dt = (time.time() - t0) * 1000
    logger.info("[ev] cycle complete total_ev=%d dt_ms=%.1f", total_ev, dt)


def run_loop() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)-8s %(message)s",
        datefmt="%H:%M:%S",
    )
    r = redis.Redis.from_url(REDIS_URL, decode_responses=False)
    logger.info("[ev] starting — sleep=%ds sports=%s", SCAN_SLEEP_SEC, SPORTS)
    while True:
        try:
            run_once(r)
        except Exception:
            logger.exception("[ev] unexpected error — continuing")
        time.sleep(SCAN_SLEEP_SEC)


if __name__ == "__main__":
    run_loop()

