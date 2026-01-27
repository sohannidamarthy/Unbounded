from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.db.models.user import User
from app.db.session import get_db

router = APIRouter()


class AuthPayload(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserProfile(BaseModel):
    id: str
    email: EmailStr
    is_active: bool
    is_admin: bool


class SignupResponse(AuthResponse):
    user: UserProfile


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _find_user_by_email(db: Session, email: str) -> Optional[User]:
    stmt = select(User).where(User.email == email)
    return db.scalar(stmt)


@router.post("/signup", response_model=SignupResponse)
def signup(payload: AuthPayload, db: Session = Depends(get_db)):
    email = _normalize_email(payload.email)
    existing = _find_user_by_email(db, email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered.",
        )

    user = User(
        email=email,
        password_hash=hash_password(payload.password),
        is_active=True,
        is_admin=False,
    )

    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered.",
        )

    db.refresh(user)
    token = create_access_token(str(user.id))

    return SignupResponse(
        access_token=token,
        user=UserProfile(
            id=str(user.id),
            email=user.email,
            is_active=user.is_active,
            is_admin=user.is_admin,
        ),
    )


@router.post("/login", response_model=AuthResponse)
def login(payload: AuthPayload, db: Session = Depends(get_db)):
    email = _normalize_email(payload.email)
    user = _find_user_by_email(db, email)

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is inactive.",
        )

    token = create_access_token(str(user.id))
    return AuthResponse(access_token=token)
