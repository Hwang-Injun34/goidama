import uuid 
from fastapi import APIRouter, Depends
from sqlmodel import select
from typing import List 

from appserver.database.session import get_session 
from appserver.apps.account.models import User 
from appserver.apps.account.auth.jwt.dependencies import get_current_user 
from appserver.apps.notification.models import Notification 
from appserver.apps.notification.schemas import NotificationReadResponse, NotificationResponse

router = APIRouter()

@router.get("/list", response_model=List[NotificationResponse])
async def get_notifications(
    current_user: User = Depends(get_current_user),
    session = Depends(get_session)
):
    # 최신순 50개만 조회
    statement = (
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
    )
    result = await session.execute(statement)
    return result.scalars().all()


@router.post("/{id}/read", response_model=NotificationReadResponse)
async def mark_as_read(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session = Depends(get_session)
):
    result = await session.execute(
        select(Notification).where(Notification.id == id, Notification.user_id == current_user.id)
    )
    notif = result.scalar_one_or_none()
    if notif:
        notif.is_read = True
        await session.commit()
    return NotificationReadResponse()