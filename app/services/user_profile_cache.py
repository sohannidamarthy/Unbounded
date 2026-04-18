import json
import time
from typing import Any, Dict, Optional

from app.core.redis_conventions import REDIS_SCHEMA_VERSION, ns
from app.redis_client import get_redis


def user_profile_key(user_id: str) -> str:
    return ns(f"user_profile:{user_id}")


def user_profile_email_key(email: str) -> str:
    return ns(f"user_profile_email:{email.strip().lower()}")


def _with_meta(payload: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "_v": REDIS_SCHEMA_VERSION,
        "_ts": int(time.time()),
        **payload,
    }


async def upsert_user_signup_profile(user_id: str, payload: Dict[str, Any]) -> None:
    r = await get_redis()
    enriched = _with_meta(payload)
    await r.set(user_profile_key(user_id), json.dumps(enriched, separators=(",", ":")))
    await r.set(user_profile_email_key(payload["email"]), user_id)


async def get_user_signup_profile(user_id: str) -> Optional[Dict[str, Any]]:
    r = await get_redis()
    raw = await r.get(user_profile_key(user_id))
    if raw is None:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"_raw": raw}
