"""Redis-backed fixed-window rate limiting, used as a FastAPI dependency.

Counters live in Redis so limits are shared across serverless instances.
If Redis is unavailable the limiter fails open (requests are allowed)."""

import json
import logging

from fastapi import HTTPException, Request, status

from app.redis_client import get_redis

logger = logging.getLogger(__name__)


def client_ip(request: Request) -> str:
    # Behind Vercel/proxies the real client is the first X-Forwarded-For entry.
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


async def _hit(key: str, limit: int, window_seconds: int) -> None:
    try:
        r = await get_redis()
        count = await r.incr(key)
        if count == 1:
            await r.expire(key, window_seconds)
        if count > limit:
            retry_after = await r.ttl(key)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
                headers={"Retry-After": str(max(retry_after, 1))},
            )
    except HTTPException:
        raise
    except Exception:
        logger.exception("Rate limiter unavailable; allowing request.")


def rate_limit(
    scope: str,
    *,
    ip_limit: int,
    window_seconds: int,
    email_limit: int | None = None,
):
    """Limit a route per client IP and, optionally, per `email` in the JSON body."""

    async def dependency(request: Request) -> None:
        await _hit(f"rl:{scope}:ip:{client_ip(request)}", ip_limit, window_seconds)

        if email_limit is not None:
            try:
                body = json.loads(await request.body())
                email = str(body.get("email", "")).strip().lower()
            except Exception:
                email = ""
            if email:
                await _hit(f"rl:{scope}:email:{email}", email_limit, window_seconds)

    return dependency
