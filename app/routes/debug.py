from fastapi import APIRouter, Body
import time
from typing import Any, Dict

from app.redis_client import get_redis
from app.services.odds_cache import upsert_odds, get_odds, get_odds_ts, is_stale
from app.services.arbs_cache import upsert_arb, get_top_arbs, get_arb
from fastapi import Depends
from app.deps.provider import get_provider_client
from app.services.provider_client import ProviderClient
from fastapi import Depends
from app.deps.provider import get_provider_client
from app.services.provider_client import ProviderClient
from app.services.normalizers.odds_api_normalizer import normalize_odds_api_response
from app.services.snapshots.write_snapshots import write_snapshots
from app.services.normalizers.odds_api_normalizer import normalize_odds_api_response
from app.deps.provider import get_provider_client
from app.services.provider_client import ProviderClient
from fastapi import Depends
from app.services.snapshots.rebuild_redis_from_snapshots import rebuild_redis_latest_odds
from app.services.ingestion.run_ingestion import run_ingestion_once
from fastapi import Depends
from app.deps.provider import get_provider_client
from app.services.provider_client import ProviderClient
from app.services.odds_readthrough import get_odds_readthrough
from uuid import UUID
from fastapi import Depends
from app.db.deps import get_db
from app.services.odds_readthrough import get_odds_readthrough




router = APIRouter(prefix="/debug", tags=["debug"])

@router.get("/redis")
async def debug_redis():
    r = await get_redis()
    now = int(time.time())
    key = "debug:redis"
    await r.set(key, f"pong:{now}", ex=30)
    return {"ok": True, "value": await r.get(key), "ttl": await r.ttl(key)}

@router.post("/odds/{event_id}/{market}/{book}")
async def debug_set_odds(
    event_id: str,
    market: str,
    book: str,
    payload: Dict[str, Any] = Body(...),
):
    await upsert_odds(event_id=event_id, market=market, book=book, payload=payload)
    return {"ok": True}

@router.get("/odds/{event_id}/{market}")
async def debug_get_odds(event_id: str, market: str):
    odds = await get_odds(event_id, market)
    ts = await get_odds_ts(event_id, market)
    stale = await is_stale(event_id, market, max_age_seconds=60)
    return {"event_id": event_id, "market": market, "ts": ts, "stale": stale, "odds": odds}

# ---- Arb debug (Step C scaffold) ----
@router.post("/arb/{sport}/{arb_id}")
async def debug_set_arb(
    sport: str,
    arb_id: str,
    roi: float,
    payload: Dict[str, Any] = Body(...),
):
    await upsert_arb(sport=sport, arb_id=arb_id, roi=roi, payload=payload, ttl_seconds=120)
    return {"ok": True}

@router.get("/arbs/{sport}")
async def debug_get_top_arbs(sport: str, limit: int = 25):
    return await get_top_arbs(sport=sport, limit=limit)

@router.get("/arb/{arb_id}")
async def debug_get_arb(arb_id: str):
    arb = await get_arb(arb_id)
    if arb is None:
        return {"ok": False, "reason": "not_found"}
    return {"ok": True, "arb": arb}

@router.get("/provider/odds")
async def debug_provider_odds(
    sport_key: str = "basketball_nba",
    client: ProviderClient = Depends(get_provider_client),
):
    raw, meta = await client.fetch_odds(
        sport_key=sport_key,
        regions=["us"],
        markets=["h2h", "spreads", "totals"],
    )

    return {
        "meta": {
            "provider": meta.provider,
            "status_code": meta.status_code,
            "duration_ms": meta.duration_ms,
            "attempt_count": meta.attempt_count,
            "fetched_at_utc": meta.fetched_at_utc.isoformat(),
            "url": meta.url,
        },
        "raw_sample": raw[:1] if isinstance(raw, list) else raw,
    }
@router.get("/normalize/odds")
async def debug_normalize_odds(
    sport_key: str = "basketball_nba",
    client: ProviderClient = Depends(get_provider_client),
):
    raw, meta = await client.fetch_odds(
        sport_key=sport_key,
        regions=["us"],
        markets=["h2h", "spreads", "totals"],
    )

    events = normalize_odds_api_response(provider=meta.provider, raw=raw)

    # Return a small sample (normalized) to keep response size manageable
    sample = events[:1]
    sample_payload = []
    for e in sample:
        sample_payload.append(
            {
                "event": {
                    "provider": e.provider,
                    "provider_event_id": e.provider_event_id,
                    "sport_key": e.sport_key,
                    "commence_time_utc": e.commence_time_utc.isoformat(),
                    "home_team": e.home_team,
                    "away_team": e.away_team,
                    "book_count": len(e.books),
                },
                "books_sample": [
                    {
                        "book_key": b.book_key,
                        "last_update_utc": b.last_update_utc.isoformat(),
                        "markets_sample": [
                            {
                                "market_type": m.market_type,
                                "line": m.line,
                                "outcomes": [
                                    {
                                        "outcome_key": o.outcome_key,
                                        "label": o.label,
                                        "price_decimal": o.price_decimal,
                                        "point": o.point,
                                    }
                                    for o in m.outcomes
                                ],
                            }
                            for m in b.markets[:2]
                        ],
                    }
                    for b in e.books[:2]
                ],
            }
        )

    return {
        "meta": {
            "status_code": meta.status_code,
            "duration_ms": meta.duration_ms,
            "attempt_count": meta.attempt_count,
            "fetched_at_utc": meta.fetched_at_utc.isoformat(),
        },
        "counts": {
            "raw_events": len(raw) if isinstance(raw, list) else None,
            "normalized_events": len(events),
            "normalized_books_total": sum(len(e.books) for e in events),
        },
        "sample": sample_payload,
    }
@router.post("/snapshots/fetch-and-write")
async def debug_fetch_and_write_snapshots(
    sport_key: str = "basketball_nba",
    client: ProviderClient = Depends(get_provider_client),
):
    raw, meta = await client.fetch_odds(
        sport_key=sport_key,
        regions=["us"],
        markets=["h2h", "spreads", "totals"],
    )

    normalized = normalize_odds_api_response(
        provider=meta.provider,
        raw=raw,
    )

    result = write_snapshots(
        normalized_events=normalized,
        fetched_at_utc=meta.fetched_at_utc,
    )

    return {
        "status": "ok",
        "events": len(normalized),
        "snapshots_inserted": result["inserted"],
    }
@router.post("/redis/rebuild-latest-odds")
async def debug_rebuild_latest_odds(since_minutes: int = 120):
    result = await rebuild_redis_latest_odds(since_minutes=since_minutes)
    return {"ok": True, **result}
@router.post("/ingestion/run")
async def debug_run_ingestion(
    sport_key: str = "basketball_nba",
    client: ProviderClient = Depends(get_provider_client),
):
    return await run_ingestion_once(
        client=client,
        sport_key=sport_key,
        regions=["us"],
        markets=["h2h", "spreads", "totals"],
    )
@router.get("/odds_fallback/{event_id}/{market_id}")
async def debug_get_odds_fallback(event_id: UUID, market_id: UUID, db=Depends(get_db)):
    odds = await get_odds_readthrough(db, event_id=event_id, market_id=market_id)
    return {"event_id": str(event_id), "market_id": str(market_id), "odds": odds}



