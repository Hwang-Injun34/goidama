import uuid 
from typing import List 
from fastapi import HTTPException
from sqlmodel import select
from sqlalchemy import desc
from sqlalchemy.orm import selectinload, joinedload

from appserver.apps.notification.services.create_service import create_notification
from appserver.apps.notification.models import NotificationType

from appserver.apps.account.models import User 
from appserver.apps.friend.models import Friendship 
from appserver.apps.capsule.models import (
    Capsule, 
    CapsuleParticipant, 
    ParticipantRole, 
    ParticipantStatus,
    CapsuleStatus
)
from appserver.apps.capsule.schemas import (
    InvitationRespondRequest, 
    InvitationResponse, 
    MessageResponse
)

# 친구 초대하기
async def invite_friends_from_list_service(
    capsule_id: uuid.UUID, 
    owner_id: uuid.UUID,
    friend_ids: List[uuid.UUID],
    session
):
        
    #---------------
    # 1. 캡슐 존재 및 권한 확인
    #---------------
    result = await session.excute(
        select(Capsule)
        .where(Capsule.id == capsule_id)
    )

    capsule = result.scalar_one_or_none()
    if not capsule or capsule.owner_id != owner_id: 
        raise HTTPException(403, "초대 권한이 없습니다.")
    
    #---------------
    # 2. 친구 관계인지 검증
    #---------------
    for f_id in friend_ids:
        friend_check = await session.execute(
            select(Friendship)
            .where(
                Friendship.user_id == owner_id,
                Friendship.friend_id == f_id
            )
        )

        if not friend_check.scalar_one_or_none():
            continue 

        #---------------
        # 3. 이미 캡슐에 참여/초대 중인지 확인
        #---------------
        participant_check = await session.execute( 
            select(CapsuleParticipant).where(
                CapsuleParticipant.capsule_id == capsule_id,
                CapsuleParticipant.user_id == f_id
            )
        )
        if participant_check.scalar_one_or_none():
            continue 

        new_participant = CapsuleParticipant(
            capsule_id = capsule_id,
            user_id = f_id,
            role = ParticipantRole.MEMBER ,
            status = ParticipantStatus.INVITED
        )
    await session.commit()
    return {"detail": f"{len(friend_ids)}명에게 초대장을 보냈습니다."}

# 내 초대 목록
async def get_my_invitations_service(user_id: uuid.UUID, session) -> List[InvitationResponse]:
    #  내가 초대받은(INVITED) 내역 조회
    statement = (
        select(CapsuleParticipant)
        .options(
            joinedload(CapsuleParticipant.capsule)
            .joinedload(Capsule.owner)
        )
        .where(
            CapsuleParticipant.user_id == user_id, 
            CapsuleParticipant.status == ParticipantStatus.INVITED
        )
        .order_by(desc(CapsuleParticipant.id)) 
    )

    result = await session.execute(statement)
    invites = result.scalars().all()
    
    # 2. Pydantic 객체 대신 '원시 딕셔너리' 형태로 반환
    # FastAPI의 response_model이 이 딕셔너리를 보고 InvitationResponse로 자동 변환합니다.
    response_list = []
    for i in invites:
        # 데이터 정합성 체크 (데이터가 깨진 경우 대비)
        if not i.capsule or not i.capsule.owner:
            continue
            
        response_list.append({
            "participant_id": i.id,
            "capsule_id": i.capsule_id,
            "capsule_title": i.capsule.title,
            "owner_nickname": i.capsule.owner.nickname,
            # 시간대(timezone) 이슈 방지를 위해 캡슐 생성일 전달
            "created_at": i.capsule.created_at 
        })
    
    return response_list


# 초대 응답 
async def respond_invitation_service(participant_id: int, user_id: uuid.UUID, accept: bool, session) -> MessageResponse:
    # ===========================
    # 1. 초대 내역 조회(캡슐 정보 포함)
    # ===========================
    statement = (
        select(CapsuleParticipant)
        .where(
            CapsuleParticipant.id == participant_id, 
            CapsuleParticipant.user_id == user_id
        )
        .options(selectinload(CapsuleParticipant.capsule))
    )
    result = await session.execute(statement)
    participant = result.scalar_one_or_none()
    
    if not participant:
        raise HTTPException(404, "초대 정보를 찾을 수 없습니다.")
    
    # ===========================
    # 2. 캡슐 상태 확인 (PENDING 상태에서만 수락/거절 가능)
    # ===========================
    if participant.capsule.status != CapsuleStatus.PENDING:
        raise HTTPException(400, f"이미 {participant.capsule.status} 상태인 캡슐에는 응답할 수 없습니다.")
    

    # ===========================
    # 3. 상태 업데이트
    # ===========================
    if accept:
        participant.status = ParticipantStatus.ACCEPTED
        msg = "초대를 수락했습니다. 이제 추억을 담을 수 있습니다!"
    else:
        participant.status = ParticipantStatus.REJECTED
        msg = "초대를 거절했습니다."
    
    #====================================
    # 4. (선택사항) 방장에게 알림 전송
    #====================================
    # 수락했을 때 방장에게 알림을 보내면 좋습니다.
    if accept:
        # 현재 수락한 유저 정보 가져오기
        me = await session.get(User, user_id)
        await create_notification(
            user_id=participant.capsule.owner_id,
            n_type=NotificationType.MEMBER_JOINED, # 멤버 합류 알림 타입
            title="[초대 수락]",
            message=f"{me.nickname}님이 '{participant.capsule.title}' 캡슐 초대를 수락했습니다!",
            related_id=str(participant.capsule_id),
            session=session
        )

    await session.commit()

    return MessageResponse(message=msg)