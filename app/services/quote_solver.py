from __future__ import annotations

import math
import time
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

from app.schemas.arbs_quote import QuoteConstraints, QuoteLeg, QuoteResult, QuoteRisk


@dataclass(frozen=True)
class InputLeg:
    outcome: str
    book: str
    odds_decimal: float
    odds_american: Optional[int]
    line: Optional[float]
    ts_ingested_ms: Optional[int]


def _round_to_increment(x: float, inc: float, mode: str = "floor") -> float:
    """
    mode:
      - floor: never exceed bankroll due to rounding up (safer)
      - nearest: minimize error (can overshoot -> needs correction)
    """
    if inc <= 0:
        return round(x, 2)
    q = x / inc
    if mode == "nearest":
        return round(round(q) * inc, 10)
    return round(math.floor(q + 1e-12) * inc, 10)


def _sum_inv(legs: List[InputLeg]) -> float:
    return sum(1.0 / l.odds_decimal for l in legs)


def _stale_risk_label(expires_in_ms: Optional[int]) -> str:
    if expires_in_ms is None:
        return "low"
    if expires_in_ms <= 10_000:
        return "high"
    if expires_in_ms <= 30_000:
        return "medium"
    return "low"


def quote_arbitrage(
    *,
    arb_id: str,
    legs: List[InputLeg],
    constraints: QuoteConstraints,
    stale_cutoff_ms: int,
    now_ms: Optional[int] = None,
) -> QuoteResult:
    now_ms = now_ms or int(time.time() * 1000)

    if constraints.bankroll <= 0:
        return QuoteResult(
            ok=False,
            arb_id=arb_id,
            message="bankroll must be > 0",
            constraints=constraints,
            risk=QuoteRisk(stale_cutoff_ms=stale_cutoff_ms),
        )

    # ---- Validate legs + unique outcomes
    cleaned: List[InputLeg] = []
    seen_outcomes = set()
    for l in legs:
        if not l.outcome or not l.book:
            continue
        if l.odds_decimal is None or l.odds_decimal <= 1.0:
            continue
        if l.outcome in seen_outcomes:
            # arb detail should already pick best per outcome; duplicates are invalid
            return QuoteResult(
                ok=False,
                arb_id=arb_id,
                message=f"duplicate outcome in legs: {l.outcome}",
                constraints=constraints,
                risk=QuoteRisk(stale_cutoff_ms=stale_cutoff_ms),
                debug={"outcome": l.outcome},
            )
        seen_outcomes.add(l.outcome)
        cleaned.append(l)

    if len(cleaned) < 2:
        return QuoteResult(
            ok=False,
            arb_id=arb_id,
            message="need at least 2 valid outcome legs",
            constraints=constraints,
            risk=QuoteRisk(stale_cutoff_ms=stale_cutoff_ms),
        )

    inv_sum = _sum_inv(cleaned)
    roi_raw = (1.0 / inv_sum) - 1.0
    payout_target = constraints.bankroll / inv_sum
    profit_raw = payout_target - constraints.bankroll

    # User risk controls (fail fast)
    if constraints.min_roi is not None and roi_raw < constraints.min_roi:
        return QuoteResult(
            ok=False,
            arb_id=arb_id,
            message=f"roi_raw below min_roi ({roi_raw:.6f} < {constraints.min_roi:.6f})",
            roi_raw=roi_raw,
            profit_raw=profit_raw,
            payout_target=payout_target,
            constraints=constraints,
            risk=QuoteRisk(stale_cutoff_ms=stale_cutoff_ms),
        )
    if constraints.min_profit is not None and profit_raw < constraints.min_profit:
        return QuoteResult(
            ok=False,
            arb_id=arb_id,
            message=f"profit_raw below min_profit ({profit_raw:.2f} < {constraints.min_profit:.2f})",
            roi_raw=roi_raw,
            profit_raw=profit_raw,
            payout_target=payout_target,
            constraints=constraints,
            risk=QuoteRisk(stale_cutoff_ms=stale_cutoff_ms),
        )

    # ---- Raw stakes
    raw_stakes: List[Tuple[InputLeg, float, float]] = []  # (leg, inv, stake_exact)
    for l in cleaned:
        inv = 1.0 / l.odds_decimal
        stake_exact = constraints.bankroll * (inv / inv_sum)
        raw_stakes.append((l, inv, stake_exact))

    # ---- Apply min/max + increment rounding
    min_bet = float(constraints.min_bet)
    max_bet = float(constraints.max_bet) if constraints.max_bet is not None else None
    inc = float(constraints.bet_increment)

    rounded: List[Tuple[InputLeg, float, float, float]] = []  # (leg, inv, exact, rounded)
    for (l, inv, exact) in raw_stakes:
        stake = exact

        # min constraint
        if stake < min_bet:
            stake = min_bet

        # max constraint
        if max_bet is not None and stake > max_bet:
            stake = max_bet

        # rounding (floor is safest)
        stake_r = _round_to_increment(stake, inc, mode="floor")

        # still enforce min after flooring
        if stake_r < min_bet:
            stake_r = min_bet

        # enforce max after adjustments
        if max_bet is not None and stake_r > max_bet:
            stake_r = max_bet

        stake_r = round(stake_r, 2)
        rounded.append((l, inv, exact, stake_r))

    # ---- Ensure sum equals bankroll by distributing remainder in increments
    total = round(sum(x[3] for x in rounded), 2)
    bankroll = round(constraints.bankroll, 2)

    # If min constraints pushed us OVER bankroll, we cannot satisfy constraints.
    if total > bankroll + 1e-9:
        return QuoteResult(
            ok=False,
            arb_id=arb_id,
            message=f"constraints infeasible: minimum/rounding stakes sum to {total:.2f} > bankroll {bankroll:.2f}",
            roi_raw=roi_raw,
            profit_raw=profit_raw,
            payout_target=payout_target,
            constraints=constraints,
            risk=QuoteRisk(stale_cutoff_ms=stale_cutoff_ms),
            debug={"total_after_constraints": total},
        )

    # Distribute leftover in increments (prefer legs with largest exact stake, since they are “most natural”)
    remainder = round(bankroll - total, 2)
    step = max(inc, 0.01)
    step = float(step)

    # convert remainder to steps (floor to avoid overshoot)
    steps = int(math.floor((remainder + 1e-9) / step))

    if steps > 0:
        order = sorted(range(len(rounded)), key=lambda i: rounded[i][2], reverse=True)
        i = 0
        while steps > 0:
            idx = order[i % len(order)]
            l, inv, exact, stake_r = rounded[idx]

            candidate = round(stake_r + step, 2)
            if max_bet is not None and candidate > max_bet + 1e-9:
                i += 1
                # if all maxed, break
                if i > len(order) * 2:
                    break
                continue

            rounded[idx] = (l, inv, exact, candidate)
            steps -= 1
            i += 1

    final_total = round(sum(x[3] for x in rounded), 2)
    # last-resort: if tiny cents drift, adjust largest stake by pennies
    drift = round(bankroll - final_total, 2)
    if abs(drift) >= 0.01:
        idx = max(range(len(rounded)), key=lambda i: rounded[i][2])
        l, inv, exact, stake_r = rounded[idx]
        stake_r = round(stake_r + drift, 2)
        if stake_r < min_bet:
            return QuoteResult(
                ok=False,
                arb_id=arb_id,
                message="could not reconcile rounding drift without violating min_bet",
                roi_raw=roi_raw,
                profit_raw=profit_raw,
                payout_target=payout_target,
                constraints=constraints,
                risk=QuoteRisk(stale_cutoff_ms=stale_cutoff_ms),
                debug={"drift": drift},
            )
        if max_bet is not None and stake_r > max_bet:
            return QuoteResult(
                ok=False,
                arb_id=arb_id,
                message="could not reconcile rounding drift without violating max_bet",
                roi_raw=roi_raw,
                profit_raw=profit_raw,
                payout_target=payout_target,
                constraints=constraints,
                risk=QuoteRisk(stale_cutoff_ms=stale_cutoff_ms),
                debug={"drift": drift},
            )
        rounded[idx] = (l, inv, exact, stake_r)

    # ---- Effective ROI after constraints/rounding:
    # Payout is min(stake_i * odds_i) since only one outcome wins.
    payouts = [r[3] * r[0].odds_decimal for r in rounded]
    payout_min = min(payouts)
    payout_max = max(payouts)
    profit_effective = payout_min - bankroll
    roi_effective = (payout_min / bankroll) - 1.0

    # Enforce min_roi/min_profit AGAIN on effective (slippage protection)
    if constraints.min_roi is not None and roi_effective < constraints.min_roi:
        return QuoteResult(
            ok=False,
            arb_id=arb_id,
            message=f"roi_effective below min_roi after constraints ({roi_effective:.6f} < {constraints.min_roi:.6f})",
            roi_raw=roi_raw,
            roi_effective=roi_effective,
            profit_raw=profit_raw,
            profit_effective=profit_effective,
            payout_target=payout_target,
            constraints=constraints,
            risk=QuoteRisk(stale_cutoff_ms=stale_cutoff_ms),
            debug={"payout_min": payout_min, "payout_max": payout_max},
        )
    if constraints.min_profit is not None and profit_effective < constraints.min_profit:
        return QuoteResult(
            ok=False,
            arb_id=arb_id,
            message=f"profit_effective below min_profit after constraints ({profit_effective:.2f} < {constraints.min_profit:.2f})",
            roi_raw=roi_raw,
            roi_effective=roi_effective,
            profit_raw=profit_raw,
            profit_effective=profit_effective,
            payout_target=payout_target,
            constraints=constraints,
            risk=QuoteRisk(stale_cutoff_ms=stale_cutoff_ms),
            debug={"payout_min": payout_min, "payout_max": payout_max},
        )

    # ---- Risk (staleness)
    ages = []
    for (l, _, _, _) in rounded:
        if l.ts_ingested_ms is None:
            continue
        ages.append(now_ms - int(l.ts_ingested_ms))
    oldest = max(ages) if ages else None
    newest = min(ages) if ages else None
    expires_in = (stale_cutoff_ms - oldest) if oldest is not None else None

    risk = QuoteRisk(
        stale_cutoff_ms=stale_cutoff_ms,
        expires_in_ms=expires_in,
        stale_risk=_stale_risk_label(expires_in),
        oldest_leg_age_ms=oldest,
        newest_leg_age_ms=newest,
    )

    out_legs: List[QuoteLeg] = []
    for (l, inv, exact, stake) in rounded:
        age = (now_ms - int(l.ts_ingested_ms)) if l.ts_ingested_ms is not None else None
        out_legs.append(
            QuoteLeg(
                outcome=l.outcome,
                book=l.book,
                odds_decimal=float(l.odds_decimal),
                odds_american=l.odds_american,
                line=l.line,
                ts_ingested_ms=l.ts_ingested_ms,
                age_ms=age,
                stake=float(round(stake, 2)),
                stake_unrounded=float(exact),
                payout_if_wins=float(round(stake * l.odds_decimal, 2)),
            )
        )

    return QuoteResult(
        ok=True,
        arb_id=arb_id,
        roi_raw=float(roi_raw),
        roi_effective=float(roi_effective),
        payout_target=float(round(payout_target, 2)),
        payout_range={"min": float(round(payout_min, 2)), "max": float(round(payout_max, 2))},
        profit_raw=float(round(profit_raw, 2)),
        profit_effective=float(round(profit_effective, 2)),
        constraints=constraints,
        risk=risk,
        legs=out_legs,
    )
