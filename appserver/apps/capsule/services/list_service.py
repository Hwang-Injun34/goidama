import uuid 
from typing import List, Optional
from itertools import groupby
from sqlmodel import select, desc 
from sqlalchemy import extract, and_
from sqlalchemy.orm import joinedload, selectinload
from collections import defaultdict

from appserver.apps.capsule.schemas import (
    CapsuleMapResponse, 
    CapsuleTimelineResponse,
    CapsuleCalendarResponse,
    MonthlyTimelineResponse,
)

from appserver.apps.capsule.models import (
    Capsule, 
    CapsuleParticipant, 
    ParticipantStatus,
    CapsuleStatus,
)

# 지도 표시
async def get_my_capsules_map_service(user_id: uuid.UUID, session) -> List[CapsuleMapResponse]:

    #=========================
    # 1. 참여자로 등록되어 있고 수락 완료된 캡슐 조회
    # + 지도 표시를 위해 위도(latitude), 경도(longitude)가 반드시 있는 것만 필터링
    #=========================
    statement = (
        select(Capsule)
        .join(CapsuleParticipant)
        .where(
            CapsuleParticipant.user_id == user_id,
            CapsuleParticipant.status == ParticipantStatus.ACCEPTED,
            Capsule.status != CapsuleStatus.PENDING,
            # 💡 좌표가 없는 데이터는 지도 API 호출 시 에러를 유발하므로 제외합니다.
            Capsule.latitude != None,
            Capsule.longitude != None
        )
        .distinct()
    )

    result = await session.execute(statement)
    capsules = result.scalars().all()

    # 반환 시에도 안전하게 한 번 더 체크 (Validation Error 방지)
    return [
        CapsuleMapResponse(
            id=c.id,
            title=c.title,
            status=c.status,
            open_at=c.open_at,
            is_group=c.is_group,
            address=c.address,
            thumbnail_url=c.thumbnail_url,
            skin_id=c.skin_id,
            latitude=c.latitude,
            longitude=c.longitude
        )
        for c in capsules if c.latitude is not None and c.longitude is not None
    ]

# 타임라인 표시 
async def get_my_timeline_service(user_id:uuid.UUID, session) -> List[CapsuleTimelineResponse]:
    statement = (
        select(Capsule)
        .join(CapsuleParticipant)
        .options(joinedload(Capsule.owner))
        .where(
            CapsuleParticipant.user_id == user_id,
            CapsuleParticipant.status == ParticipantStatus.ACCEPTED
        )
        .order_by(desc(Capsule.created_at))
    )
    
    result = await session.execute(statement)
    capsules = result.scalars().all()

    return [
        CapsuleTimelineResponse(
            id=c.id,
            title=c.title,
            status=c.status.value if hasattr(c.status, 'value') else c.status,
            open_at=c.open_at,
            is_group=c.is_group,
            address=c.address,
            thumbnail_url=c.thumbnail_url,
            skin_id=c.skin_id,
            created_at=c.created_at,
            owner_nickname=c.owner.nickname # 스키마의 필수 필드
        )
        for c in capsules
    ]

# 캘린더 전용
async def get_capsule_calendar_service(user_id: uuid.UUID, year: int, month: int, session):
    # 해당 월의 시작일과 종료일 계산 대신 DB의 extract 함수 사용
    statement = (
        select(Capsule)
        .join(CapsuleParticipant)
        .where(
            CapsuleParticipant.user_id == user_id,
            CapsuleParticipant.status == ParticipantStatus.ACCEPTED,
            extract('year', Capsule.open_at) == year,
            extract('month', Capsule.open_at) == month
        )
    )
    
    result = await session.execute(statement)
    capsules = result.scalars().all()
    
    return [
        CapsuleCalendarResponse(
            id=c.id,
            title=c.title,
            open_at=c.open_at,
            status=c.status.value if hasattr(c.status, 'value') else c.status
        ) for c in capsules
    ]


async def get_filtered_timeline_service(
    user_id: uuid.UUID, 
    sort: str, 
    status_filter: Optional[str], 
    session
):
    # =================================
    # 1. 기본 쿼리 (참여 중인 캡슐 + 오너 정보)
    # =================================
    statement = (
        select(Capsule)
        .join(CapsuleParticipant)
        .options(
        joinedload(Capsule.owner),
        selectinload(Capsule.participants).selectinload(CapsuleParticipant.user)
    )
        .where(
            CapsuleParticipant.user_id == user_id,
            CapsuleParticipant.status == ParticipantStatus.ACCEPTED
        )
    )
    
    # =================================
    # 2. 상태 필터 적용
    # =================================
    if status_filter and status_filter.upper() != "ALL":
        statement = statement.where(Capsule.status == status_filter.upper())

    # =================================
    # 3. 정렬 적용
    # =================================
    if sort == "name":
        statement = statement.order_by(Capsule.title.asc(), Capsule.open_at.desc())
    elif sort == "status":
        statement = statement.order_by(Capsule.status.asc(), Capsule.open_at.desc())
    elif sort == "dday":
        statement = statement.order_by(Capsule.open_at.asc()) # 날짜가 가까운 순
    else: # latest (기본값)
        statement = statement.order_by(desc(Capsule.open_at))

    result = await session.execute(statement)
    capsules = result.scalars().all()

    # =================================
    # 안전한 그룹화
    # =================================
    groups = defaultdict(list)
    for c in capsules:
        month = c.open_at.strftime("%Y-%m")
        groups[month].append(
            CapsuleTimelineResponse(
                id=c.id,
                title=c.title,
                status=c.status.value if hasattr(c.status, 'value') else c.status,
                open_at=c.open_at,
                is_group=c.is_group,
                address=c.address,
                thumbnail_url=c.thumbnail_url,
                skin_id=c.skin_id,
                created_at=c.created_at,
                owner_nickname=c.owner.nickname
            )
        )

    response_data = [
        MonthlyTimelineResponse(month=m, capsules=caps) 
        for m, caps in groups.items()
    ]

    if sort != "name" and sort != "status":
        response_data.sort(key=lambda x: x.month, reverse=True)

    return response_data