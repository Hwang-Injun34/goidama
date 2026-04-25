import uuid 
from typing import List 
from anyio import CapacityLimiter
from fastapi import HTTPException, UploadFile
from sqlmodel import select 

from appserver.apps.capsule.models import (
    Capsule, 
    CapsuleContent, 
    CapsuleParticipant, 
    CapsuleStatus, 
    ParticipantStatus, 
    CapsuleImage
)

from appserver.core.local_storage import storage_service

async def add_capsule_content_service(
        capsule_id: uuid.UUID,
        user_id: uuid.UUID,
        text: str,
        images:List[UploadFile],
        session 
):
    #==================
    # 1. 캡슐 상태 확인
    #==================
    result = await session.execute(
        select(Capsule).where(Capsule.id == capsule_id)
    )
    capsule = result.scalar_one_or_none()

    if not capsule:
        raise HTTPException(404, "캡슐을 찾을 수 없습니다.")
    
    if capsule.status != CapsuleStatus.PENDING:
        raise HTTPException(400, f"현재 캡슐 상태가 '{capsule.status}'이므로 콘텐츠를 추가할 수 없습니다.")
    
    #==================
    # 2. 참여 및 수락 여부 확인
    #==================
    part_result = await session.execute(
        select(CapsuleParticipant).where(
            CapsuleParticipant.capsule_id == capsule_id,
            CapsuleParticipant.user_id == user_id,
            CapsuleParticipant.status == ParticipantStatus.ACCEPTED
        )
    )
    participant = part_result.scalar_one_or_none()

    if not participant:
        raise HTTPException(403, "해당 캡슐의 수락된 참여자가 아닙니다. 먼저 초대를 수락해주세요.")
    
    #==================
    # 3. 사진 개수 제한 (1~5장)
    #==================
    if not images or len(images) > 5:
        raise HTTPException(400, "사진은 1장 이상, 5장 이하로 업로드해주세요.")
    
    #==================
    # 4. 텍스트 저장
    #==================
    new_content = CapsuleContent(
        capsule_id=capsule_id,
        user_id=user_id,
        text=text
    )
    session.add(new_content)
    await session.flush()

    #==================
    # 5. 이미지 최적화 및 로컬 저장
    #==================
    folder_path = f"capsules/{capsule_id}/{user_id}"
    for index, img_file in enumerate(images):
        try:
            img_url = await storage_service.upload_optimized_image(
                img_file, 
                folder=folder_path
            )
            
            new_image = CapsuleImage(
                content_id=new_content.id,
                image_url=img_url,
                order=index
            )
            session.add(new_image)
        except Exception as e:
            # 파일 저장 중 에러 발생 시 처리
            print(f"Image upload error: {e}")
            raise HTTPException(500, "이미지 처리 중 오류가 발생했습니다.")

    # 모든 작업 완료 후 Commit
    await session.commit()
    
    return {
        "status": "success",
        "detail": "당신의 소중한 추억이 캡슐에 안전하게 담겼습니다.",
        "content_id": new_content.id
    }