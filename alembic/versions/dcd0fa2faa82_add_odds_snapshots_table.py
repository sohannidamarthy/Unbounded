"""add odds_snapshots table

Revision ID: dcd0fa2faa82
Revises: b8436a79a0e4
Create Date: 2026-01-11 00:33:39.532225

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dcd0fa2faa82'
down_revision: Union[str, Sequence[str], None] = 'b8436a79a0e4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        "odds_snapshots",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("event_id", sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("market_id", sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("book_key", sa.Text(), nullable=False),
        sa.Column("book_title", sa.Text(), nullable=True),
        sa.Column("odds_decimal", sa.Numeric(10, 4), nullable=False),
        sa.Column("odds_american", sa.Integer(), nullable=True),
        sa.Column("fetched_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("provider_last_update", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["event_id"], ["events.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["market_id"], ["markets.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_odds_snapshots_event_market_fetched_at",
        "odds_snapshots",
        ["event_id", "market_id", "fetched_at"],
    )
    op.create_index(
        "ix_odds_snapshots_event_market_book_fetched_at",
        "odds_snapshots",
        ["event_id", "market_id", "book_key", "fetched_at"],
    )


def downgrade():
    op.drop_index("ix_odds_snapshots_event_market_book_fetched_at", table_name="odds_snapshots")
    op.drop_index("ix_odds_snapshots_event_market_fetched_at", table_name="odds_snapshots")
    op.drop_table("odds_snapshots")
