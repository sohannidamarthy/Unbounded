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


class SignupPayload(BaseModel):
    email: EmailStr
    password: str = Field(min_length=10, max_length=100)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserProfile(BaseModel):
    id: str
    email: EmailStr
    is_active: bool
    is_admin: bool


class SignupResponse(BaseModel):
    message: str
    user: UserProfile


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _find_user_by_email(db: Session, email: str) -> Optional[User]:
    stmt = select(User).where(User.email == email)
    return db.scalar(stmt)


def _validate_signup_password(password: str) -> Optional[str]:
    profanity_patterns = (
        "fuck",
        "shit",
        "bitch",
        "asshole",
        "bastard",
        "cunt",
        "dick",
        "whore",
        "slut",
    )

    if len(password) < 10 or len(password) > 100:
        return "Password must be 10 to 100 characters."
    if any(char.isspace() for char in password):
        return "Password cannot include spaces."
    if not any(char.isupper() for char in password):
        return "Password must include at least one uppercase letter."
    if not any(char.isdigit() for char in password):
        return "Password must include at least one number."
    if password.isalnum():
        return "Password must include at least one symbol."
    lowered = password.lower()
    if any(pattern in lowered for pattern in profanity_patterns):
        return "Password cannot include profanity."
    return None


@router.post("/signup", response_model=SignupResponse)
def signup(payload: SignupPayload, db: Session = Depends(get_db)):
    email = _normalize_email(payload.email)
    password_error = _validate_signup_password(payload.password)
    if password_error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=password_error,
        )
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
    return SignupResponse(
        message="Account created. Please log in to continue.",
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
