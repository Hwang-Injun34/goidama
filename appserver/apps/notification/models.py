import uuid
from datetime import datetime
from enum import Enum
from typing import Optional
from sqlalchemy import func, Column, DateTime, String, Boolean
from sqlmodel import SQLModel, Field, Relationship

from appserver.apps.account.models import User 

class NotificationType(str, Enum):
    FRIEND_REQUEST = "friend_request"     # 친구 요청
    FRIEND_ACCEPTED = "friend_accepted"   # 친구 수락
    CAPSULE_INVITE = "capsule_invite"     # 캡슐 초대
    CAPSULE_AVAILABLE = "capsule_available" # 개봉일 도달 (알이 흔들림)
    MEMBER_CHECKIN = "member_checkin"     # 멤버 체크인 현황 (X/N명 완료)
    CAPSULE_OPENED = "capsule_opened"     # 캡슐 최종 개봉 (꽃이 핌)

class Notification(SQLModel, table=True):
    __tablename__ = "notifications"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True) # 알림을 받을 사람
    
    type: NotificationType = Field(...)
    title: str = Field(max_length=100)
    content: str = Field(max_length=255)
    
    # 클릭 시 이동할 경로 (예: /capsule/UUID)
    related_id: Optional[str] = Field(default=None) 
    
    is_read: bool = Field(default=False)
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )

    # Relationship
    user: Optional["User"] = Relationship(back_populates="notifications")