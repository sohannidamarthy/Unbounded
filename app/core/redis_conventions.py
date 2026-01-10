from __future__ import annotations

# ---- Redis schema versioning ----
REDIS_SCHEMA_VERSION = 1

# Optional namespace prefix for keys (set to "" to disable)
# If enabled later, you can set it to something like "unbounded"
KEY_NAMESPACE = ""

def ns(key: str) -> str:
    return f"{KEY_NAMESPACE}:{key}" if KEY_NAMESPACE else key

# ---- TTLs (Week 1 defaults) ----
ODDS_TTL_SECONDS = 120
ODDS_TS_TTL_SECONDS = 180
EVENT_MARKETS_TTL_SECONDS = 86400  # 24 hours

# ---- Slug conventions ----
# Markets should be stable slugs. Add to this list as you support more.
VALID_MARKETS = {
    "moneyline",
    "spread",
    "total",
}

# Books should be stable short codes.
VALID_BOOKS = {
    "dk",   # DraftKings
    "fd",   # FanDuel
    "mgm",  # BetMGM
    "cz",   # Caesars
    "pb",   # PointsBet (example)
}

def normalize_market(market: str) -> str:
    return market.strip().lower()

def normalize_book(book: str) -> str:
    return book.strip().lower()
