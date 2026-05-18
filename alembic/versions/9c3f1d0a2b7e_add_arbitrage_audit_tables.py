"""add arbitrage audit tables

Revision ID: 9c3f1d0a2b7e
Revises: b8436a79a0e4
Create Date: 2026-05-18 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "9c3f1d0a2b7e"
down_revision: Union[str, Sequence[str], None] = "b8436a79a0e4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(table_name: str) -> bool:
    bind = op.get_bind()
    return sa.inspect(bind).has_table(table_name)


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")

    if not _has_table("arb_latest"):
        op.create_table(
            "arb_latest",
            sa.Column("arb_id", sa.Text(), primary_key=True),
            sa.Column("sport", sa.Text(), nullable=False),
            sa.Column("league", sa.Text(), nullable=True),
            sa.Column("event_id", sa.Text(), nullable=False),
            sa.Column("event_name", sa.Text(), nullable=True),
            sa.Column("start_time_ms", sa.BigInteger(), nullable=True),
            sa.Column("market_key", sa.Text(), nullable=False),
            sa.Column("market_instance_id", sa.Text(), nullable=True),
            sa.Column("line", sa.Numeric(10, 3), nullable=True),
            sa.Column("player_id", sa.Text(), nullable=True),
            sa.Column("arb_sum", sa.Numeric(18, 10), nullable=True),
            sa.Column("roi_raw", sa.Numeric(18, 10), nullable=True),
            sa.Column("ts_updated_ms", sa.BigInteger(), nullable=True),
            sa.Column("ts_min_leg_ingested_ms", sa.BigInteger(), nullable=True),
            sa.Column(
                "legs_json",
                postgresql.JSONB(astext_type=sa.Text()),
                server_default=sa.text("'[]'::jsonb"),
                nullable=False,
            ),
            sa.Column(
                "payload_json",
                postgresql.JSONB(astext_type=sa.Text()),
                server_default=sa.text("'{}'::jsonb"),
                nullable=False,
            ),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    op.execute("CREATE INDEX IF NOT EXISTS ix_arb_latest_sport ON arb_latest (sport)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_arb_latest_event_id ON arb_latest (event_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_arb_latest_market_key ON arb_latest (market_key)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_arb_latest_sport_roi ON arb_latest (sport, roi_raw)")
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_arb_latest_event_market "
        "ON arb_latest (event_id, market_key, market_instance_id)"
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_arb_latest_updated_at ON arb_latest (updated_at)")

    if not _has_table("quote_snapshots"):
        op.create_table(
            "quote_snapshots",
            sa.Column(
                "id",
                sa.UUID(),
                server_default=sa.text("gen_random_uuid()"),
                primary_key=True,
            ),
            sa.Column("arb_id", sa.Text(), nullable=True),
            sa.Column("bankroll", sa.Numeric(18, 2), nullable=True),
            sa.Column(
                "constraints_json",
                postgresql.JSONB(astext_type=sa.Text()),
                server_default=sa.text("'{}'::jsonb"),
                nullable=False,
            ),
            sa.Column(
                "result_json",
                postgresql.JSONB(astext_type=sa.Text()),
                server_default=sa.text("'{}'::jsonb"),
                nullable=False,
            ),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.ForeignKeyConstraint(["arb_id"], ["arb_latest.arb_id"], ondelete="SET NULL"),
        )

    op.execute("CREATE INDEX IF NOT EXISTS ix_quote_snapshots_arb_id ON quote_snapshots (arb_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_quote_snapshots_created_at ON quote_snapshots (created_at)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS quote_snapshots")
    op.execute("DROP TABLE IF EXISTS arb_latest")
