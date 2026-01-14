"""arb latest and quote snapshots

Revision ID: 3aa37f295a1e
Revises: a7f4af87d967
Create Date: 2026-01-11 23:48:44.989142

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3aa37f295a1e'
down_revision: Union[str, Sequence[str], None] = 'a7f4af87d967'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "arb_latest",
        sa.Column("arb_id", sa.String(length=64), primary_key=True),
        sa.Column("sport", sa.String(length=32), nullable=True),
        sa.Column("event_id", sa.String(length=128), nullable=True),
        sa.Column("market_key", sa.String(length=64), nullable=True),
        sa.Column("line", sa.Float(), nullable=True),
        sa.Column("roi_raw", sa.Float(), nullable=True),
        sa.Column("payload_json", sa.Text(), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index("ix_arb_latest_sport", "arb_latest", ["sport"])
    op.create_index("ix_arb_latest_event", "arb_latest", ["event_id"])

    op.create_table(
        "quote_snapshots",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("arb_id", sa.String(length=64), nullable=False),
        sa.Column("bankroll", sa.Float(), nullable=False),
        sa.Column("constraints_json", sa.Text(), nullable=False),
        sa.Column("result_json", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index("ix_quote_snapshots_arb_id", "quote_snapshots", ["arb_id"])
    op.create_index(
        "ix_quote_snapshots_created_at", "quote_snapshots", ["created_at"]
    )


def downgrade() -> None:
    op.drop_index("ix_quote_snapshots_created_at", table_name="quote_snapshots")
    op.drop_index("ix_quote_snapshots_arb_id", table_name="quote_snapshots")
    op.drop_table("quote_snapshots")

    op.drop_index("ix_arb_latest_event", table_name="arb_latest")
    op.drop_index("ix_arb_latest_sport", table_name="arb_latest")
    op.drop_table("arb_latest")

