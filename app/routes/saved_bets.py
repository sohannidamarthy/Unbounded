from datetime import datetime
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.models.saved_bets import SavedBet
from app.db.models.user import User
from app.db.session import get_db

router = APIRouter(prefix="/saved-bets", tags=["saved bets"])


class SavedBetPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    sourceId: str = Field(max_length=200)
    board: str = Field(max_length=100)
    matchup: str = Field(max_length=300)
    sport: str = Field(max_length=100)
    league: str = Field(max_length=100)
    betType: str = Field(max_length=50)
    oddsA: str = Field(max_length=30)
    oddsB: str = Field(max_length=30)
    estimatedNet: float
    legs: list[dict[str, Any]] = Field(default_factory=list, max_length=10)


class SavedBetResponse(BaseModel):
    id: UUID
    savedAt: datetime
    sourceId: str
    board: str
    matchup: str
    sport: str
    league: str
    betType: str
    oddsA: str
    oddsB: str
    estimatedNet: float
    legs: list[dict[str, Any]]


def _response(saved_bet: SavedBet) -> SavedBetResponse:
    return SavedBetResponse(
        id=saved_bet.id,
        savedAt=saved_bet.created_at,
        **saved_bet.payload,
    )


@router.get("", response_model=list[SavedBetResponse])
def list_saved_bets(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[SavedBetResponse]:
    entries = db.scalars(
        select(SavedBet)
        .where(SavedBet.user_id == user.id)
        .order_by(SavedBet.created_at.desc())
        .limit(100)
    ).all()
    return [_response(entry) for entry in entries]


@router.post("", response_model=SavedBetResponse, status_code=status.HTTP_201_CREATED)
def create_saved_bet(
    payload: SavedBetPayload,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SavedBetResponse:
    saved_bet = SavedBet(user_id=user.id, payload=payload.model_dump())
    db.add(saved_bet)
    db.commit()
    db.refresh(saved_bet)
    return _response(saved_bet)


@router.delete("/{saved_bet_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_saved_bet(
    saved_bet_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    saved_bet = db.scalar(
        select(SavedBet).where(
            SavedBet.id == saved_bet_id,
            SavedBet.user_id == user.id,
        )
    )
    if saved_bet is None:
        raise HTTPException(status_code=404, detail="Saved bet not found.")
    db.delete(saved_bet)
    db.commit()
