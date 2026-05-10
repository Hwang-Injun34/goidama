import uuid 
import os, shutil
from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta
from fastapi import HTTPException
from sqlmodel import select, delete

from appserver.apps.capsule.models import (
    Capsule, 
    CapsuleStatus, 
    CapsuleContent,
    CapsuleImage
)

from appserver.apps.capsule.schemas import MessageResponse


# 캡슐 정보 수정 (제목 및 개봉일)
async def update_capsule_service(capsule_id, user_id, title, open_at, session) -> Capsule:
    # 1. 캡슐 존재 및 권한 확인
    result = await session.execute(select(Capsule).where(Capsule.id == capsule_id))
    capsule = result.scalar_one_or_none()
    
    if not capsule:
        raise HTTPException(404, "캡슐을 찾을 수 없습니다.")
    
    if capsule.owner_id != user_id:
        raise HTTPException(403, "캡슐 소유자만 수정할 수 있습니다.")
    
    # 2. 상태 확인 (이미 잠기거나 개봉된 캡슐은 수정 불가)
    if capsule.status != CapsuleStatus.PENDING:
        raise HTTPException(400, f"현재 '{capsule.status}' 상태이므로 정보를 수정할 수 없습니다.")

    # 3. 제목 수정
    if title:
        if len(title) > 30:
            raise HTTPException(400, "제목은 30자 이내여야 합니다.")
        capsule.title = title

    # 4. 개봉일 수정 (검증 로직 포함)
    if open_at:
        # 시간 정규화 (00:00:00)
        open_at = open_at.replace(hour=0, minute=0, second=0, microsecond=0)
        if open_at.tzinfo is None:
            open_at = open_at.replace(tzinfo=timezone.utc)

        # 날짜 범위 검증 (1년 뒤 ~ 10년 이내)
        now = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        min_date = now + relativedelta(years=1)
        max_date = now + relativedelta(years=10)

        if open_at < min_date or open_at > max_date:
            raise HTTPException(400, "개봉 날짜는 오늘로부터 1년 뒤에서 10년 이내여야 합니다.")
        
        capsule.open_at = open_at
    
    await session.commit()
    await session.refresh(capsule)
    return capsule


# 캡슐 삭제 (물리적 사진 삭제 포함)
async def delete_capsule_service(capsule_id: uuid.UUID, user_id: uuid.UUID, session)-> MessageResponse:
    # 1. 캡슐 존재 및 권한 확인
    result = await session.execute(select(Capsule).where(Capsule.id == capsule_id))
    capsule = result.scalar_one_or_none()

    if not capsule:
        raise HTTPException(404, "캡슐을 찾을 수 없습니다.")
    
    if capsule.owner_id != user_id:
        raise HTTPException(403, "캡슐 소유자만 삭제할 수 있습니다.")
    
    # 2. 상태 확인 (정책 반영)
    # PENDING(초대 중/작성 중) 이거나 OPENED(열람 완료) 상태일 때만 삭제 가능
    allowed_statuses = [CapsuleStatus.PENDING, CapsuleStatus.OPENED]
    
    if capsule.status not in allowed_statuses:
        # LOCKED(봉인됨) 거나 AVAILABLE(시간됨/장소대기) 상태일 때는 삭제 불가
        raise HTTPException(
            status_code=400, 
            detail="봉인된 캡슐은 약속을 지키기 위해 삭제할 수 없습니다. 개봉 후에 정리해 주세요."
        )

    # 3. 물리적 파일 삭제 (이미지 폴더)
    # 이전에 설정한 경로 규칙(uploads/capsules/{capsule_id})을 그대로 따릅니다.
    upload_base_path = "uploads"
    folder_path = os.path.join(upload_base_path, "capsules", str(capsule_id))
    
    try:
        if os.path.exists(folder_path):
            shutil.rmtree(folder_path) # 폴더 내의 모든 유저 이미지를 한꺼번에 삭제
    except Exception as e:
        # 파일 삭제 실패가 DB 삭제를 막지 않도록 예외 로깅만 수행
        print(f"이미지 폴더 삭제 중 오류 발생: {e}")

    # 4. DB 데이터 삭제 (Hard Delete)
    # 레코드를 물리적으로 지움으로써 '오늘 생성 갯수 카운트' 쿼리에서 제외되어 횟수가 자동 복구됨
    await session.delete(capsule)
    await session.commit()
    
    return MessageResponse(
        status="success", 
        message="캡슐이 파기되었습니다. 오늘 생성 가능 횟수가 복구되었습니다."
    )