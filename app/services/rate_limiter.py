from __future__ import annotations

from dataclasses import dataclass

from app.redis_client import get_redis


_LUA_INCR_EXPIRE = """
local key = KEYS[1]
local ttl = tonumber(ARGV[1])

local v = redis.call('INCR', key)
if v == 1 then
  redis.call('EXPIRE', key, ttl)
end
return v
"""


@dataclass(frozen=True)
class Limit:
    max_requests: int
    window_seconds: int


class RateLimitExceeded(Exception):
    def __init__(self, *, window_seconds: int, max_requests: int, current: int) -> None:
        self.window_seconds = window_seconds
        self.max_requests = max_requests
        self.current = current
        super().__init__(f"Rate limit exceeded: {current}/{max_requests} in {window_seconds}s")


async def _hit(key: str, window_seconds: int) -> int:
    r = await get_redis()
    return int(await r.eval(_LUA_INCR_EXPIRE, 1, key, window_seconds))


async def enforce_limits(*, key_prefix: str, limits: list[Limit]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for lim in limits:
        key = f"{key_prefix}:{lim.window_seconds}"
        current = await _hit(key, lim.window_seconds)
        counts[str(lim.window_seconds)] = current
        if current > lim.max_requests:
            raise RateLimitExceeded(window_seconds=lim.window_seconds, max_requests=lim.max_requests, current=current)
    return counts
