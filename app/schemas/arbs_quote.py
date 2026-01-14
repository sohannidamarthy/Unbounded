from __future__ import annotations

from typing import Any, Dict, List, Optional, Literal
from pydantic import BaseModel, Field


class QuoteLeg(BaseModel):
    outcome: str
    book: str
    odds_decimal: float
    odds_american: Optional[int] = None
    line: Optional[float] = None

    ts_ingested_ms: Optional[int] = None
    age_ms: Optional[int] = None

    stake: float
    stake_unrounded: float

    payout_if_wins: float


class QuoteConstraints(BaseModel):
    bankroll: float
    min_bet: float = 1.0
    bet_increment: float = 0.01
    max_bet: Optional[float] = None

    # risk controls
    min_roi: Optional[float] = None
    min_profit: Optional[float] = None


class QuoteRisk(BaseModel):
    stale_cutoff_ms: int
    expires_in_ms: Optional[int] = None
    stale_risk: Literal["low", "medium", "high"] = "low"
    oldest_leg_age_ms: Optional[int] = None
    newest_leg_age_ms: Optional[int] = None


class QuoteResult(BaseModel):
    ok: bool
    arb_id: str
    message: Optional[str] = None

    roi_raw: Optional[float] = None
    roi_effective: Optional[float] = None

    payout_target: Optional[float] = None
    payout_range: Optional[Dict[str, float]] = None

    profit_raw: Optional[float] = None
    profit_effective: Optional[float] = None

    constraints: QuoteConstraints
    risk: QuoteRisk
    legs: List[QuoteLeg] = Field(default_factory=list)

    debug: Optional[Dict[str, Any]] = None
