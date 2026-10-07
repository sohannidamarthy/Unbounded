"""Redis-backed fixed-window rate limiting, used as a FastAPI dependency.

Counters live in Redis so limits are shared across serverless instances.
If Redis is unavailable the limiter fails open (requests are allowed)."""

import json
import logging

from fastapi import HTTPException, Request, status

from app.redis_client import get_redis

logger = logging.getLogger(__name__)

MAX_EMAIL_LENGTH = 254

# Atomically increment a counter and make sure it always has a TTL, so a crash
# between INCR and EXPIRE can never leave a key that blocks a client forever.
_INCR_SCRIPT = """
local count = redis.call('INCR', KEYS[1])
local ttl = redis.call('TTL', KEYS[1])
if count == 1 or ttl < 0 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return {count, ttl}
"""


def client_ip(request: Request) -> str:
    # Behind Vercel/proxies the real client is the first X-Forwarded-For entry.
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _normalize_email(value: object) -> str:
    return str(value or "").strip().lower()[:MAX_EMAIL_LENGTH]


def _too_many(retry_after: int) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail="Too many requests. Please try again later.",
        headers={"Retry-After": str(max(retry_after, 1))},
    )


async def _hit(key: str, limit: int, window_seconds: int) -> None:
    try:
        r = await get_redis()
        count, ttl = await r.eval(_INCR_SCRIPT, 1, key, window_seconds)
        if count > limit:
            raise _too_many(ttl)
    except HTTPException:
        raise
    except Exception:
        logger.exception("Rate limiter unavailable; allowing request.")


class FailureLimiter:
    """Counts only failed attempts for one (scope, email, IP) combination."""

    def __init__(self, key: str, limit: int, window_seconds: int):
        self.key = key
        self.limit = limit
        self.window_seconds = window_seconds

    async def check(self) -> None:
        """Reject the request if there were already too many failures."""
        try:
            r = await get_redis()
            count = int(await r.get(self.key) or 0)
            if count >= self.limit:
                raise _too_many(await r.ttl(self.key))
        except HTTPException:
            raise
        except Exception:
            logger.exception("Rate limiter unavailable; allowing request.")

    async def fail(self) -> None:
        try:
            r = await get_redis()
            await r.eval(_INCR_SCRIPT, 1, self.key, self.window_seconds)
        except Exception:
            logger.exception("Rate limiter unavailable; failure not recorded.")

    async def reset(self) -> None:
        try:
            r = await get_redis()
            await r.delete(self.key)
        except Exception:
            logger.exception("Rate limiter unavailable; failure count not reset.")


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
                email = _normalize_email(body.get("email"))
            except Exception:
                email = ""
            if email:
                await _hit(f"rl:{scope}:email:{email}", email_limit, window_seconds)

    return dependency


def failure_limit(
    scope: str,
    *,
    limit: int,
    window_seconds: int,
):
    """Dependency returning a FailureLimiter keyed on the body `email` + client IP.

    The route calls `fail()` on a bad attempt and `reset()` on success. The check
    runs before the route, so a blocked client gets a 429 immediately."""

    async def dependency(request: Request) -> FailureLimiter:
        try:
            body = json.loads(await request.body())
            email = _normalize_email(body.get("email"))
        except Exception:
            email = ""
        limiter = FailureLimiter(
            f"rl:{scope}:fail:{client_ip(request)}:{email}", limit, window_seconds
        )
        await limiter.check()
        return limiter

    return dependency
