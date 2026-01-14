from __future__ import annotations

import json
from typing import Type, TypeVar

from pydantic import BaseModel, ValidationError

from app.redis_client import get_redis


T = TypeVar("T", bound=BaseModel)


class RedisCacheMiss(Exception):
    """Raised when a required Redis key is missing."""
    pass


class RedisPayloadInvalid(Exception):
    """Raised when Redis payload cannot be parsed or validated."""
    pass


async def get_required_json(key: str, model: Type[T]) -> T:
    """
    Fetch a JSON payload from Redis and validate against a Pydantic model.

    - Redis ONLY (no DB fallback)
    - Raises RedisCacheMiss if key missing
    - Raises RedisPayloadInvalid if invalid JSON or schema mismatch
    """
    redis = await get_redis()
    raw = await redis.get(key)

    if raw is None:
        raise RedisCacheMiss(f"Missing Redis key: {key}")

    try:
        payload = json.loads(raw)
    except Exception as e:
        raise RedisPayloadInvalid(f"Invalid JSON in Redis for key={key}") from e

    try:
        return model.model_validate(payload)
    except ValidationError as e:
        raise RedisPayloadInvalid(f"Schema mismatch for Redis key={key}") from e


async def get_optional_json(key: str, model: Type[T]) -> T | None:
    """
    Same as get_required_json, but returns None on cache miss.
    """
    redis = await get_redis()
    raw = await redis.get(key)

    if raw is None:
        return None

    try:
        payload = json.loads(raw)
        return model.model_validate(payload)
    except Exception as e:
        raise RedisPayloadInvalid(f"Invalid Redis payload for key={key}") from e
