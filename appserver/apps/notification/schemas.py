import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from appserver.apps.notification.models import NotificationType

class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    type: NotificationType
    title: str
    content: str
    related_id: Optional[str] = None
    is_read: bool
    created_at: datetime

class NotificationReadResponse(BaseModel):
    status: str = "success"