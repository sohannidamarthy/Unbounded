from sqlalchemy import Column, Text, ForeignKey, Index, Numeric
from sqlalchemy.dialects.postgresql import UUID
import sqlalchemy as sa

from app.db.base import Base


class Market(Base):
    __tablename__ = "markets"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()"))

    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)

    market_type = Column(Text, nullable=False)
    selection = Column(Text, nullable=False)
    line = Column(Numeric(10, 3), nullable=True)

    external_market_id = Column(Text, nullable=True)

    __table_args__ = (
        Index("ix_markets_event_id", "event_id"),
        Index("ix_markets_event_market_type", "event_id", "market_type"),
    )
