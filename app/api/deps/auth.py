from __future__ import annotations

from uuid import UUID

from fastapi import Header, HTTPException, status

from app.core.config import settings
from app.core.principal import Principal
from app.core.security import decode_token, JWTInvalid
from app.core.api_keys import hash_api_key
from app.db.session import SessionLocal
from app.db.models.subscriptions import Subscription
from app.db.models.api_keys import ApiKey


def _plan_from_subscription(sub: Subscription | None) -> str:
    """
    Returns tier matching DB enum: FREE | PRO | ELITE.
    Non-active subscription -> FREE.
    """
    if not sub:
        return "FREE"
    if getattr(sub, "status", None) != "active":
        return "FREE"
    return str(getattr(sub, "plan", "FREE"))


def _uuid_or_401(value: str, label: str) -> UUID:
    try:
        return UUID(value)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid {label}",
        )


def get_current_principal(
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
) -> Principal:
    """
    Unified auth:
    - JWT via Authorization: Bearer <token>
    - API key via X-API-Key: <key>
    """
    # ---------- JWT ----------
    if settings.allow_jwt_auth and authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
        try:
            payload = decode_token(token)
        except JWTInvalid:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        sub = payload.get("sub")
        if not sub:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

        user_id = _uuid_or_401(str(sub), "token subject")

        with SessionLocal() as db:
            sub_row = db.query(Subscription).filter(Subscription.user_id == user_id).first()

        plan = _plan_from_subscription(sub_row)
        return Principal(user_id=str(user_id), plan=plan, auth_type="jwt")

    # ---------- API KEY ----------
    if settings.allow_api_key_auth and x_api_key:
        key_hash = hash_api_key(x_api_key)

        with SessionLocal() as db:
            api_key = (
                db.query(ApiKey)
                .filter(ApiKey.key_hash == key_hash, ApiKey.is_active == True)  # noqa: E712
                .first()
            )
            if not api_key:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")

            sub_row = db.query(Subscription).filter(Subscription.user_id == api_key.user_id).first()

        plan = _plan_from_subscription(sub_row)
        return Principal(user_id=str(api_key.user_id), plan=plan, auth_type="api_key")

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authentication")
