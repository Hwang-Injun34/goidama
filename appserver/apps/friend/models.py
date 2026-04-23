import uuid 
from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field, func, Column, DateTime, UniqueConstraint

# ============================================================
# InviteCode Model
# ============================================================
class InvitedCode(SQLModel, table=True):
    __tablename__="invite_codes"

    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(index=True, unique=True)
    inviter_id: uuid.UUID = Field(foreign_key="users.id")

    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    )


# ============================================================
# Friendship Model
# ============================================================
class Friendship(SQLModel, table=True):
    __tablename__="friendships"
    __table_args__ = {
        UniqueConstraint("user_id", "friend_id", name="unique_friendship")
    }

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    friend_id: uuid.UUID = Field(foreign_key="users.id", index=True)

    source: str = Field(default="invite")

    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    )
