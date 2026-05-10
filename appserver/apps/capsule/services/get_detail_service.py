import uuid 
from datetime import datetime 
from sqlalchemy.orm import selectinload 
from fastapi import HTTPException
from sqlalchemy import select, and_, func


from appserver.apps.friend.models import Friendship
from appserver.apps.capsule.models import (
    Capsule,
    CapsuleParticipant,
    CapsuleContent,
    ParticipantStatus,
    CapsuleStatus,

)
from appserver.apps.capsule.schemas import (
    CapsuleDetailResponse,
    CheckInMemberStatus,
    CapsuleContentResponse,
    CapsuleImageResponse,
    UserSummary,
)

# 캡슐 상세 조회
async def get_capsule_detail_service(capsule_id: uuid.UUID, user_id: uuid.UUID, session) -> CapsuleDetailResponse:
    #====================================
    # 1. 모든 연관 데이터 로드
    #====================================
    statement = (
        select(Capsule)
        .where(Capsule.id == capsule_id)
        .options(
            selectinload(Capsule.owner),
            selectinload(Capsule.participants).selectinload(CapsuleParticipant.user),
            selectinload(Capsule.contents).selectinload(CapsuleContent.user),
            selectinload(Capsule.contents).selectinload(CapsuleContent.images)
        )
    )
    
    result = await session.execute(statement)
    capsule = result.scalar_one_or_none()

    if not capsule:
        raise HTTPException(404, "캡슐을 찾을 수 없습니다.")

    #====================================
    # 2. 권한 체크 (참여자 OR 공개된 친구 캡슐)
    #====================================
    # A. 참여자 여부 확인
    is_member = any(
        p.user_id == user_id and p.status == ParticipantStatus.ACCEPTED 
        for p in capsule.participants
    )

    # B. 친구 공개 여부 확인 (추가된 로직)
    is_friend_viewable = False
    # 내가 참여자가 아닐 때만 친구 관계를 확인하여 서버 부하 감소
    if not is_member and capsule.visibility.upper() == "FRIENDS":
        # Friendship 테이블에서 나(user_id)와 주인(capsule.owner_id)이 친구인지 확인
        friend_stmt = select(Friendship).where(
            and_(
                Friendship.user_id == capsule.owner_id, 
                Friendship.friend_id == user_id,
                Friendship.status == ParticipantStatus.ACCEPTED
            )
        )
        friend_res = await session.execute(friend_stmt)
        if friend_res.scalar_one_or_none():
            is_friend_viewable = True

    # 참여자도 아니고, 공개된 친구의 캡슐도 아니라면 차단
    if not (is_member or is_friend_viewable):
        raise HTTPException(403, "이 캡슐을 볼 권한이 없습니다.")

    #====================================
    # 3. 기본 응답 객체 생성 (동일)
    #====================================
    participant_filter = (
        [ParticipantStatus.ACCEPTED] 
        if capsule.status != CapsuleStatus.PENDING 
        else [ParticipantStatus.ACCEPTED, ParticipantStatus.INVITED]
    )

    response = CapsuleDetailResponse(
        id=capsule.id,
        title=capsule.title,
        status=capsule.status.value if hasattr(capsule.status, 'value') else capsule.status,
        open_at=capsule.open_at,
        created_at=capsule.created_at, 
        is_group=capsule.is_group,
        address=capsule.address,
        thumbnail_url=capsule.thumbnail_url,
        skin_id=capsule.skin_id,
        latitude=capsule.latitude if capsule.latitude is not None else 0.0,
        longitude=capsule.longitude if capsule.longitude is not None else 0.0,
        owner=UserSummary.model_validate(capsule.owner),
        participants=[
            CheckInMemberStatus(
                participant_id=p.id,
                nickname=p.user.nickname, 
                profile_image_url=p.user.profile_image_url,
                is_checked_in=p.is_checked_in, 
                checked_in_at=p.checked_in_at,
                status=p.status.value if hasattr(p.status, 'value') else p.status,
                role=p.role.value if hasattr(p.role, 'value') else p.role
            ) for p in capsule.participants if p.status in participant_filter 
        ], 
        contents=None 
    )


    #====================================
    # 4. [보안 로직] OPENED 상태일 때만 실제 콘텐츠 포함
    #====================================
    if capsule.status == CapsuleStatus.OPENED:
        sorted_contents = sorted(capsule.contents, key=lambda x: x.created_at or datetime.min)
        
        response.contents = [
            CapsuleContentResponse(
                id=c.id,
                user=UserSummary.model_validate(c.user),
                text=c.text,
                created_at=c.created_at, 
                images=[
                    CapsuleImageResponse.model_validate(img) 
                    for img in sorted(c.images, key=lambda x: x.order)
                ],
            ) for c in sorted_contents
        ]
    
    return response
