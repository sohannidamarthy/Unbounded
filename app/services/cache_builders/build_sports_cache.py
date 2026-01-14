from __future__ import annotations

import json
from datetime import datetime, timezone

from app.core.redis_keys import redis_keys
from app.db.session import SessionLocal
from app.redis_client import get_redis
from app.schemas.sports import SportsResponse


DEFAULT_TTL_SECONDS = 60 * 60 * 24  # 24 hours


def _build_payload(rows: list[object], ttl_seconds: int) -> dict:
    # DB model has: key, name
    data = [{"key": getattr(r, "key"), "title": getattr(r, "name")} for r in rows]

    return SportsResponse(
        data=data,
        meta={
            "generated_at": datetime.now(timezone.utc),
            "source": "redis",
            "ttl_seconds": ttl_seconds,
        },
    ).model_dump(mode="json")


async def rebuild_sports_cache(*, ttl_seconds: int = DEFAULT_TTL_SECONDS) -> int:
    """
    Postgres -> Redis cache build for /sports.
    Returns number of sports written.
    """
    from app.db.models.sports import Sport  # local import to avoid circular imports

    with SessionLocal() as db:
        rows = db.query(Sport).order_by(Sport.key.asc()).all()

    payload = _build_payload(rows, ttl_seconds)

    r = await get_redis()
    key = redis_keys.sports_all()
    await r.set(key, json.dumps(payload), ex=ttl_seconds)

    return len(rows)


async def _amain() -> None:
    n = await rebuild_sports_cache()
    print(f"rebuilt sports cache: {n} rows -> {redis_keys.sports_all()}")


if __name__ == "__main__":
    import asyncio
    asyncio.run(_amain())
