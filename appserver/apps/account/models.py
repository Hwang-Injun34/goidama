import uuid 
from datetime import datetime
from typing import Optional, List 
from enum import Enum

from pydantic import EmailStr 
from sqlalchemy import UniqueConstraint, text
from sqlmodel import SQLModel, Field, func, Relationship, Column 

from apps.capsule.models import Capsule, CapsuleParticipant
from apps.friend.models import FriendRequest
from apps.notification.models import Notification

class UserRole(str, Enum):
    USER = "user"
    HOST = "host"
    ADMIN = "admin"

class Provider(str, Enum):
    KAKAO = "kakao"
    GOOGLE = "google"

# ============================================================
# User Model
# ============================================================
class User(SQLModel, table = True):
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("email", name="uq_user_email"),
        UniqueConstraint("nickname", name="uq_user_nickname"),
    )
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    
    email: Optional[EmailStr] = Field(
        default=None,
        nullable=True,
        index=True,
        max_length=128, 
        description="사용자 이메일"
        )
    
    nickname: str = Field(
        nullable=False, 
        index=True,
        max_length=40,
        description="사용자 별명"
        )
    
    name: Optional[str] = Field(
        default=None,
        max_length=40, 
        description="사용자 이름"
    )

    role: UserRole = Field(default=UserRole.USER)

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

    deleted_at: Optional[datetime] = Field(default=None, index=True)
    
    # 소셜 계정 정보(1:N)
    auth_providers: List["AuthProvider"] = Relationship(back_populates="user")
    
    # 내가 만든 캡슐(1:N)
    capsules: List["Capsule"] = Relationship(back_populates="owner")
    
    # 내가 참여 중인 캡슐들(N:M 연결 테이블을 통해)
    participating_capsules: List["CapsuleParticipant"] = Relationship(back_populates="user")
    
    # 친구 요청(보낸 것 / 받은 것)
    sent_requests: List["FriendRequest"] = Relationship(
        sa_relationship_kwargs={"primaryjoin": "User.id==FriendRequest.requester_id"},
        back_populates="requester"
    )
    received_requests: List["FriendRequest"] = Relationship(
        sa_relationship_kwargs={"primaryjoin": "User.id==FriendRequest.receiver_id"},
        back_populates="receiver"
    )

    # 알림
    notifications: List["Notification"] = Relationship(back_populates="user")



# ============================================================
# AuthProvider Model
# ============================================================
class AuthProvider(SQLModel, table = True):
    __tablename__ = "auth_providers"
    __table_args__ = (
        UniqueConstraint("provider", "provider_id", name="uq_provider_pid"),
    )

    id: Optional[int] = Field(default=None, primary_key=True) 
    
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)

    provider: Provider
    provider_id: str  
    
    user: Optional["User"] = Relationship(back_populates="auth_providers")