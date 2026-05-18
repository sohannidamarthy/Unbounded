"""add account recovery fields

Revision ID: 4e8a2c6b9d10
Revises: 9c3f1d0a2b7e
Create Date: 2026-05-18 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "4e8a2c6b9d10"
down_revision: Union[str, Sequence[str], None] = "9c3f1d0a2b7e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("is_email_verified", sa.Boolean(), server_default="false", nullable=False),
    )
    op.add_column("users", sa.Column("email_verified_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("email_verification_token_hash", sa.Text(), nullable=True))
    op.add_column("users", sa.Column("email_verification_expires_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("password_reset_token_hash", sa.Text(), nullable=True))
    op.add_column("users", sa.Column("password_reset_expires_at", sa.DateTime(timezone=True), nullable=True))
    op.create_index("ix_users_email_verification_token_hash", "users", ["email_verification_token_hash"])
    op.create_index("ix_users_password_reset_token_hash", "users", ["password_reset_token_hash"])


def downgrade() -> None:
    op.drop_index("ix_users_password_reset_token_hash", table_name="users")
    op.drop_index("ix_users_email_verification_token_hash", table_name="users")
    op.drop_column("users", "password_reset_expires_at")
    op.drop_column("users", "password_reset_token_hash")
    op.drop_column("users", "email_verification_expires_at")
    op.drop_column("users", "email_verification_token_hash")
    op.drop_column("users", "email_verified_at")
    op.drop_column("users", "is_email_verified")
