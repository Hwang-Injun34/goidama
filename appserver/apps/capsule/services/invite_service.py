import uuid 
from typing import List 
from fastapi import HTTPException
from sqlmodel import select
from sqlalchemy.orm import selectinload 

from appserver.apps.friend.models import Friendship 
from appserver.apps.capsule.models import (
    Capsule, 
    CapsuleParticipant, 
    ParticipantRole, 
    ParticipantStatus,
)
from appserver.apps.capsule.schemas import InvitationRespondRequest, InvitationResponse

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
async def get_my_invitations_service(user_id: uuid.UUID, session):
    statement = (
        select(CapsuleParticipant)
        .where(CapsuleParticipant.user_id == user_id, CapsuleParticipant.status == ParticipantStatus.INVITED)
        .options(selectinload(CapsuleParticipant.capsule).selectinload(Capsule.owner))
    )
    result = await session.execute(statement)
    invites = result.scalars().all()
    
    return [
        InvitationResponse(
            participant_id=i.id,
            capsule_id=i.capsule_id,
            capsule_title=i.capsule.title,
            owner_nickname=i.capsule.owner.nickname,
            created_at=i.capsule.created_at
        ) for i in invites
    ]


# 초대 응답 
async def respond_invitation_service(participant_id: int, user_id: uuid.UUID, accept: bool, session):
    result = await session.execute(
        select(CapsuleParticipant)
        .where(
            CapsuleParticipant.id == participant_id, 
            CapsuleParticipant.user_id == user_id
        )
    )

    participant = result.scalar_one_or_none()
    
    if not participant:
        raise HTTPException(404, "초대 정보를 찾을 수 없습니다.")
    
    participant.status = ParticipantStatus.ACCEPTED if accept else ParticipantStatus.REJECTED
    await session.commit()
    
    return {"detail": "수락되었습니다." if accept else "거절되었습니다."}