import uuid 
from datetime import datetime, timezone
from sqlmodel import select 
from sqlalchemy.orm import selectinload
from fastapi import HTTPException

from appserver.apps.account.models import User 
from appserver.core.geo import get_distance
from appserver.apps.notification.services.create_service import create_notification 
from appserver.apps.notification.models import NotificationType
from appserver.apps.capsule.schemas import CapsuleCheckInStatusResponse, CheckInMemberStatus
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
):
    #===========================
    # 1. 캡슐 및 참여자 정보 로드
    #===========================
    statement = (
        select(Capsule)
        .where(Capsule.id == capsule_id)
        .options(selectinload(Capsule.participants))
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
    if capsule.status == CapsuleStatus.OPENED:
        return {"status": "OPENED", "detail": "이미 개봉된 캡슐입니다."}
    if capsule.status != CapsuleStatus.AVAILABLE:
        raise HTTPException(400, "현재 체크인이 불가능한 상태입니다.")
    
    #===========================
    # 3. 내 참여 정보 및 중복 체크인 확인
    #===========================
    my_participant = next((p for p in capsule.participants if p.user_id == user_id), None)
    
    if not my_participant:
        raise HTTPException(403, "이 캡슐의 참여자가 아닙니다.")
    
    if my_participant.is_checked_in:
        # 이미 체크인했다면 남은 인원 현황만 알려줌
        checked_count = sum(1 for p in capsule.participants if p.is_checked_in)
        total_count = len(capsule.participants)
        return {
            "status": "WAITING",
            "detail": f"이미 체크인하셨습니다. ({checked_count}/{total_count}) 다른 친구를 기다려주세요."
        }

    #===========================
    # 4. 위치 검증(100m 이내)
    #===========================
    dist = get_distance(capsule.latitude, capsule.longitude, lat, lon)
    if dist > 100:
        raise HTTPException(400, f"장소와 너무 멉니다. 100m 이내로 접근해주세요. (현재 거리: {int(dist)}m)")
    
    #===========================
    # 5. 체크인 기록
    #===========================
    my_participant = next((p for p in capsule.participants if p.user_id == user_id), None)
    my_participant.is_checked_in = True
    my_participant.checked_in_at = datetime.now(timezone.utc)

    # 알림 메시지에 쓸 내 닉네임 가져오기
    current_user = await session.get(User, user_id)

    #===========================
    # 6. 모든 참여자가 체크인 완료했는지 확인
    #===========================
    all_ready = all(p.is_checked_in for p in capsule.participants)

    if all_ready:
        # 전원 방문 완료시 개봉
        capsule.status = CapsuleStatus.OPENED
        message = "축하합니다! 모든 멤버가 약속 장소에 모여 캡슐이 활짝 열렸습니다!"
    else:
        # 아직 기다려야 함
        checked_count = sum(1 for p in capsule.participants if p.is_checked_in)
        total_count = len(capsule.participants)
        message = f"체크인 성공! 현재 {checked_count}명 방문 완료. 남은 친구들이 도착하면 캡슐이 열립니다."

    #====================================
    # 7. [핵심] 다른 참여자들에게 알림 전송
    #====================================
    for p in capsule.participants:
        # 나를 제외한 다른 모든 참여자에게 알림 발송
        if p.user_id != user_id:
            # 상황에 따른 알림 타입과 메시지 분기
            if all_ready:
                n_type = NotificationType.CAPSULE_OPENED
                title = "[캡슐 개봉]"
                notif_msg = f"모든 멤버가 모였습니다! '{capsule.title}' 캡슐이 활짝 열렸습니다."
            else:
                n_type = NotificationType.MEMBER_CHECKIN
                title = "[친구 도착]"
                notif_msg = f"{current_user.nickname}님이 약속 장소에 도착했습니다! ({checked_count}/{total_count})"

            await create_notification(
                user_id=p.user_id,
                n_type=n_type,
                title=title,
                message=notif_msg,
                related_data={"capsule_id": str(capsule.id)},
                session=session
            )

    await session.commit()
    return {
        "status": capsule.status,
        "detail": message,
        "all_ready": all_ready,
        "checked_in_count": sum(1 for p in capsule.participants if p.is_checked_in),
        "total_count": len(capsule.participants)
    }



async def get_check_in_status_service(capsule_id: uuid.UUID, session):
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
            nickname=p.user.nickname,
            is_checked_in=p.is_checked_in,
            checked_in_at=p.checked_in_at
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
        status=capsule.status,
        total_count=total_count,
        checked_in_count=checked_in_count,
        is_all_checked_in=(total_count == checked_in_count),
        members=members_data
    )