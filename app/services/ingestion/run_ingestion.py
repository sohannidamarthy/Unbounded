from __future__ import annotations

import os
import asyncio
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.core.logger import log_event
from app.services.provider_client import ProviderClient
from app.services.normalizers.odds_api_normalizer import normalize_odds_api_response
from app.services.snapshots.write_snapshots import write_snapshots
from app.services.snapshots.rebuild_redis_from_snapshots import rebuild_redis_latest_odds


async def run_ingestion_once(
    *,
    client: ProviderClient,
    sport_key: str,
    regions: List[str],
    markets: List[str],
    since_minutes_for_redis_rebuild: int = 180,
) -> Dict[str, Any]:
    started_at = datetime.now(timezone.utc)
    log_event(
        "ingestion.start",
        sport_key=sport_key,
        regions=regions,
        markets=markets,
        started_at_utc=started_at,
    )

    status = "success"
    error_message: Optional[str] = None

    try:
        # 1) Provider fetch
        raw, meta = await client.fetch_odds(
            sport_key=sport_key,
            regions=regions,
            markets=markets,
        )

        log_event(
            "ingestion.provider_response",
            sport_key=sport_key,
            status_code=meta.status_code,
            duration_ms=meta.duration_ms,
            attempt_count=meta.attempt_count,
        )

        # 2) Normalize
        normalized = normalize_odds_api_response(provider=meta.provider, raw=raw)

        # 3) Write snapshots
        snap_result = write_snapshots(
            normalized_events=normalized,
            fetched_at_utc=meta.fetched_at_utc,
        )

        # 4) Rebuild Redis latest cache
        redis_result = await rebuild_redis_latest_odds(
            since_minutes=since_minutes_for_redis_rebuild,
            sport_key=sport_key,
            league=sport_key.upper(),
        )

        ended_at = datetime.now(timezone.utc)

        summary = {
            "sport_key": sport_key,
            "events_count": len(normalized),
            "odds_rows_inserted": snap_result["inserted"],
            "redis_writes": redis_result.get("redis_writes", 0),
            "provider_status_code": meta.status_code,
            "provider_duration_ms": meta.duration_ms,
            "started_at_utc": started_at,
            "ended_at_utc": ended_at,
            "elapsed_ms": int((ended_at - started_at).total_seconds() * 1000),
            "status": status,
        }

        log_event("ingestion.summary", **summary)
        return summary

    except Exception as exc:
        status = "fail"
        error_message = str(exc)
        ended_at = datetime.now(timezone.utc)

        log_event(
            "ingestion.error",
            sport_key=sport_key,
            status=status,
            error_message=error_message,
            ended_at_utc=ended_at,
            elapsed_ms=int((ended_at - started_at).total_seconds() * 1000),
        )
        raise


async def _amain() -> Dict[str, Any]:
    # Defaults (override via docker-compose environment)
    sport_key = os.getenv("INGEST_SPORT_KEY", "nba")
    regions = [r.strip() for r in os.getenv("INGEST_REGIONS", "us").split(",") if r.strip()]
    markets = [m.strip() for m in os.getenv("INGEST_MARKETS", "h2h,spreads,totals").split(",") if m.strip()]
    since_minutes = int(os.getenv("INGEST_REDIS_REBUILD_SINCE_MIN", "180"))

    provider_name = os.getenv("PROVIDER_NAME", "oddsapi")
    base_url = os.getenv("PROVIDER_BASE_URL", "https://api.the-odds-api.com")
    api_key = os.getenv("ODDS_API_KEY", "")

    if not api_key:
        raise RuntimeError("ODDS_API_KEY missing")

    client = ProviderClient(provider_name=provider_name, base_url=base_url, api_key=api_key)
    await client.aopen()
    try:
        return await run_ingestion_once(
            client=client,
            sport_key=sport_key,
            regions=regions,
            markets=markets,
            since_minutes_for_redis_rebuild=since_minutes,
        )
    finally:
        await client.aclose()


if __name__ == "__main__":
    asyncio.run(_amain())


