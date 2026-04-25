import uuid 
from sqlmodel import select 
from sqlalchemy.orm import selectinload 
from fastapi import HTTPException

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
)

async def get_capsule_detail_service(capsule_id: uuid.UUID, user_id: uuid.UUID, session):
    # 모든 연관 데이터(참여자 정보, 작성자, 내용, 이미지)를 로드
    statement = (
        select(Capsule)
        .where(Capsule.id == capsule_id)
        .options(
            selectinload(Capsule.participants).selectinload(CapsuleParticipant.user),
            selectinload(Capsule.contents).selectinload(CapsuleContent.images)
        )
    )
    result = await session.execute(statement)
    capsule = result.scalar_one_or_none()

    if not capsule:
        raise HTTPException(404, "캡슐을 찾을 수 없습니다.")

    # [권한 체크] 참여자(수락한 사람)만 상세 조회가 가능함
    is_member = any(p.user_id == user_id and p.status == ParticipantStatus.ACCEPTED for p in capsule.participants)
    if not is_member:
        raise HTTPException(403, "이 캡슐을 볼 권한이 없습니다.")

    # 기본 정보 구성
    response = CapsuleDetailResponse(
        id=capsule.id,
        title=capsule.title,
        status=capsule.status,
        open_at=capsule.open_at,
        is_group=capsule.is_group,
        owner_id=capsule.owner_id,
        participants=[
            CheckInMemberStatus(
                nickname=p.user.nickname, 
                is_checked_in=p.is_checked_in, 
                checked_in_at=p.checked_in_at
            ) for p in capsule.participants if p.status == ParticipantStatus.ACCEPTED
        ]
    )

    # [보안 로직] OPENED 상태일 때만 실제 콘텐츠를 포함시킴
    if capsule.status == CapsuleStatus.OPENED:
        response.contents = [
            CapsuleContentResponse(
                id=c.id,
                user_id=c.user_id,
                text=c.text,
                # [수정] from_orm 대신 model_validate 사용
                images=[CapsuleImageResponse.model_validate(img) for img in c.images],
                created_at=c.created_at
            ) for c in capsule.contents
        ]
    else:
        # 잠겨있는 상태라면 contents 필드는 None으로 나감 (데이터 원천 차단)
        response.contents = None

    return response