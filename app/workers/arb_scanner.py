import os
import json
import time
import hashlib
from typing import Dict, List, Tuple, Any, Optional
from app.services.audit_store import upsert_arb_latest


import redis

# -------------------------
# Config
# -------------------------
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
SPORTS = [s.strip() for s in os.getenv("ARB_SPORTS", "nba").split(",") if s.strip()]
SCAN_HORIZON_HOURS = int(os.getenv("ARB_SCAN_HORIZON_HOURS", "6"))
SCAN_SLEEP_SECONDS = float(os.getenv("ARB_SCAN_SLEEP_SECONDS", "5"))

# Staleness controls
PREGAME_STALE_MS = int(os.getenv("ARB_PREGAME_STALE_MS", str(5 * 60 * 1000)))  # 5 minutes
LIVE_STALE_MS = int(os.getenv("ARB_LIVE_STALE_MS", str(30 * 1000)))            # 30 seconds
ARB_TTL_SECONDS = int(os.getenv("ARB_TTL_SECONDS", "120"))

# Minimum ROI to publish (avoid spam)
MIN_ROI = float(os.getenv("ARB_MIN_ROI", "0.0001"))  # 0.01%

# Key patterns (must match Step 1)
ACTIVE_EVENTS_KEY = "active:events:{sport}"
EVENT_MARKETS_KEY = "event:markets:{event_id}"
ODDS_KEY = "odds:latest:{sport}:{event_id}:{market_key}:{market_instance_id}"

# Output keys
ARB_DETAIL_KEY = "arb:detail:{arb_id}"
ARB_FEED_KEY = "arbs:feed:{sport}"
ARB_UPDATES_CHANNEL = "arb_updates"


def now_ms() -> int:
    return int(time.time() * 1000)


def sha1_hex(s: str) -> str:
    return hashlib.sha1(s.encode("utf-8")).hexdigest()


def get_scan_event_ids(r: redis.Redis, sport: str) -> List[str]:
    start = now_ms()
    end = start + SCAN_HORIZON_HOURS * 60 * 60 * 1000
    key = ACTIVE_EVENTS_KEY.format(sport=sport)
    event_ids = r.zrangebyscore(key, start, end)
    return [e.decode("utf-8") if isinstance(e, (bytes, bytearray)) else str(e) for e in event_ids]


def get_event_market_instances(r: redis.Redis, event_id: str) -> List[Tuple[str, str]]:
    key = EVENT_MARKETS_KEY.format(event_id=event_id)
    members = r.smembers(key)
    out = []
    for m in members:
        s = m.decode("utf-8") if isinstance(m, (bytes, bytearray)) else str(m)
        if "|" not in s:
            continue
        market_key, market_instance_id = s.split("|", 1)
        out.append((market_key, market_instance_id))
    return out


def bulk_fetch_odds_blobs(
    r: redis.Redis, sport: str, event_ids: List[str]
) -> Tuple[List[Dict[str, Any]], Dict[str, str]]:
    keys: List[str] = []

    for event_id in event_ids:
        for market_key, market_instance_id in get_event_market_instances(r, event_id):
            keys.append(ODDS_KEY.format(
                sport=sport,
                event_id=event_id,
                market_key=market_key,
                market_instance_id=market_instance_id,
            ))

    if not keys:
        return [], {}

    values = r.mget(keys)
    blobs: List[Dict[str, Any]] = []
    errors: Dict[str, str] = {}

    for k, v in zip(keys, values):
        if v is None:
            continue
        try:
            s = v.decode("utf-8") if isinstance(v, (bytes, bytearray)) else str(v)
            blobs.append(json.loads(s))
        except Exception as e:
            errors[k] = f"json_error: {e}"

    return blobs, errors


def blobs_to_rows(blobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    for b in blobs:
        sport = b.get("sport")
        league = b.get("league")
        event_id = b.get("event_id")
        event_name = b.get("event_name")
        start_time_ms = b.get("start_time_ms")
        market_key = b.get("market_key")
        market_instance_id = b.get("market_instance_id")
        line = b.get("line")
        player_id = b.get("player_id")
        blob_ts = b.get("ts_ingested_ms")
        outcomes = b.get("outcomes", [])

        books = b.get("books", {}) or {}
        for book, book_data in books.items():
            if not isinstance(book_data, dict):
                continue
            for outcome_key in outcomes:
                leg = book_data.get(outcome_key)
                if not isinstance(leg, dict):
                    continue
                odds_decimal = leg.get("odds_decimal")
                leg_ts = leg.get("ts_ingested_ms", blob_ts)

                if odds_decimal is None or leg_ts is None:
                    continue

                rows.append({
                    "sport": sport,
                    "league": league,
                    "event_id": event_id,
                    "event_name": event_name,
                    "start_time_ms": start_time_ms,
                    "market_key": market_key,
                    "market_instance_id": market_instance_id,
                    "line": line,
                    "player_id": player_id,
                    "book": book,
                    "outcome_key": outcome_key,
                    "odds_decimal": float(odds_decimal),
                    "ts_ingested_ms": int(leg_ts),
                })
    return rows


def stale_threshold_ms(start_time_ms: Optional[int]) -> int:
    # If start_time_ms exists and event has started, use LIVE threshold; else pregame threshold.
    if start_time_ms is None:
        return PREGAME_STALE_MS
    return LIVE_STALE_MS if now_ms() >= int(start_time_ms) else PREGAME_STALE_MS


def filter_stale_rows(rows: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], int]:
    kept = []
    dropped = 0
    now = now_ms()

    # staleness based on each row's event start time
    for r in rows:
        thr = stale_threshold_ms(r.get("start_time_ms"))
        age = now - int(r["ts_ingested_ms"])
        if age <= thr:
            kept.append(r)
        else:
            dropped += 1

    return kept, dropped


def group_rows(rows: List[Dict[str, Any]]) -> Dict[Tuple[str, str, str], List[Dict[str, Any]]]:
    """
    Group key: (event_id, market_key, market_instance_id)
    """
    g: Dict[Tuple[str, str, str], List[Dict[str, Any]]] = {}
    for r in rows:
        k = (r["event_id"], r["market_key"], r["market_instance_id"])
        g.setdefault(k, []).append(r)
    return g


def best_legs_for_group(group_rows: List[Dict[str, Any]], outcomes: List[str]) -> Optional[Dict[str, Dict[str, Any]]]:
    """
    For each outcome, pick best odds_decimal across books.
    Return dict outcome -> row.
    """
    best: Dict[str, Dict[str, Any]] = {}
    for outcome in outcomes:
        candidates = [r for r in group_rows if r["outcome_key"] == outcome]
        if not candidates:
            return None
        best_row = max(candidates, key=lambda x: x["odds_decimal"])
        best[outcome] = best_row
    return best


def compute_arb(best: Dict[str, Dict[str, Any]]) -> Tuple[float, float]:
    """
    Returns (S, ROI).
    S = sum(1/di)
    ROI = 1/S - 1
    """
    inv_sum = 0.0
    for outcome, r in best.items():
        d = float(r["odds_decimal"])
        inv_sum += 1.0 / d
    S = inv_sum
    ROI = (1.0 / S) - 1.0
    return S, ROI


def build_arb_id(sport: str, event_id: str, market_key: str, market_instance_id: str, outcomes: List[str]) -> str:
    # stable across updates
    key_str = "|".join([sport, event_id, market_key, market_instance_id, ",".join(sorted(outcomes))])
    return sha1_hex(key_str)[:16]

def write_arb(r: redis.Redis, arb: Dict[str, Any]) -> None:
    sport = arb["sport"]
    arb_id = arb["arb_id"]

    detail_key = ARB_DETAIL_KEY.format(arb_id=arb_id)
    feed_key = ARB_FEED_KEY.format(sport=sport)

    score = int(arb["roi"] * 1_000_000)

    pipe = r.pipeline(transaction=False)
    pipe.set(detail_key, json.dumps(arb, separators=(",", ":")), ex=ARB_TTL_SECONDS)
    pipe.zadd(feed_key, {arb_id: score})
    pipe.expire(feed_key, ARB_TTL_SECONDS) 
    pipe.execute()

    # Week 6: notify live subscribers (Pub/Sub)
    r.publish(ARB_UPDATES_CHANNEL, json.dumps(arb, separators=(',', ':')))

    # Week 6: notify live subscribers (Pub/Sub)
    r.publish(ARB_UPDATES_CHANNEL, json.dumps(arb, separators=(",", ":")))




def main() -> None:
    r = redis.Redis.from_url(REDIS_URL, decode_responses=False)

    while True:
        t0 = time.time()
        published = 0
        stale_dropped_total = 0
        total_groups = 0

        for sport in SPORTS:
            event_ids = get_scan_event_ids(r, sport)
            blobs, errors = bulk_fetch_odds_blobs(r, sport, event_ids)
            rows = blobs_to_rows(blobs)
            rows, stale_dropped = filter_stale_rows(rows)
            stale_dropped_total += stale_dropped

            # group
            groups = group_rows(rows)
            total_groups += len(groups)

            for (event_id, market_key, market_instance_id), gr in groups.items():
                # Determine outcomes from any row in group (they all belong to same blob schema)
                # We infer from present rows to avoid extra lookups.
                outcome_set = sorted(list({x["outcome_key"] for x in gr}))
                if len(outcome_set) < 2:
                    continue

                best = best_legs_for_group(gr, outcome_set)
                if best is None:
                    continue

                S, ROI = compute_arb(best)
                if S >= 1.0:
                    continue
                if ROI < MIN_ROI:
                    continue

                # Build arb object
                any_row = gr[0]
                arb_id = build_arb_id(sport, event_id, market_key, market_instance_id, outcome_set)

                legs = []
                min_leg_ts = None
                for outcome in outcome_set:
                    row = best[outcome]
                    ts = int(row["ts_ingested_ms"])
                    min_leg_ts = ts if min_leg_ts is None else min(min_leg_ts, ts)
                    legs.append({
                        "outcome_key": outcome,
                        "book": row["book"],
                        "odds_decimal": float(row["odds_decimal"]),
                        "ts_ingested_ms": ts,
                        "line": any_row.get("line"),
                        "market_instance_id": market_instance_id,
                    })

                arb = {
                    "schema_version": 1,
                    "arb_id": arb_id,
                    "sport": sport,
                    "league": any_row.get("league"),
                    "event_id": event_id,
                    "event_name": any_row.get("event_name"),
                    "start_time_ms": any_row.get("start_time_ms"),
                    "market_key": market_key,
                    "market_instance_id": market_instance_id,
                    "line": any_row.get("line"),
                    "player_id": any_row.get("player_id"),
                    "S": S,
                    "roi": ROI,
                    "ts_updated_ms": now_ms(),
                    "ts_min_leg_ingested_ms": min_leg_ts,
                    "legs": legs,
                }

                write_arb(r, arb)
                published += 1

            if errors:
                print(f"[{sport}] JSON parse errors: {len(errors)} (showing up to 2)")
                for k in list(errors.keys())[:2]:
                    print(f"  {k} -> {errors[k]}")

            print(f"[{sport}] events={len(event_ids)} blobs={len(blobs)} rows={len(rows)} groups={len(groups)} published={published} stale_dropped={stale_dropped}")

        dt = (time.time() - t0) * 1000
        print(f"[scan] published={published} groups={total_groups} stale_dropped={stale_dropped_total} dt_ms={dt:.1f}")
        time.sleep(SCAN_SLEEP_SECONDS)


if __name__ == "__main__":
    main()
