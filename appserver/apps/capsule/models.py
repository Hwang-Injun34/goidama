import uuid 
from typing import Optional, List, TYPE_CHECKING
from enum import Enum 
from decimal import Decimal
from datetime import datetime 

from sqlalchemy import UniqueConstraint, CheckConstraint, Column, DateTime, Index, Numeric
from sqlmodel import SQLModel, Field, func, Relationship

if TYPE_CHECKING: 
    from appserver.apps.account.models import User



class CapsuleStatus(str, Enum):
    LOCKED = "locked"
    OPENED = "opened"

class CapsuleOpenType(str, Enum):
    TIME = "time"
    LOCATION = "location"

class ParticipantRole(str, Enum):
    OWNER = "owner"
    MEMBER = "member"

class ParticipantStatus(str, Enum):
    INVITED = "invited"
    ACCEPTED = "accepted"
    REJECTED = "rejected"

class OpenConditionType(str, Enum):
    TIME_ONLY = "time_only"
    LOCATION_REQUIRED = "location_required" 

class ContentType(str, Enum):
    PHOTO = "photo"
    MUSIC = "music"


# ============================================================
# Capsule Model
# ============================================================
class Capsule(SQLModel, table=True):
    __tablename__ = "capsules"
    __table_args__ = (
        CheckConstraint("current_edit_count <= max_edit_count", name="check_edit_count_limit"),

        Index("ix_capsule_owner_timeline", "owner_id", "is_deleted"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)

    owner_id: uuid.UUID = Field(
        foreign_key="users.id",
        index=True,
        nullable=False
    )

    title: Optional[str] = Field( 
        default=None,
        max_length=100,
        description="캡슐 제목(최대 100자)"
    )

    description: Optional[str] = Field(
        default=None, 
        max_length=100, 
        description="캡슐 내용(최대 100자)"
    )

    status: CapsuleStatus = Field(
        default=CapsuleStatus.LOCKED,
        nullable=False
    )

    is_group: bool = Field(default=False, nullable=False)

    max_edit_count: int = Field(default= 3, nullable=False, description="최대 수정 횟수")
    current_edit_count: int = Field(default = 0, nullable=False, description="현재 수정 횟수")

    is_deleted: bool = Field(default=False, nullable=False, index=True)

    created_at: datetime = Field(
        sa_column_kwargs={"server_default": func.now()},
        nullable=False
    )

    updated_at: datetime = Field(
        sa_column_kwargs={
            "server_default": func.now(),
            "onupdate": func.now(),
        },
        nullable=False
    )

    # 만든 사람(N:1)
    owner: "User" = Relationship(back_populates="capsules")

    # 캡슐 안의 컨텐츠들(사진, 노래 등)(1:N)
    contents: List["CapsuleContent"] = Relationship(back_populates="capsule")

    # 참여자
    participants: List["CapsuleParticipant"] = Relationship(back_populates="capsule")

    # 위치 정보(1:1)
    location: Optional["CapsuleLocation"] = Relationship(back_populates="capsule")

    # 개봉 조건(1:1)
    open_condition: Optional["CapsuleOpenCondition"] = Relationship(back_populates="capsule")

# ============================================================
# CapsuleContent Model
# ============================================================
class CapsuleContent(SQLModel, table=True):
    __tablename__ = "capsule_contents" 

    id: Optional[int] = Field(default=None, primary_key=True) 

    capsule_id: int = Field( 
        foreign_key="capsules.id",
        index=True, 
        nullable=False, 
        description="캡슐 ID"
    )

    content_type: ContentType = Field(
        nullable=False, 
        description="컨텐츠 타입(사진/음악 등)"
    )

    # 사진: 이미지 저장 경로(S3 URL 등)
    # 노래: 제목 
    content_title: Optional[str] = Field(
        default=None, 
        max_length=255, 
        description="제목(노래 제목 등)"
    )

    content_url: str = Field(
        max_length=512, 
        nullable=False, 
        description="컨텐츠 URL(이미지 경로 또는 링크)"
    )

    sequence: int = Field( 
        default=0, 
        nullable=False, 
        description="노출 순서"
    )

    created_at: datetime = Field(
        sa_column_kwargs={"server_default": func.now()},
        nullable=False 
    )

    capsule: "Capsule" = Relationship(back_populates="contents")

# ============================================================
# CapsuleParticipant Model
# ============================================================
class CapsuleParticipant(SQLModel, table=True):
    __tablename__ = "capsule_participants"
    __table_args__ = (
        UniqueConstraint("capsule_id", "user_id", name="uq_capsule_user_participation"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)

    capsule_id: int = Field(
        foreign_key="capsules.id",
        index=True,
        nullable=False,
        description="캡슐 ID"
    )

    user_id: uuid.UUID = Field(
        foreign_key="users.id",
        index=True,
        nullable=False,
        description="사용자 ID"
    )

    role: ParticipantRole = Field(nullable=False, description="역할(방장/멤버)")

    status: ParticipantStatus = Field(
        default=ParticipantStatus.INVITED,
        nullable=False, 
        description="참여 상태"
    )

    created_at: datetime = Field(
        sa_column_kwargs={"server_default": func.now()},
        nullable=False,
        description="참여일(초대일)"
    )

    user: "User" = Relationship(back_populates="participating_capsules")
    
    capsule: "Capsule" = Relationship(back_populates="participants")


# ============================================================
# CapsuleLocation Model
# ============================================================
class CapsuleLocation(SQLModel, table=True):
    __tablename__ = "capsule_locations"

    __table_args__ = (
        CheckConstraint("allowed_radius > 0", name="check_radius_positive"),

        Index("ix_capsule_location_coords", "latitude", "longitude"),
    )
    
    id: Optional[int] = Field(default=None, primary_key=True)

    capsule_id: int = Field(
        foreign_key="capsules.id",
        index = True,
        unique=True, 
        nullable=False,
        description="캡슐 ID"
    )

    latitude: Decimal = Field(
        sa_column=Column(Numeric(precision=10, scale=7), nullable=False),
        description="위도"
    )

    longitude: Decimal = Field(
        sa_column=Column(Numeric(precision=10, scale=7), nullable=False),
        description="경도"
    )

    address: Optional[str] = Field(
        default=None, 
        max_length=255, 
        description="주소"
    )

    place_name: Optional[str] = Field(
        default=None, 
        max_length=100,
        description="장소 이름"
    )

    allowed_radius: int = Field(
        default=100, 
        nullable=False, 
        description="허용 반경(meter)"
    )

    is_strict: bool = Field( 
        default=False, 
        nullable=False, 
        description="위치 기반 개봉 필수 여부"
    )

    created_at: datetime = Field(
        sa_column_kwargs={"server_default": func.now()},
        nullable=False 
    )

    capsule: "Capsule" = Relationship(back_populates="location")

# ============================================================
# CapsuleOpenCondition Model
# ============================================================
class CapsuleOpenCondition(SQLModel, table=True):
    __tablename__ = "capsule_open_conditions"

    id: Optional[int] = Field(
        default=None,
        primary_key=True
    )

    capsule_id: int = Field(
        foreign_key="capsules.id",
        index=True,
        unique=True, 
        nullable=False, 
        description="캡슐 ID"
    )
    
    open_type: OpenConditionType = Field(
        nullable=False, 
        description="개봉 조건 타입(시간전용/위치필수)"
    )

    open_at: datetime = Field( 
        nullable=False,
        description="개봉 기준 시간"
    )

    location_required: bool = Field( 
        default=False, 
        nullable=False, 
        description="위치 조건 필요 여부"
    )

    created_at: datetime = Field( 
        sa_column_kwargs={"server_default": func.now()},
        nullable=False
    )

    capsule: "Capsule" = Relationship(back_populates="open_condition")