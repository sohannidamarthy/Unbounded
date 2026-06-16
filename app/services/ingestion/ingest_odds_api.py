"""
app/services/ingestion/ingest_odds_api.py

Pulls live odds from The Odds API and writes them into Redis
using the exact key schema that arb_scanner.py expects.

Key patterns written:
  odds:latest:{sport}:{event_id}:{market_key}:{market_instance_id}  -> JSON string
  event:markets:{event_id}                                           -> Set of "market_key|market_instance_id"
  active:events:{sport}                                              -> ZSet scored by start_time_ms

Run standalone:
  python -m app.services.ingestion.ingest_odds_api
"""

from __future__ import annotations

import json
import logging
import os
import time
from typing import Any

import httpx
import redis

ODDS_API_KEY        = os.getenv("ODDS_API_KEY", "")
BASE_URL            = os.getenv("ODDS_PROVIDER_BASE_URL", "https://api.the-odds-api.com")
MAX_RETRIES         = int(os.getenv("ODDS_PROVIDER_MAX_RETRIES", "5"))
REDIS_URL           = os.getenv("REDIS_URL", "redis://redis:6379/0")
POLL_INTERVAL_SEC   = int(os.getenv("ODDS_POLL_INTERVAL_SEC", str(8 * 60)))
ODDS_TTL_SEC        = int(os.getenv("ODDS_TTL_SEC", str(12 * 60)))
EVENT_TTL_SEC       = int(os.getenv("ODDS_EVENT_TTL_SEC", str(24 * 3600)))

SPORTS_MAP: dict[str, str] = {
    "nba":        "basketball_nba",
    "nfl":        "americanfootball_nfl",
    "mlb":        "baseball_mlb",
    "nhl":        "icehockey_nhl",
    "ncaafb":     "americanfootball_ncaaf",
    "ncaamb":     "basketball_ncaab",
    "mls":        "soccer_usa_mls",
    "epl":        "soccer_epl",
    "serie_a":    "soccer_italy_serie_a",
    "bundesliga": "soccer_germany_bundesliga",
    "ligue_1":    "soccer_france_ligue_one",
    "la_liga":    "soccer_spain_la_liga",
}

MARKETS = "h2h,spreads,totals"

MARKET_KEY_MAP = {
    "h2h":     "moneyline",
    "spreads":  "spread",
    "totals":   "total",
}

ODDS_KEY          = "odds:latest:{sport}:{event_id}:{market_key}:{market_instance_id}"
EVENT_MARKETS_KEY = "event:markets:{event_id}"
ACTIVE_EVENTS_KEY = "active:events:{sport}"

logger = logging.getLogger(__name__)

def now_ms() -> int:
    return int(time.time() * 1000)


def stable_event_id(sport: str, api_event_id: str) -> str:
    return f"{sport}_{api_event_id}"


def market_instance_id(market_key: str, line: float | None) -> str:
    if line is not None:
        return f"{market_key}:{line}"
    return market_key


def _decimal_to_american(decimal: float) -> int | None:
    if decimal <= 1.0:
        return None
    if decimal >= 2.0:
        return int(round((decimal - 1) * 100))
    else:
        return int(round(-100 / (decimal - 1)))


def _extract_line(mid: str) -> float | None:
    parts = mid.split(":", 1)
    if len(parts) == 2:
        try:
            return float(parts[1])
        except ValueError:
            pass
    return None


def fetch_odds(sport_key: str, retries: int = MAX_RETRIES) -> list[dict[str, Any]]:
    url = f"{BASE_URL}/v4/sports/{sport_key}/odds"
    params = {
        "apiKey":     ODDS_API_KEY,
        "regions":    "us",
        "markets":    MARKETS,
        "oddsFormat": "decimal",
        "dateFormat": "unix",
    }
    for attempt in range(1, retries + 1):
        try:
            with httpx.Client(timeout=15.0) as client:
                resp = client.get(url, params=params)
            if resp.status_code == 200:
                remaining = resp.headers.get("x-requests-remaining", "?")
                used = resp.headers.get("x-requests-used", "?")
                logger.info("[odds_api] sport=%s events=%d requests_used=%s remaining=%s",
                            sport_key, len(resp.json()), used, remaining)
                return resp.json()
            if resp.status_code == 422:
                logger.info("[odds_api] sport=%s off-season (422)", sport_key)
                return []
            if resp.status_code == 429:
                wait = 2 ** attempt
                logger.warning("[odds_api] rate-limited, sleeping %ds", wait)
                time.sleep(wait)
                continue
            logger.error("[odds_api] HTTP %d for sport=%s", resp.status_code, sport_key)
            return []
        except httpx.RequestError as exc:
            wait = 2 ** attempt
            logger.warning("[odds_api] request error attempt %d/%d: %s - retry in %ds",
                           attempt, retries, exc, wait)
            time.sleep(wait)
    logger.error("[odds_api] all %d retries exhausted for sport=%s", retries, sport_key)
    return []


def transform_event(event: dict[str, Any], sport_slug: str) -> list[tuple]:
    api_event_id  = event.get("id", "")
    home_team     = event.get("home_team", "")
    away_team     = event.get("away_team", "")
    event_name    = f"{away_team} @ {home_team}"
    commence_time = event.get("commence_time")
    start_time_ms = int(commence_time) * 1000 if commence_time else now_ms()
    league        = event.get("sport_title", sport_slug.upper())
    event_id      = stable_event_id(sport_slug, api_event_id)
    ts_now        = now_ms()

    grouped: dict[tuple[str, str], dict[str, dict[str, dict[str, Any]]]] = {}

    for bm in (event.get("bookmakers") or []):
        book = bm.get("key", "").lower()
        if not book:
            continue
        for mkt in (bm.get("markets") or []):
            api_market_key      = mkt.get("key", "")
            internal_market_key = MARKET_KEY_MAP.get(api_market_key)
            if not internal_market_key:
                continue
            outcomes_list = mkt.get("outcomes") or []
            last_update   = mkt.get("last_update")
            line: float | None = None
            for oc in outcomes_list:
                pt = oc.get("point")
                if pt is not None:
                    line = float(pt)
                    break
            mid = market_instance_id(internal_market_key, line)
            key = (internal_market_key, mid)
            if key not in grouped:
                grouped[key] = {}
            if book not in grouped[key]:
                grouped[key][book] = {}
            for oc in outcomes_list:
                outcome_name  = oc.get("name", "").lower().replace(" ", "_")
                odds_decimal  = oc.get("price")
                odds_american = _decimal_to_american(float(odds_decimal)) if odds_decimal else None
                bet_url       = oc.get("link")
                leg_ts        = int(last_update) * 1000 if last_update else ts_now
                grouped[key][book][outcome_name] = {
                    "odds_decimal":   float(odds_decimal) if odds_decimal else None,
                    "odds_american":  odds_american,
                    "bet_url":        bet_url,
                    "ts_ingested_ms": leg_ts,
                }

    results = []
    for (internal_market_key, mid), books_data in grouped.items():
        all_outcomes: set[str] = set()
        for book_outcomes in books_data.values():
            all_outcomes.update(book_outcomes.keys())
        blob = {
            "schema_version":     1,
            "sport":              sport_slug,
            "league":             league,
            "event_id":           event_id,
            "event_name":         event_name,
            "start_time_ms":      start_time_ms,
            "market_key":         internal_market_key,
            "market_instance_id": mid,
            "line":               _extract_line(mid),
            "player_id":          None,
            "ts_ingested_ms":     ts_now,
            "outcomes":           sorted(list(all_outcomes)),
            "books":              books_data,
        }
        redis_key = ODDS_KEY.format(
            sport=sport_slug, event_id=event_id,
            market_key=internal_market_key, market_instance_id=mid,
        )
        em_key    = EVENT_MARKETS_KEY.format(event_id=event_id)
        em_member = f"{internal_market_key}|{mid}"
        results.append((redis_key, em_key, em_member, blob, event_id, start_time_ms))
    return results


def write_to_redis(r: redis.Redis, sport_slug: str, events: list[dict[str, Any]]) -> int:
    pipe = r.pipeline(transaction=False)
    blobs_written = 0
    active_events: dict[str, int] = {}

    for event in events:
        for (redis_key, em_key, em_member, blob, event_id, start_time_ms) in transform_event(event, sport_slug):
            pipe.set(redis_key, json.dumps(blob, separators=(",", ":")), ex=ODDS_TTL_SEC)
            pipe.sadd(em_key, em_member)
            pipe.expire(em_key, EVENT_TTL_SEC)
            blobs_written += 1
            active_events[event_id] = start_time_ms

    ae_key = ACTIVE_EVENTS_KEY.format(sport=sport_slug)
    if active_events:
        pipe.zadd(ae_key, {eid: score for eid, score in active_events.items()})
        pipe.expire(ae_key, EVENT_TTL_SEC)

    pipe.execute()
    return blobs_written


def run_once(r: redis.Redis) -> None:
    t0 = time.time()
    total_blobs = 0
    for sport_slug, sport_key in SPORTS_MAP.items():
        events = fetch_odds(sport_key)
        if not events:
            continue
        blobs = write_to_redis(r, sport_slug, events)
        total_blobs += blobs
        logger.info("[ingest] sport=%-10s events=%d blobs=%d", sport_slug, len(events), blobs)
    dt = (time.time() - t0) * 1000
    logger.info("[ingest] cycle complete total_blobs=%d dt_ms=%.1f", total_blobs, dt)


def run_loop() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)-8s %(message)s",
        datefmt="%H:%M:%S",
    )
    if not ODDS_API_KEY:
        raise RuntimeError("ODDS_API_KEY is not set — check your .env file")
    r = redis.Redis.from_url(REDIS_URL, decode_responses=False)
    logger.info("[ingest] starting — poll_interval=%ds sports=%s",
                POLL_INTERVAL_SEC, list(SPORTS_MAP.keys()))
    while True:
        try:
            run_once(r)
        except Exception:
            logger.exception("[ingest] unexpected error in run_once — continuing")
        time.sleep(POLL_INTERVAL_SEC)


if __name__ == "__main__":
    run_loop()

