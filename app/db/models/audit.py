import uuid

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, UUID

from app.db.base import Base


class ArbLatest(Base):
    __tablename__ = "arb_latest"

    arb_id = sa.Column(sa.Text, primary_key=True)
    sport = sa.Column(sa.Text, nullable=False, index=True)
    league = sa.Column(sa.Text, nullable=True)
    event_id = sa.Column(sa.Text, nullable=False, index=True)
    event_name = sa.Column(sa.Text, nullable=True)
    start_time_ms = sa.Column(sa.BigInteger, nullable=True)
    market_key = sa.Column(sa.Text, nullable=False, index=True)
    market_instance_id = sa.Column(sa.Text, nullable=True)
    line = sa.Column(sa.Numeric(10, 3), nullable=True)
    player_id = sa.Column(sa.Text, nullable=True)
    arb_sum = sa.Column(sa.Numeric(18, 10), nullable=True)
    roi_raw = sa.Column(sa.Numeric(18, 10), nullable=True)
    ts_updated_ms = sa.Column(sa.BigInteger, nullable=True)
    ts_min_leg_ingested_ms = sa.Column(sa.BigInteger, nullable=True)
    legs_json = sa.Column(JSONB, nullable=False, server_default=sa.text("'[]'::jsonb"))
    payload_json = sa.Column(JSONB, nullable=False, server_default=sa.text("'{}'::jsonb"))
    created_at = sa.Column(sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False)
    updated_at = sa.Column(
        sa.DateTime(timezone=True),
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
        nullable=False,
    )

    __table_args__ = (
        sa.Index("ix_arb_latest_sport_roi", "sport", "roi_raw"),
        sa.Index("ix_arb_latest_event_market", "event_id", "market_key", "market_instance_id"),
        sa.Index("ix_arb_latest_updated_at", "updated_at"),
    )


class QuoteSnapshot(Base):
    __tablename__ = "quote_snapshots"

    id = sa.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    arb_id = sa.Column(sa.Text, sa.ForeignKey("arb_latest.arb_id", ondelete="SET NULL"), nullable=True)
    bankroll = sa.Column(sa.Numeric(18, 2), nullable=True)
    constraints_json = sa.Column(JSONB, nullable=False, server_default=sa.text("'{}'::jsonb"))
    result_json = sa.Column(JSONB, nullable=False, server_default=sa.text("'{}'::jsonb"))
    created_at = sa.Column(sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False)

    __table_args__ = (
        sa.Index("ix_quote_snapshots_arb_id", "arb_id"),
        sa.Index("ix_quote_snapshots_created_at", "created_at"),
    )
