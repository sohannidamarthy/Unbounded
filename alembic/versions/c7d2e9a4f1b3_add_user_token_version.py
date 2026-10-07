"""add users.token_version for JWT revocation

Revision ID: c7d2e9a4f1b3
Revises: a1c4e6f2b8d9
Create Date: 2026-10-07 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c7d2e9a4f1b3"
down_revision: Union[str, Sequence[str], None] = "a1c4e6f2b8d9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("token_version", sa.Integer(), server_default="0", nullable=False),
    )


def downgrade() -> None:
    op.drop_column("users", "token_version")
