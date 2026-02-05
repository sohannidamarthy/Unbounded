from __future__ import annotations

import asyncio
import redis.asyncio as redis

from app.core.config import settings

_redis: redis.Redis | None = None
_loop: asyncio.AbstractEventLoop | None = None


async def get_redis() -> redis.Redis:
    global _redis, _loop

    loop = asyncio.get_running_loop()

    # Create client if missing OR if we are now on a different event loop
    if _redis is None or _loop is None or _loop is not loop:
        # Best-effort close of old client (might be bound to a dead loop)
        if _redis is not None:
            try:
                await _redis.close()
            except Exception:
                pass

        _loop = loop
        _redis = redis.from_url(
            str(settings.redis_url),
            decode_responses=True,  # we store JSON strings
            health_check_interval=30,
        )

    return _redis


async def close_redis() -> None:
    global _redis, _loop
    if _redis is not None:
        try:
            await _redis.close()
        except Exception:
            pass
    _redis = None
    _loop = None
