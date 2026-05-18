"""add ev latest table

Revision ID: 5f0b1c2d3e4f
Revises: 4e8a2c6b9d10
Create Date: 2026-05-18 17:40:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql


revision: str = "5f0b1c2d3e4f"
down_revision: Union[str, None] = "4e8a2c6b9d10"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    if not sa.inspect(op.get_bind()).has_table("ev_latest"):
        op.create_table(
            "ev_latest",
            sa.Column("ev_id", sa.Text(), nullable=False),
            sa.Column("sport", sa.Text(), nullable=True),
            sa.Column("league", sa.Text(), nullable=True),
            sa.Column("event_id", sa.Text(), nullable=True),
            sa.Column("event_name", sa.Text(), nullable=True),
            sa.Column("start_time_ms", sa.BigInteger(), nullable=True),
            sa.Column("market_key", sa.Text(), nullable=True),
            sa.Column("selection", sa.Text(), nullable=True),
            sa.Column("line", sa.Numeric(10, 3), nullable=True),
            sa.Column("book", sa.Text(), nullable=True),
            sa.Column("odds_decimal", sa.Numeric(18, 10), nullable=True),
            sa.Column("odds_american", sa.Integer(), nullable=True),
            sa.Column("implied_probability", sa.Numeric(18, 10), nullable=True),
            sa.Column("fair_probability", sa.Numeric(18, 10), nullable=True),
            sa.Column("edge", sa.Numeric(18, 10), nullable=True),
            sa.Column("expected_value", sa.Numeric(18, 10), nullable=True),
            sa.Column("bet_url", sa.Text(), nullable=True),
            sa.Column("ts_updated_ms", sa.BigInteger(), nullable=True),
            sa.Column(
                "payload_json",
                postgresql.JSONB(astext_type=sa.Text()),
                server_default=sa.text("'{}'::jsonb"),
                nullable=False,
            ),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.PrimaryKeyConstraint("ev_id"),
        )
    op.execute("CREATE INDEX IF NOT EXISTS ix_ev_latest_sport ON ev_latest (sport)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_ev_latest_event_id ON ev_latest (event_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_ev_latest_market_key ON ev_latest (market_key)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_ev_latest_sport_expected_value ON ev_latest (sport, expected_value)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_ev_latest_event_market ON ev_latest (event_id, market_key)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_ev_latest_updated_at ON ev_latest (updated_at)")


def downgrade() -> None:
    op.drop_index("ix_ev_latest_updated_at", table_name="ev_latest")
    op.drop_index("ix_ev_latest_event_market", table_name="ev_latest")
    op.drop_index("ix_ev_latest_sport_expected_value", table_name="ev_latest")
    op.drop_index("ix_ev_latest_market_key", table_name="ev_latest")
    op.drop_index("ix_ev_latest_event_id", table_name="ev_latest")
    op.drop_index("ix_ev_latest_sport", table_name="ev_latest")
    op.drop_table("ev_latest")
