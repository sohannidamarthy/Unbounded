from __future__ import annotations

import hashlib
import hmac
import secrets

from app.core.config import settings


def generate_api_key(prefix: str = "ub") -> str:
    # example: ub_live_xxxxx
    token = secrets.token_urlsafe(32)
    return f"{prefix}_live_{token}"


def hash_api_key(api_key: str) -> str:
    """
    Stable hash for API key lookup.
    Uses HMAC with server-side pepper so DB leak doesn't reveal keys.
    """
    pepper = settings.api_key_pepper.get_secret_value().encode("utf-8")
    msg = api_key.encode("utf-8")
    digest = hmac.new(pepper, msg, hashlib.sha256).hexdigest()
    return digest
