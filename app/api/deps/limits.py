from __future__ import annotations

from fastapi import Depends, HTTPException, status

from app.core.config import settings
from app.core.principal import Principal
from app.api.deps.auth import get_current_principal
from app.services.rate_limiter import Limit, enforce_limits, RateLimitExceeded


def _limits_for_plan(plan: str) -> list[Limit]:
    p = (plan or "FREE").upper()

    if p == "ELITE":
        return [
            Limit(max_requests=settings.limit_paid_burst_10s * 2, window_seconds=10),
            Limit(max_requests=settings.limit_paid_rpm * 2, window_seconds=60),
        ]
    if p == "PRO":
        return [
            Limit(max_requests=settings.limit_paid_burst_10s, window_seconds=10),
            Limit(max_requests=settings.limit_paid_rpm, window_seconds=60),
        ]
    return [
        Limit(max_requests=settings.limit_free_burst_10s, window_seconds=10),
        Limit(max_requests=settings.limit_free_rpm, window_seconds=60),
    ]


def rate_limit(route_name: str):
    async def _dep(principal: Principal = Depends(get_current_principal)) -> None:
        key_prefix = f"rl:{route_name}:{principal.user_id}"
        try:
            await enforce_limits(key_prefix=key_prefix, limits=_limits_for_plan(principal.plan))
        except RateLimitExceeded as e:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded ({e.current}/{e.max_requests} in {e.window_seconds}s)",
            )
    return _dep
