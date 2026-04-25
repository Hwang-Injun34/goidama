import uuid
from fastapi import HTTPException
from sqlmodel import select
from sqlalchemy.orm import selectinload

from appserver.apps.capsule.models import Capsule, CapsuleStatus, ParticipantRole, CapsuleParticipant
from appserver.core.geo import get_distance # 하버사인/geopy 엔진

async def lock_capsule_service(
    capsule_id: uuid.UUID,
    user_id: uuid.UUID,
    lat: float, # 잠그는 순간의 위도
    lon: float, # 잠그는 순간의 경도
    session
):
    #====================================
    # 1. 캡슐 존재 여부 확인 (contents를 미리 로드하도록 수정)
    #====================================
    statement = (
        select(Capsule)
        .where(Capsule.id == capsule_id)
        .options(selectinload(Capsule.contents)) # 2. 이 부분을 추가합니다.
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
        raise HTTPException(400, f"이미 잠겼거나 처리 중인 캡슐입니다.")

    # 4. 대한민국 좌표 범위 검증 (생략하지 말고 유지하세요)
    if not (33.0 <= lat <= 39.0 and 124.0 <= lon <= 133.0):
        raise HTTPException(400, detail="대한민국 영토 내에서만 캡슐을 봉인할 수 있습니다.")

    # 5. 콘텐츠 존재 여부 체크 (이제 에러 없이 작동합니다)
    if not capsule.contents:
        raise HTTPException(400, "최소 한 명 이상의 기억(사진/글)이 담겨야 캡슐을 잠글 수 있습니다.")

    # 6. 최종 잠금 처리
    capsule.latitude = lat
    capsule.longitude = lon
    capsule.status = CapsuleStatus.LOCKED

    await session.commit()
    await session.refresh(capsule)

    return {
        "status": "success",
        "detail": "캡슐이 성공적으로 봉인되었습니다.",
        "location": {"lat": lat, "lon": lon}
    }