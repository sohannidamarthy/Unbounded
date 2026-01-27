from typing import Optional

from fastapi import Depends, Header, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models.api_keys import ApiKey
from app.db.models.user import User
from app.db.session import get_db


def _get_bearer_token(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer":
        return None
    token = token.strip()
    return token if token else None


def _get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    stmt = select(User).where(User.id == user_id)
    return db.scalar(stmt)


def _unauthorized() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials.",
    )


def get_current_user(
    authorization: Optional[str] = Header(default=None),
    x_api_key: Optional[str] = Header(default=None, alias="X-API-Key"),
    db: Session = Depends(get_db),
) -> User:
    token = _get_bearer_token(authorization)
    if token:
        try:
            payload = jwt.decode(
                token,
                settings.jwt_secret.get_secret_value(),
                algorithms=[settings.jwt_algorithm],
            )
        except JWTError as exc:
            raise _unauthorized() from exc

        subject = payload.get("sub")
        if not subject:
            raise _unauthorized()

        user = _get_user_by_id(db, subject)
        if not user or not user.is_active:
            raise _unauthorized()

        return user

    if x_api_key:
        stmt = select(ApiKey).where(ApiKey.key == x_api_key)
        api_key = db.scalar(stmt)
        if api_key:
            user = _get_user_by_id(db, str(api_key.user_id))
            if user and user.is_active:
                return user

    raise _unauthorized()
