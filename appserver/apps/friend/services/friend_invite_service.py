import uuid 
from sqlmodel import select 

from appserver.apps.account.models import User 
from appserver.apps.friend.models import Friendship, FriendRequest, RequestStatus

# 가입 시 친구 코드 입력
async def establish_friendship_by_invite(invited_user_id: uuid.UUID, friend_code: str, session):
    #---------------
    # 1. 코드를 통해 초대자 찾기
    #---------------
    result = await session.execute(
        select(User).where(User.friend_code == friend_code)
    )
    inviter = result.scalar_one_or_none()

    #---------------
    # 2. 초대자가 존재하고, 자기 자신에게 초대받은 게 아닐 경우에만 진행
    #---------------
    if inviter and inviter.id != invited_user_id:

        existing_check = await session.execute(
            select(Friendship).where(
                Friendship.user_id == inviter.id,
                Friendship.friend_id == invited_user_id
            )
        )
        if existing_check.scalar_one_or_none():
            return
        
        f1 = Friendship(user_id=inviter.id, friend_id=invited_user_id, source="invite")
        f2 = Friendship(user_id=invited_user_id, friend_id=inviter.id, source="invite")

        session.add(f1)
        session.add(f2)
        await session.commit()