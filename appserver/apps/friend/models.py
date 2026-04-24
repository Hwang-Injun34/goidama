import uuid 

from enum import Enum
from typing import Optional
from datetime import datetime, timezone
from httpx import request
from pydantic import PrivateAttr
from sqlmodel import Relationship, SQLModel, Field, func, Column, DateTime, UniqueConstraint

from appserver.apps.account.models import User

class RequestStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


# ============================================================
# Friendship Model
# ============================================================
class Friendship(SQLModel, table=True):
    __tablename__="friendships"
    __table_args__ = (
        UniqueConstraint("user_id", "friend_id", name="unique_friendship"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    friend_id: uuid.UUID = Field(foreign_key="users.id", index=True)

    source: str = Field(default="invite")

    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    )

    #------------------------------------
    #   Relationship 설정
    #------------------------------------
    friend_user: "User" = Relationship(
        sa_relationship_kwargs={
            "primaryjoin": "Friendship.friend_id==User.id",
            "lazy": "selectin" # 비동기 환경에서 연관 데이터를 미리 로드함
        }
    )

# ============================================================
# FriendRequest Model
# ============================================================
class FriendRequest(SQLModel, table=True):
    __tablename__="friend_requests"
    __table_args__ = (
        UniqueConstraint("requester_id", "receiver_id", name="unique_request"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    requester_id: uuid.UUID = Field(foreign_key="users.id", index=True) 
    receiver_id: uuid.UUID = Field(foreign_key="users.id", index=True)

    status: RequestStatus = Field(default=RequestStatus.PENDING) 

    created_at: datetime = Field( 
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    )

    requester: "User" = Relationship(
        sa_relationship_kwargs={
            "primaryjoin": "FriendRequest.requester_id==User.id",
            "lazy": "selectin"
        }
    )