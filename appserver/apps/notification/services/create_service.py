import uuid 
from typing import Optional

from appserver.apps.notification.models import Notification, NotificationType

async def create_notification(
    user_id: uuid.UUID,
    n_type: NotificationType,
    title: str,
    message: str,
    related_id: Optional[str] = None,
    session = None
):
    new_notif = Notification(
        user_id=user_id,
        type=n_type,
        title=title,
        content=message,
        related_id=related_id,
        is_read=False
    )
    session.add(new_notif)
    # 알림은 메인 로직에 영향을 주면 안 되므로 보통 여기서 commit을 강제하지 않고 
    # 호출한 서비스의 트랜잭션에 태운다.