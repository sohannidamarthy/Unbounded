import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.db.models.user import User
from app.db.session import get_db
from app.services.user_profile_cache import upsert_user_signup_profile

router = APIRouter()
logger = logging.getLogger(__name__)


class AuthPayload(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class SignupPayload(BaseModel):
    email: EmailStr
    password: str = Field(min_length=10, max_length=100)
    tier: str | None = None
    username: str | None = None
    promo_code: str | None = None
    date_of_birth: str | None = None
    country: str | None = None
    state: str | None = None
    max_bet: str | None = None
    experience_level: str | None = None
    betting_goal: str | None = None
    yearly_profit_target: str | None = None
    bet_frequency: str | None = None
    preferred_sportsbooks: list[str] = Field(default_factory=list)
    legal_sportsbooks: list[str] = Field(default_factory=list)
    recommended_tutorial_titles: list[str] = Field(default_factory=list)
    active_tutorial_title: str | None = None
    active_tutorial_index: int | None = None
    skipped_preferences: bool = False
    skipped_tutorials: bool = False


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
async def signup(payload: SignupPayload, db: Session = Depends(get_db)):
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
    try:
        await upsert_user_signup_profile(
            str(user.id),
            {
                "user_id": str(user.id),
                "email": user.email,
                "is_active": user.is_active,
                "is_admin": user.is_admin,
                "profile": {
                    "tier": payload.tier,
                    "username": payload.username.strip() if payload.username else None,
                    "promo_code": payload.promo_code.strip() if payload.promo_code else None,
                    "date_of_birth": payload.date_of_birth,
                    "country": payload.country,
                    "state": payload.state,
                },
                "preferences": {
                    "preferred_sportsbooks": payload.preferred_sportsbooks,
                    "legal_sportsbooks": payload.legal_sportsbooks,
                    "max_bet": payload.max_bet,
                    "experience_level": payload.experience_level,
                    "betting_goal": payload.betting_goal,
                    "yearly_profit_target": payload.yearly_profit_target,
                    "bet_frequency": payload.bet_frequency,
                },
                "onboarding": {
                    "recommended_tutorial_titles": payload.recommended_tutorial_titles,
                    "active_tutorial_title": payload.active_tutorial_title,
                    "active_tutorial_index": payload.active_tutorial_index,
                    "skipped_preferences": payload.skipped_preferences,
                    "skipped_tutorials": payload.skipped_tutorials,
                },
                "credentials": {
                    "password_configured": True,
                    "password_rule_version": 1,
                },
            },
        )
    except Exception:
        logger.exception("Failed to cache signup profile for user %s", user.id)

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
