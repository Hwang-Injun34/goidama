import uuid 
from sqlmodel import select

from appserver.apps.account.models import User, UserRole 
from appserver.apps.friend.models import Friendship 
from appserver.apps.notification.models import NotificationType 
from appserver.apps.notification.services.create_service import create_notification
from appserver.apps.capsule.models import (
    Capsule, 
    CapsuleParticipant, 
    CapsuleStatus, 
    ParticipantRole, 
    ParticipantStatus,
)
from appserver.apps.friend.models import Friendship

async def create_capsule_service(user_id: uuid.UUID, data, session):
    owner_result = await session.execute(
        select(User)
    )
    owner = owner_result.scalar_one()

    #===================
    # 1. 캡슐 기본 정보 생성
    #===================
    new_capsule = Capsule(
        owner_id=user_id,
        title=data.title,
        open_at=data.open_at, 
        latitude=data.latitude, 
        longitude=data.longitude,
        is_group=data.is_group,
        # 처음 생성 시에는 내용을 채우고 초대를 수락받아야 하므로 PENDING
        status=CapsuleStatus.PENDING 
    )
    session.add(new_capsule)
    # 캡슐 ID를 즉시 생성하여 아래 참여자 등록에서 사용하기 위해 flush 실행
    await session.flush()

    #===================
    # 2. 생성자(Owner)를 참여자로 등록
    #===================
    owner_participant = CapsuleParticipant(
        capsule_id=new_capsule.id,
        user_id=user_id,
        role=ParticipantRole.OWNER,
        status=ParticipantStatus.ACCEPTED # 대표자는 자동 수락 상태
    )
    session.add(owner_participant)
    
    #===================
    # 3. 공동 캡슐일 경우 친구 초대 처리
    #===================
    # data.friend_ids가 None일 경우를 대비해 (data.friend_ids or []) 처리
    if data.is_group and data.friend_ids:
        for f_id in data.friend_ids:
            # [보안체크] 실제로 나랑 친구 관계인 사람만 초대 가능 (Strong Connection)
            friend_check = await session.execute(
                select(Friendship).where(
                    Friendship.user_id == user_id, 
                    Friendship.friend_id == f_id
                )
            )
            if not friend_check.scalar_one_or_none():
                # 친구가 아닌 사람이 포함되어 있다면 건너뜀 (또는 에러 처리가능)
                continue 

            # A. 친구 초대장 추가
            new_invite = CapsuleParticipant(
                capsule_id=new_capsule.id,
                user_id=f_id,
                role=ParticipantRole.MEMBER,
                status=ParticipantStatus.INVITED # 친구는 초대받은 상태로 시작
            )
            session.add(new_invite)

            # B. 알림 생성
            await create_notification(
                user_id=f_id, # 알림 받을 친구 ID
                n_type=NotificationType.CAPSULE_INVITATION,
                title="[새로운 초대장]",
                message=f"{owner.nickname}님이 '{data.title}' 캡슐에 초대했습니다!",
                related_data={"capsule_id": str(new_capsule.id)},
                session=session
            )

    # 모든 트랜잭션 확정
    await session.commit()
    # 갱신된 데이터를 다시 불러옴 (ID, created_at 등)
    await session.refresh(new_capsule)
    
    return new_capsule