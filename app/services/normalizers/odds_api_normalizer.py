from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple


# -------------------------
# Canonical internal types
# -------------------------

MarketType = str  # keep as str for now; later you can use Literal/Enum


@dataclass(frozen=True)
class NormalizedOutcome:
    outcome_key: str          # stable key: e.g. "home", "away", "draw", "over", "under"
    label: str                # display label (team name / "Over" / "Under")
    price_decimal: float      # canonical odds format
    point: Optional[float]    # line (spread / total); None for moneyline
    raw: Dict[str, Any]       # raw outcome payload (for traceability)


@dataclass(frozen=True)
class NormalizedMarket:
    market_type: MarketType   # "h2h" | "spreads" | "totals" (canonical)
    line: Optional[float]     # line for spreads/totals; None for moneyline
    outcomes: List[NormalizedOutcome]
    raw: Dict[str, Any]


@dataclass(frozen=True)
class NormalizedBook:
    book_key: str             # provider key: e.g. "fanduel"
    book_title: str           # provider title: "FanDuel"
    last_update_utc: datetime
    markets: List[NormalizedMarket]
    raw: Dict[str, Any]


@dataclass(frozen=True)
class NormalizedEvent:
    provider: str
    provider_event_id: str    # provider's event id (string)
    sport_key: str
    sport_title: str
    commence_time_utc: datetime
    home_team: str
    away_team: str
    books: List[NormalizedBook]
    raw: Dict[str, Any]


# -------------------------
# Helpers
# -------------------------

def _parse_iso_utc(dt_str: str) -> datetime:
    """
    Provider returns ISO timestamps like:
    "2026-01-11T00:11:35Z" or "2026-01-11T00:11:35+00:00"
    We normalize to timezone-aware UTC datetime.
    """
    if not dt_str:
        raise ValueError("Empty datetime string")

    # Handle trailing Z
    if dt_str.endswith("Z"):
        dt_str = dt_str[:-1] + "+00:00"

    dt = datetime.fromisoformat(dt_str)
    if dt.tzinfo is None:
        # assume UTC if provider ever sends naive (rare)
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _canonical_market_type(provider_market_key: str) -> MarketType:
    """
    Map provider market keys to our canonical types.
    For Odds API, keys are typically: h2h, spreads, totals.
    """
    mk = (provider_market_key or "").strip().lower()
    if mk in ("h2h", "moneyline"):
        return "h2h"
    if mk in ("spreads", "spread"):
        return "spreads"
    if mk in ("totals", "total"):
        return "totals"
    # keep unknown markets as-is (future-proof)
    return mk


def _outcome_key_for_market(
    market_type: MarketType,
    outcome_name: str,
    home_team: str,
    away_team: str,
) -> str:
    """
    Create a stable internal key for outcomes.
    - h2h/spreads: home/away/draw (if present)
    - totals: over/under
    """
    name = (outcome_name or "").strip()

    if market_type in ("totals",):
        lower = name.lower()
        if lower.startswith("over"):
            return "over"
        if lower.startswith("under"):
            return "under"
        # sometimes providers send just "Over"/"Under"
        if lower == "over":
            return "over"
        if lower == "under":
            return "under"
        return lower

    # team-based markets
    if name == home_team:
        return "home"
    if name == away_team:
        return "away"

    # some markets include "Draw"
    if name.lower() == "draw":
        return "draw"

    # fallback: normalized string
    return name.lower().replace(" ", "_")


def _safe_float(x: Any) -> Optional[float]:
    if x is None:
        return None
    try:
        return float(x)
    except (TypeError, ValueError):
        return None


# -------------------------
# Normalization entrypoint
# -------------------------

def normalize_odds_api_response(
    provider: str,
    raw: Any,
) -> List[NormalizedEvent]:
    """
    raw: Odds API odds endpoint typically returns a list of events.
    We return a list of NormalizedEvent objects.
    """
    if raw is None:
        return []

    if not isinstance(raw, list):
        raise ValueError(f"Expected list from provider, got {type(raw)}")

    out_events: List[NormalizedEvent] = []

    for event in raw:
        if not isinstance(event, dict):
            continue

        provider_event_id = str(event.get("id") or "")
        sport_key = str(event.get("sport_key") or "")
        sport_title = str(event.get("sport_title") or "")
        commence_time = event.get("commence_time") or ""
        home_team = str(event.get("home_team") or "")
        away_team = str(event.get("away_team") or "")

        # Basic validation
        if not provider_event_id or not sport_key or not commence_time or not home_team or not away_team:
            # skip malformed events but keep system resilient
            continue

        commence_time_utc = _parse_iso_utc(commence_time)

        books_raw = event.get("bookmakers") or []
        books: List[NormalizedBook] = []

        for book in books_raw:
            if not isinstance(book, dict):
                continue

            book_key = str(book.get("key") or "")
            book_title = str(book.get("title") or book_key)
            last_update = book.get("last_update") or commence_time  # fallback
            last_update_utc = _parse_iso_utc(str(last_update))

            markets_raw = book.get("markets") or []
            markets: List[NormalizedMarket] = []

            for m in markets_raw:
                if not isinstance(m, dict):
                    continue

                m_key = str(m.get("key") or "")
                market_type = _canonical_market_type(m_key)

                outcomes_raw = m.get("outcomes") or []
                outcomes: List[NormalizedOutcome] = []

                # We’ll compute a "market line" when meaningful.
                # For totals/spreads outcomes usually share the same point.
                market_line: Optional[float] = None

                for o in outcomes_raw:
                    if not isinstance(o, dict):
                        continue

                    outcome_name = str(o.get("name") or "")
                    price = o.get("price")

                    # Odds API may return "price" as number; we require float
                    try:
                        price_decimal = float(price)
                    except (TypeError, ValueError):
                        continue

                    point = _safe_float(o.get("point"))
                    if market_line is None and point is not None:
                        market_line = point

                    outcomes.append(
                        NormalizedOutcome(
                            outcome_key=_outcome_key_for_market(
                                market_type=market_type,
                                outcome_name=outcome_name,
                                home_team=home_team,
                                away_team=away_team,
                            ),
                            label=outcome_name,
                            price_decimal=price_decimal,
                            point=point,
                            raw=o,
                        )
                    )

                # Dedup/clean: sort outcomes for stability
                outcomes = sorted(outcomes, key=lambda x: x.outcome_key)

                if outcomes:
                    markets.append(
                        NormalizedMarket(
                            market_type=market_type,
                            line=market_line if market_type in ("spreads", "totals") else None,
                            outcomes=outcomes,
                            raw=m,
                        )
                    )

            # Dedup/clean: sort markets for stability
            markets = sorted(markets, key=lambda x: (x.market_type, x.line or 0.0))

            if book_key and markets:
                books.append(
                    NormalizedBook(
                        book_key=book_key,
                        book_title=book_title,
                        last_update_utc=last_update_utc,
                        markets=markets,
                        raw=book,
                    )
                )

        # Dedup/clean: sort books for stability
        books = sorted(books, key=lambda b: b.book_key)

        out_events.append(
            NormalizedEvent(
                provider=provider,
                provider_event_id=provider_event_id,
                sport_key=sport_key,
                sport_title=sport_title,
                commence_time_utc=commence_time_utc,
                home_team=home_team,
                away_team=away_team,
                books=books,
                raw=event,
            )
        )

    return out_events


# -------------------------
# Optional: stable dedup keys
# -------------------------

def dedup_key_event(e: NormalizedEvent) -> str:
    return f"{e.provider}:{e.provider_event_id}"


def dedup_key_market(e: NormalizedEvent, b: NormalizedBook, m: NormalizedMarket) -> str:
    line_part = "" if m.line is None else f":{m.line}"
    return f"{dedup_key_event(e)}:{b.book_key}:{m.market_type}{line_part}"
