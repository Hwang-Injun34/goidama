import uuid 
from datetime import datetime, timezone
from sqlmodel import select 
from sqlalchemy.orm import selectinload
from fastapi import HTTPException

from appserver.apps.account.models import User 
from appserver.core.geo import get_distance
from appserver.apps.notification.services.create_service import create_notification 
from appserver.apps.notification.models import NotificationType
from appserver.apps.capsule.schemas import (
    CapsuleCheckInStatusResponse, 
    CheckInMemberStatus,
    CheckInResponse,
    CapsuleCheckInStatusResponse
)
from appserver.apps.capsule.models import (
    Capsule, 
    CapsuleStatus,
    CapsuleParticipant,
    ParticipantStatus,
)

async def check_in_service(
    capsule_id: uuid.UUID,
    user_id: uuid.UUID,
    lat: float,
    lon: float,
    session
) -> dict:
    #===========================
    # 1. 캡슐 및 참여자 로드
    #===========================
    statement = (
        select(Capsule)
        .where(Capsule.id == capsule_id)
        .options(selectinload(Capsule.participants).selectinload(CapsuleParticipant.user))
    )
    result = await session.execute(statement)
    capsule = result.scalar_one_or_none()
    
    if not capsule:
        raise HTTPException(404, "캡슐을 찾을 수 없습니다.")
    
    #===========================
    # 2. 상태 확인 (LOCKED일 때는 체크인 불가, 반드시 AVAILABLE이어야 함)
    #===========================
    if capsule.status == CapsuleStatus.LOCKED:
        raise HTTPException(400, "아직 개봉 날짜가 되지 않았습니다.")
    

    #===========================
    # 3. 수락한 멤법나 필터링
    #===========================
    accepted_participants = [p for p in capsule.participants if p.status == ParticipantStatus.ACCEPTED]
    my_participant = next((p for p in accepted_participants if p.user_id == user_id), None)
    
    if not my_participant:
        raise HTTPException(403, "이 캡슐의 수락된 참여자가 아닙니다.")
    
    #===========================
    # 4. 이미 개봉된 상태라면 즉시 정보 반환
    #===========================
    if capsule.status == CapsuleStatus.OPENED:
        return {
            "status": "opened",
            "message": "이미 개봉된 캡슐입니다.",
            "all_ready": True,
            "checked_in_count": len(accepted_participants),
            "total_count": len(accepted_participants)
        }

    #===========================
    # 5. 이미 체크인했는지 확인
    #===========================
    if my_participant.is_checked_in:
        count = sum(1 for p in accepted_participants if p.is_checked_in)
        return {
            "status": "success",
            "message": f"이미 체크인하셨습니다. 다른 참여자를 기다려주세요.",
            "all_ready": False,
            "checked_in_count": count,
            "total_count": len(accepted_participants)
        }

    #===========================
    # 6. 위치 검증(100m 이내)
    #===========================
    dist = get_distance(capsule.latitude, capsule.longitude, lat, lon)
    if dist > 100:
        raise HTTPException(400, f"장소와 너무 멉니다. (현재 거리: {int(dist)}m)")
    
    #===========================
    # 7. 체크인 기록
    #===========================
    my_participant.is_checked_in = True
    my_participant.checked_in_at = datetime.now(timezone.utc)

    #===========================
    # 8. 개봉 조건 판단
    #===========================
    checked_count = sum(1 for p in accepted_participants if p.is_checked_in)
    total_count = len(accepted_participants)
    all_ready = (checked_count == total_count)

    if all_ready:
        capsule.status = CapsuleStatus.OPENED
        msg = "축하합니다! 모든 참여자가 모여 캡슐이 활짝 열렸습니다!"
    else:
        msg = f"체크인 성공! {checked_count}/{total_count}명이 도착했습니다."

    #====================================
    # 9. 다른 참여자들에게 알림 전송
    #====================================
    for p in capsule.participants:
        if p.user_id != user_id:
            n_type = NotificationType.CAPSULE_OPENED if all_ready else NotificationType.MEMBER_CHECKIN
            title = "[캡슐 개봉]" if all_ready else "[친구 도착]"
            notif_msg = (
                f"전원이 모여 '{capsule.title}' 캡슐이 열렸습니다!" if all_ready 
                else f"{my_participant.user.nickname}님이 도착했습니다! ({checked_count}/{total_count})"
            )
            await create_notification(
                user_id=p.user_id, 
                n_type=n_type,
                title=title, 
                message=notif_msg, 
                related_id=str(capsule.id), 
                session=session
            )

    await session.commit()

    return {
        "status": capsule.status,
        "message": msg,
        "all_ready": all_ready,
        "checked_in_count": checked_count,
        "total_count": total_count
    }



async def get_check_in_status_service(capsule_id: uuid.UUID, session) -> CapsuleCheckInStatusResponse:
    #===========================
    # 1. 캡슐 정보 조회 (참여자와 그들의 유저 정보까지 Eager Loading)
    #===========================
    statement = (
        select(Capsule)
        .where(Capsule.id == capsule_id)
        .options(
            selectinload(Capsule.participants).selectinload(CapsuleParticipant.user)
        )
    )
    result = await session.execute(statement)
    capsule = result.scalar_one_or_none()

    if not capsule:
        raise HTTPException(404, "캡슐을 찾을 수 없습니다.")
    
    #===========================    
    # 2. 참여자 리스트 가공 (초대 수락한 멤버만 대상으로 함)
    #===========================
    accepted_members = [p for p in capsule.participants if p.status == ParticipantStatus.ACCEPTED]
    
    members_data = [
        CheckInMemberStatus(
            participant_id=p.id,
            nickname=p.user.nickname,
            profile_image_url=p.user.profile_image_url,
            is_checked_in=p.is_checked_in,
            checked_in_at=p.checked_in_at,
            status=p.status.value if hasattr(p.status, 'value') else p.status,
            role=p.role.value if hasattr(p.role, 'value') else p.role
        )
        for p in accepted_members
    ]

    #===========================
    # 3. 통계 계산
    #===========================
    total_count = len(accepted_members)
    checked_in_count = sum(1 for p in accepted_members if p.is_checked_in)

    return CapsuleCheckInStatusResponse(
        capsule_id=capsule.id,
        title=capsule.title,
        status=capsule.status.value if hasattr(capsule.status, 'value') else capsule.status,
        total_count=total_count,
        checked_in_count=checked_in_count,
        is_all_checked_in=(total_count == checked_in_count and total_count > 0),
        members=members_data
    )