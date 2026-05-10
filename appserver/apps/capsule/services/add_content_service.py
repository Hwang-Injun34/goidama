import uuid 
from typing import List 
from anyio import CapacityLimiter
from fastapi import HTTPException, UploadFile
from sqlmodel import select 

from appserver.apps.capsule.schemas import MessageResponse
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
        rep_index: int,
        session 
) -> MessageResponse:
    
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
        raise HTTPException(403, "해당 캡슐의 참여자가 아니거나 초대를 수락하지 않았습니다.")
    
    #==================
    # 3. 사진 개수 제한 (1~5장)
    #==================
    if not images or len(images) > 5:
        raise HTTPException(400, "사진은 1장 이상, 5장 이하로 업로드해주세요.")
    
    if rep_index < 0 or rep_index >= len(images):
        raise HTTPException(400, "대표 이미지 인덱스 범위가 올바르지 않습니다.")
    
    #==================
    # 4. 텍스트 컨텐츠 저장
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
    representative_image_url = None 

    for index, img_file in enumerate(images):
        try:
            img_url = await storage_service.upload_optimized_image(
                img_file, 
                folder=folder_path
            )
            # 대표 이미지 URL 저장
            if index == rep_index:
                representative_image_url = img_url 
                    
            new_image = CapsuleImage(
                content_id=new_content.id,
                image_url=img_url,
                order=index
            )
            session.add(new_image)
        
        except Exception as e:
            print(f"Image upload error: {e}")
            raise HTTPException(500, "이미지 처리 중 오류가 발생했습니다.")

    #==================
    # 6. 캡슐 썸네일 업데이트
    #==================
    if representative_image_url and (capsule.thumbnail_url is None or capsule.owner_id == user_id):
        capsule.thumbnail_url = representative_image_url

    # 모든 작업 완료 후 Commit
    await session.commit()
    
    return MessageResponse(message="캡슐에 안전하게 담겼습니다.")