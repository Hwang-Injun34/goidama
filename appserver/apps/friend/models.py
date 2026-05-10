import uuid 

from enum import Enum
from typing import Optional, List
from datetime import datetime, timezone
from httpx import request
from pydantic import PrivateAttr
from sqlmodel import Relationship, SQLModel, Field, func, Column, DateTime, UniqueConstraint

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from appserver.apps.account.models import User

# --- Enum 정의 ---
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

    status: RequestStatus = Field(default=RequestStatus.PENDING, index=True) 

    source: str = Field(default="invite")

    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    )

    #------------------------------------
    #   Relationship 설정
    #------------------------------------
    requester_user: "User" = Relationship(
        sa_relationship_kwargs={
            "primaryjoin": "Friendship.user_id==User.id",
            "lazy": "selectin"
        }
    )

    friend_user: "User" = Relationship(
        sa_relationship_kwargs={
            "primaryjoin": "Friendship.friend_id==User.id",
            "lazy": "selectin" # 비동기 환경에서 연관 데이터를 미리 로드함
        }
    )

# ============================================================
# BlockList Model
# ============================================================
class BlockList(SQLModel, table=True):
    __tablename__="block_list" 
    __table_args__ = (
        UniqueConstraint("blocker_id", "blocked_id", name="unique_block"),
    )
    
    id: Optional[int] = Field(default=None, primary_key=True)
    blocker_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    blocked_id: uuid.UUID = Field(foreign_key="users.id", index=True) 

    created_at: datetime = Field( 
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    )

# ============================================================
# FriendGroupMember Model(그룹-친구 연결 테이블 N:M)
# ============================================================
class FriendGroupMember(SQLModel, table=True):
    __tablename__ = "friend_group_members"
    
    group_id: uuid.UUID = Field(foreign_key="friend_groups.id", primary_key=True)
    friend_id: uuid.UUID = Field(foreign_key="users.id", primary_key=True)

# ============================================================
# FriendGroup Model(친구 그룹 테이블)
# ============================================================
class FriendGroup(SQLModel, table=True):
    __tablename__ = "friend_groups"
    __table_args__ = (
        UniqueConstraint("user_id", "name", name="unique_user_group_name"),
    )
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True) # 그룹 소유자
    name: str = Field(max_length=50) # 예: "대학교 동창", "가족"
    
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )

    #------------------------------------
    #   Relationship 설정
    #------------------------------------    
    owner: "User" = Relationship(back_populates="owned_groups")

    # Relationship: 이 그룹에 속한 친구들 (User 모델과 연결)
    members: List["User"] = Relationship(link_model=FriendGroupMember)