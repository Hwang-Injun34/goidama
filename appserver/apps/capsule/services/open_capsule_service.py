import uuid 
from fastapi import HTTPException 

from appserver.apps.capsule.schemas import MessageResponse 
from appserver.apps.capsule.models import CapsuleStatus, Capsule

async def open_capsule_service(capsule_id: uuid.UUID, user_id: uuid.UUID, session) -> MessageResponse:
    capsule = await session.get(Capsule, capsule_id)
    if not capsule:
        raise HTTPException(404, "캡슐을 찾을 수 없습니다.")
    
    # 권한 및 상태 체크 (AVAILABLE 상태여야 함)
    if capsule.status != CapsuleStatus.AVAILABLE:
        raise HTTPException(400, "아직 개봉할 수 없는 상태입니다.")

    # [옵션] 모든 멤버가 체크인했는지 확인하는 로직 추가 가능
    # if not all(p.is_checked_in for p in capsule.participants):
    #     raise HTTPException(400, "모든 멤버가 모여야 열 수 있습니다.")

    # 상태 변경
    capsule.status = CapsuleStatus.OPENED
    await session.commit()
    
    return MessageResponse(message="캡슐이 열렸습니다! 추억을 확인해보세요.")