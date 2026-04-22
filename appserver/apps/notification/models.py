from enum import Enum 
from datetime import datetime 
from typing import Optional 
import uuid 
from typing import TYPE_CHECKING

from sqlalchemy import Index 
from sqlmodel import SQLModel, Field, func, Relationship 

if TYPE_CHECKING:
    from appserver.apps.account.models import User

class NotificationType(str, Enum):
    CAPSULE_OPEN = "capsule_open"
    INVITE = "invite"
    CREATED = "created"

# ============================================================
# Notification Model
# ============================================================
class Notification(SQLModel, table=True):
    __tablename__ = "notifications"
    __table_args__ = (
        Index("ix_notification_user_unread", "user_id", "is_read"),
        Index("ix_notification_created_at", "created_at"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)

    user_id: uuid.UUID = Field( 
        foreign_key="users.id", 
        index=True, 
        nullable=False, 
        description="알림 수신자 ID"
    )

    type: NotificationType = Field(nullable=False, description="알림 유형")

    message: str = Field(max_length=255, nullable=False, description="알림 내용")

    is_read: bool = Field(default=False, nullable=False, description="읽음 여부")

    related_capsule_id: Optional[int] = Field( 
        foreign_key="capsules.id",
        default=None, 
        nullable=True, 
        description="관련 캡슐 ID"
    )

    created_at: datetime = Field( 
        sa_column_kwargs={"server_default": func.now()},
        nullable=False, 
        description="알림 생성일"
    )

    user: "User" = Relationship(back_populates="notifications")