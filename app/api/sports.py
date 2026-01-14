from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps.auth import get_current_principal
from app.api.deps.limits import rate_limit
from app.core.principal import Principal
from app.core.redis_keys import redis_keys
from app.schemas.sports import SportsResponse
from app.services.redis_only_read import get_required_json, RedisCacheMiss, RedisPayloadInvalid


router = APIRouter(prefix="/sports", tags=["sports"])


@router.get("", response_model=SportsResponse)
async def list_sports(
    principal: Principal = Depends(get_current_principal),
    _: None = Depends(rate_limit("sports")),
) -> SportsResponse:
    key = redis_keys.sports_all()
    try:
        return await get_required_json(key, SportsResponse)
    except RedisCacheMiss:
        # API contract: Redis-only reads => cache miss is a service issue, not a DB fallback
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Sports cache not ready")
    except RedisPayloadInvalid:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Sports cache invalid")
