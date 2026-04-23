from http import server
import uuid 
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, List, Optional

from click import Option
from pydantic import EmailStr 
from sqlalchemy import func, Column, DateTime
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING: 
    from appserver.apps.capsule.models import Capsule, CapsuleParticipant
    from appserver.apps.friend.models import FriendRequest
    from appserver.apps.notification.models import Notification


class UserRole(str, Enum):
    USER = "user"
    HOST = "host"
    ADMIN = "admin"

class Provider(str, Enum):
    KAKAO = "kakao"


# ============================================================
# User Model
# ============================================================
class User(SQLModel, table = True):
    __tablename__ = "users"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    
    oauth_id: str = Field(index=True, unique=True)
    provider: Provider = Field(default=Provider.KAKAO)
    
    nickname: str = Field(index=True, max_length=40)
    role: UserRole = Field(default=UserRole.USER)

    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    )
    
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), 
            server_default=func.now(), 
            onupdate=func.now(), 
            nullable=False
        )
    )

    deleted_at: Optional[datetime] = Field(
        default=None, 
        sa_column=Column(DateTime(timezone=True), index=True)
    )

    #------------------------------------
    #   Relationship 설정
    #------------------------------------
    
    # JWT - refresh token
    refresh_tokens: List["RefreshToken"] = Relationship(back_populates="user")

    # 내가 만든 캡슐(1:N)
    capsules: List["Capsule"] = Relationship(back_populates="owner")
    
    # 내가 참여 중인 캡슐들(N:M 연결 테이블을 통해)
    participating_capsules: List["CapsuleParticipant"] = Relationship(back_populates="user")
    
    # 알림
    notifications: List["Notification"] = Relationship(back_populates="user")

# ============================================================
# RefreshToken
# ============================================================
class RefreshToken(SQLModel, table=True):
    __tablename__="refresh_tokens"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)

    token: str = Field(index=True, unique=True)

    device_id: uuid.UUID = Field(index=True) 
    
    expires_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    created_at: datetime = Field( 
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    )
    
    revoked: bool = Field(default=False)

    #------------------------------------
    #   Relationship 설정
    #------------------------------------
    user: Optional["User"] = Relationship(back_populates="refresh_tokens")