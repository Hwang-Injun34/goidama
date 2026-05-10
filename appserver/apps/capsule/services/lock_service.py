from mailbox import Message
import uuid
from fastapi import HTTPException
from sqlmodel import select
from sqlalchemy.orm import selectinload

from appserver.core.reverse_geocode import reverse_geocode
from appserver.apps.capsule.models import Capsule, CapsuleStatus, ParticipantStatus
from appserver.apps.capsule.schemas import MessageResponse

async def lock_capsule_service(
    capsule_id: uuid.UUID,
    user_id: uuid.UUID,
    lat: float, # 잠그는 순간의 위도
    lon: float, # 잠그는 순간의 경도
    session
) -> MessageResponse:
    
    #====================================
    # 1. 캡슐 존재 여부 확인 (contents를 미리 로드하도록 수정)
    #====================================
    statement = (
        select(Capsule)
        .where(Capsule.id == capsule_id)
        .options(
            selectinload(Capsule.contents),
            selectinload(Capsule.participants)
        )
    )
    result = await session.execute(statement)
    capsule = result.scalar_one_or_none()

    if not capsule:
        raise HTTPException(404, "캡슐을 찾을 수 없습니다.")

    # 2. 권한 확인 (대표자 본인인지 확인)
    if capsule.owner_id != user_id:
        raise HTTPException(403, "캡슐을 잠글 권한이 없습니다.")

    # 3. 상태 확인
    if capsule.status != CapsuleStatus.PENDING:
        raise HTTPException(400, f"현재 '{capsule.status}' 상태이므로 봉인할 수 없습니다.")
    
    # 4. 공동 캡슐인 경우 참여자 전원 수락 여부 체크
    if capsule.is_group:
        # 아직 INVITED(대기) 상태인 참여자가 있는지 필터링
        unaccepted_members = [
            p for p in capsule.participants 
            if p.status == ParticipantStatus.INVITED
        ]
        
        if unaccepted_members:
            # 아직 수락하지 않은 친구가 있다면 봉인을 막음
            raise HTTPException(
                status_code=400, 
                detail=f"아직 {len(unaccepted_members)}명의 친구가 초대를 수락하지 않았습니다. 모든 멤버가 수락해야 봉인이 가능합니다."
            )

    # 5. 좌표 범위 검증(중복 체크)
    if not (33.0 <= lat <= 39.0 and 124.0 <= lon <= 133.0):
        raise HTTPException(400, detail="대한민국 영토 내에서만 캡슐을 봉인할 수 있습니다.")

    # 6. 콘텐츠 존재 여부 체크
    if not capsule.contents:
        raise HTTPException(400, "최소 한 명 이상의 기억(사진/글)이 담겨야 캡슐을 잠글 수 있습니다.")
    
    detected_address = await reverse_geocode(lat, lon)

    # 6. 최종 잠금 처리
    capsule.latitude = lat
    capsule.longitude = lon
    capsule.status = CapsuleStatus.LOCKED

    await session.commit()

    try:
        detected_address = await reverse_geocode(lat, lon)
        capsule.address = detected_address
        await session.commit()
    except:
        pass

    return MessageResponse(message="캡슐이 성공적으로 봉인되었습니다.")