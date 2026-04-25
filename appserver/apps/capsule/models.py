import uuid 
from datetime import datetime 
from enum import Enum 
from typing import Optional, List, TYPE_CHECKING

from sqlalchemy import func, Column, DateTime, Float, String, Boolean, ForeignKey
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING: 
    from appserver.apps.account.models import User

class CapsuleStatus(str, Enum):
    PENDING = "pending" # 초대 수락 대기(공동 캡슐)
    LOCKED = "locked"   # 잠김(시간 대기 중)
    AVAILABLE = "available" # 시간 도달(위치 조건 대기 중)
    OPENED = "opened"   # 개봉 완료
    ARCHIVED = "archived"# 히스토리 보관

class ParticipantRole(str, Enum):
    OWNER = "owner"
    MEMBER = "member"

class ParticipantStatus(str, Enum):
    INVITED = "invited"
    ACCEPTED = "accepted"
    REJECTED = "rejected"

# ============================================================
# Capsule Model
# ============================================================
class Capsule(SQLModel, table=True):
    __tablename__ = "capsules"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    
    owner_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    
    title: str = Field(min_length =1, max_length=30)

    open_at: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    
    # 위도
    latitude: float = Field(sa_column=Column(Float, nullable=False))
    # 경도
    longitude: float = Field(sa_column=Column(Float, nullable=False))
    
    status: CapsuleStatus = Field(default=CapsuleStatus.PENDING)
    
    is_group: bool = Field(default=False) # 개인/공동 구분

    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )

    #-----------------------------------
    # 관계 설정
    #-----------------------------------
    # 만든 사람(N:1)
    owner: Optional["User"] = Relationship(back_populates="capsules")

    # 캡슐 안의 컨텐츠들(1:N)
    contents: List["CapsuleContent"] = Relationship(back_populates="capsule")

    # 참여자
    participants: List["CapsuleParticipant"] = Relationship(back_populates="capsule")

# ============================================================
# CapsuleContent Model
# ============================================================
class CapsuleContent(SQLModel, table=True):
    __tablename__ = "capsule_contents" 

    id: Optional[int] = Field(default=None, primary_key=True) 
    
    capsule_id: uuid.UUID = Field(foreign_key="capsules.id", index=True)
    
    user_id: uuid.UUID = Field(foreign_key="users.id") # 작성자

    text: str = Field(min_length=1, max_length=100)
    
    #-----------------------------------
    # 관계 설정
    #-----------------------------------
    capsule: Optional[Capsule] = Relationship(back_populates="contents")
    images: List["CapsuleImage"] = Relationship(back_populates="content")

# ============================================================
# CapsuleParticipant Model
# ============================================================
class CapsuleParticipant(SQLModel, table=True):
    __tablename__ = "capsule_participants"

    id: Optional[int] = Field(default=None, primary_key=True)
    capsule_id: uuid.UUID = Field(foreign_key="capsules.id", index=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)

    role: ParticipantRole = Field(default=ParticipantRole.MEMBER)
    status: ParticipantStatus = Field(default=ParticipantStatus.INVITED)

    # 위치 조건
    is_checked_in: bool = Field(default=False)
    checked_in_at: Optional[datetime] = Field(
        default=None, sa_column=Column(DateTime(timezone=True))
    )
    
    #-----------------------------------
    # 관계 설정
    #-----------------------------------
    capsule: Optional["Capsule"] = Relationship(back_populates="participants")
    user: Optional["User"] = Relationship(back_populates="participating_capsules")

# ============================================================
# CapsuleImage Model
# ============================================================
class CapsuleImage(SQLModel, table=True):
    __tablename__ = "capsule_images"

    id: Optional[int] = Field(default=None, primary_key=True)
    content_id: int = Field(foreign_key="capsule_contents.id", index=True)
    
    image_url: str = Field() # S3 경로
    order: int = Field(default=0) # 이미지 순서 (0~4)

    content: Optional[CapsuleContent] = Relationship(back_populates="images")