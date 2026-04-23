import uuid 
from sqlmodel import select 
from apps.friend.models import InvitedCode
from appserver.apps.account.models import User 
from appserver.apps.friend.models import Friendship

async def establish_friendship_by_invite(invited_user_id: uuid.UUID, code: str, session):
    result = await session.execute(select(InvitedCode).where(InvitedCode.code == code)) 
    invite = result.scalar_one_or_none()

    if invite and invite.inviter_id != invited_user_id:
        # 양방향 관계
        f1 = Friendship(user_id=invite.inviter_id, friend_id=invited_user_id, source="invite")
        f2 = Friendship(user_id=invited_user_id, friend_id=invite.inviter_id, source="invite")
        
        session.add_all([f1, f2])
        await session.commit()
    
async def get_kakao_recommendations(user_id: uuid.UUID, kakao_friend_oauth_ids: list, session):
    statement = select(User).where(
        User.oauth_id.in_(kakao_friend_oauth_ids),
        User.id != user_id
    )
    result = await session.execute(statement)
    potential_friends = result.scalars().all()

    return potential_friends