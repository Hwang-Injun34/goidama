import uuid 
from sqlmodel import select 

from appserver.apps.capsule.schemas import CapsuleMapResponse, CapsuleTimelineResponse
from appserver.apps.capsule.models import Capsule, CapsuleParticipant


async def get_my_capsules_map_service(user_id: uuid.UUID, session):
    #=========================
    # 1. 내가 오너이거나, 참여자로 등록된 캡슐 ID 찾기
    #=========================
    statement = (
        select(Capsule)
        .join(CapsuleParticipant)
        .where(CapsuleParticipant.user_id == user_id)
        .where(CapsuleParticipant.status == "accepted")
    )

    result = await session.execute(statement)
    capsules = result.scalars().all()

    return [
        CapsuleMapResponse(
            id=c.id,
            title=c.title,
            latitude=c.latitude,
            longitude=c.longitude,
            status=c.status,
            is_group=c.is_group,
            open_at=c.open_at
        )
        for c in capsules
    ]

async def get_my_timeline_service(user_id:uuid.UUID, session):
    statement = (
        select(Capsule)
        .join(CapsuleParticipant)
        .where(CapsuleParticipant.user_id == user_id)
        .where(CapsuleParticipant.status == "accepted")
        .order_by(Capsule.open_at.asc()) # 가까운 미래부터 멀리 있는 미래순
    )
    
    result = await session.execute(statement)
    capsules = result.scalars().all()

    return [
        CapsuleTimelineResponse(
            id=c.id,
            title=c.title,
            status=c.status,
            open_at=c.open_at,
            created_at=c.created_at,
            is_owner=(c.owner_id == user_id)
        )
        for c in capsules
    ]