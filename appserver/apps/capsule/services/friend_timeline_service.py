
from collections import defaultdict
from itertools import groupby
from sqlalchemy import select, and_, func
from sqlalchemy.orm import joinedload
from datetime import datetime
import uuid
from fastapi import HTTPException

from appserver.apps.account.models import User
from appserver.apps.capsule.models import Capsule, VisibilityType, ParticipantStatus
from appserver.apps.friend.models import Friendship, RequestStatus
from appserver.apps.capsule.schemas import MonthlyTimelineResponse, CapsuleTimelineResponse, FriendTimelineResponse


async def get_friend_timeline_service(friend_id: uuid.UUID, current_user_id: uuid.UUID, session):
    # 1. 보안 체크: 나(current_user_id)와 상대방(friend_id)이 실제 친구인지 확인
    # Friendship 테이블의 상태가 ACCEPTED인 경우만 허용
    friendship_stmt = select(Friendship).where(
        and_(
            Friendship.user_id == current_user_id,
            Friendship.friend_id == friend_id,
            Friendship.status == ParticipantStatus.ACCEPTED
        )
    )
    friend_check = await session.execute(friendship_stmt)
    if not friend_check.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="친구가 아니면 타임라인을 볼 수 없습니다.")

    # 2. 친구 유저 정보 가져오기 (닉네임 표시용)
    friend_user = await session.get(User, friend_id)
    if not friend_user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    # 3. 친구의 캡슐 중 visibility가 'FRIENDS'인 것만 조회
    # DB 데이터가 'FRIENDS' 또는 'friends'일 수 있으므로 func.upper()로 통일하여 비교
    capsule_stmt = (
        select(Capsule)
        .where(
            and_(
                Capsule.owner_id == friend_id,
                func.upper(Capsule.visibility) == "FRIENDS" # PRIVATE 데이터 유출 차단
            )
        )
        .order_by(Capsule.open_at.desc())
    )
    
    result = await session.execute(capsule_stmt)
    capsules = result.scalars().all()

    # 4. 프론트엔드 포맷(월별 그룹)으로 변환
    groups_dict = defaultdict(list)
    for c in capsules:
        # 날짜별 그룹 키 생성 (YYYY-MM)
        month_key = c.open_at.strftime("%Y-%m")
        
        # Pydantic 모델에 맞춰 데이터 가공
        groups_dict[month_key].append(
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
                owner_nickname=friend_user.nickname
            )
        )

    # 5. 월별 역순 정렬하여 최종 응답 생성 (최신 달이 위로)
    response_groups = [
        MonthlyTimelineResponse(month=m, capsules=caps) 
        for m, caps in sorted(groups_dict.items(), key=lambda x: x[0], reverse=True)
    ]

    return FriendTimelineResponse(
        friend_nickname=friend_user.nickname,
        groups=response_groups
    )