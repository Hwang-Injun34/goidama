import uuid 
from typing import Optional
from enum import Enum 
from datetime import datetime 

from sqlalchemy import UniqueConstraint, CheckConstraint
from sqlmodel import SQLModel, Field, func, Relationship

from apps.account.models import User

class FriendRequestStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


# ============================================================
# FriendRequest Model
# ============================================================
class FriendRequest(SQLModel, table=True):
    __tablename__="friend_requests"
    __table_args__ = (
        UniqueConstraint("request_id", "receiver_id", name="uq_friend_request_pair"),
        CheckConstraint("requester_id <> receiver_id", name="check_not_self_request"),
    )
    
    id: Optional[int] = Field(default=None, primary_key=True)

    request_id: uuid.UUID = Field(
        foreign_key="users.id", 
        index=True,
        nullable=False, 
        description="요청 보낸 사용자"
    )

    receiver_id: uuid.UUID = Field(
        foreign_key="users.id", 
        index=True,
        nullable=False,
        description="요청 받은 사용자"
    )

    status: FriendRequestStatus = Field(
        default=FriendRequestStatus.PENDING,
        nullable=False,
        index=True,
        description="요청 상태"
    )

    created_at: datetime = Field(
        nullable=False, 
        sa_column_kwargs={
            "server_default": func.now()
        }
    )
    updated_at: datetime = Field(
        nullable=False,
        sa_column_kwargs={
            "server_default": func.now(),
            "onupdate":func.now(),
        },
    )
    
    # Relationship 설정 (선택 사항이지만 있으면 편리함)
    requester: "User" = Relationship(sa_relationship_kwargs={"foreign_keys": "[FriendRequest.requester_id]"})
    receiver: "User" = Relationship(sa_relationship_kwargs={"foreign_keys": "[FriendRequest.receiver_id]"})


# ============================================================
# Friend Model
# ============================================================
class Friend(SQLModel, table=True):
    __tablename__ = "friends"
    __table_args__ = ( 
        UniqueConstraint("user_id", "friend_id", name="uq_friend_pair"),
        CheckConstraint("user_id <> friend_id", name="check_not_self_friend")
    )

    id: Optional[int] = Field(default=None, primary_key=True)

    user_id: uuid.UUID = Field(
        foreign_key="users.id",
        index=True,
        nullable=False,
        description="사용자 ID"
    )

    friend_id: uuid.UUID = Field(
        foreign_key="users.id",
        index=True,
        nullable=False, 
        description="친구 ID"
    )

    created_at: datetime = Field(
        sa_column_kwargs={"server_default":func.now()},
        nullable=False,
        description="친구 관계 생성일"
    )