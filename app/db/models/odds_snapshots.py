import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base  # adjust if your Base lives elsewhere


class OddsSnapshot(Base):
    __tablename__ = "odds_snapshots"

    id = sa.Column(UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()"))

    event_id = sa.Column(UUID(as_uuid=True), sa.ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    market_id = sa.Column(UUID(as_uuid=True), sa.ForeignKey("markets.id", ondelete="CASCADE"), nullable=False, index=True)

    book_key = sa.Column(sa.Text, nullable=False)
    book_title = sa.Column(sa.Text, nullable=True)

    odds_decimal = sa.Column(sa.Numeric(10, 4), nullable=False)
    odds_american = sa.Column(sa.Integer, nullable=True)

    fetched_at = sa.Column(sa.DateTime(timezone=True), nullable=False)
    provider_last_update = sa.Column(sa.DateTime(timezone=True), nullable=True)
