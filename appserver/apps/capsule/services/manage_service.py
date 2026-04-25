import os, shutil
from fastapi import HTTPException
from sqlmodel import select, delete
from appserver.apps.capsule.models import Capsule, CapsuleStatus, CapsuleContent, CapsuleImage

# 캡슐 정보 수정 (제목 및 개봉일)
async def update_capsule_service(capsule_id, user_id, title, open_at, session):
    result = await session.execute(select(Capsule).where(Capsule.id == capsule_id))
    capsule = result.scalar_one_or_none()
    
    if not capsule or capsule.owner_id != user_id:
        raise HTTPException(403, "수정 권한이 없습니다.")
    
    if capsule.status != CapsuleStatus.PENDING:
        raise HTTPException(400, "잠금 상태인 캡슐은 수정할 수 없습니다.")

    if title: capsule.title = title
    if open_at: capsule.open_at = open_at # 스키마에서 검증된 날짜가 들어옴
    
    await session.commit()
    return capsule


# 캡슐 삭제 (물리적 사진 삭제 포함)
async def delete_capsule_service(capsule_id, user_id, session):
    result = await session.execute(select(Capsule).where(Capsule.id == capsule_id))
    capsule = result.scalar_one_or_none()
    
    if not capsule or capsule.owner_id != user_id:
        raise HTTPException(403, "삭제 권한이 없습니다.")
    
    if capsule.status != CapsuleStatus.PENDING:
        raise HTTPException(400, "잠긴 캡슐은 삭제할 수 없습니다. (약속을 지켜주세요!)")

    # [비용 최적화] 로컬 저장소의 사진 폴더 삭제
    # uploads/capsules/{capsule_id} 폴더 전체 삭제
    folder_path = os.path.join("uploads", "capsules", str(capsule_id))
    if os.path.exists(folder_path):
        shutil.rmtree(folder_path)

    # DB 데이터 삭제 (Relationship에 의해 연쇄 삭제되도록 설정했거나 수동 삭제)
    await session.delete(capsule)
    await session.commit()
    
    return {"detail": "캡슐과 모든 추억이 삭제되었습니다."}