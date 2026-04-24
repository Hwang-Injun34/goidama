from sqlmodel import select 
from typing import List
from sqlalchemy.orm import selectinload

from appserver.apps.account.models import User 
from appserver.apps.friend.models import Friendship, FriendRequest, RequestStatus
from appserver.apps.friend.schemas import FriendResponse

async def get_my_friend_list(user:User, session) -> List[FriendResponse]:
    statement = (
        select(Friendship)
        .where(Friendship.user_id == user.id)
        .options(selectinload(Friendship.friend_user))
    )

    result = await session.execute(statement)
    friendships = result.scalars().all()

    return [
        FriendResponse(
            id=fs.friend_user.id,
            nickname=fs.friend_user.nickname,
            friend_code=fs.friend_user.friend_code,
            friend_since=fs.created_at
        )
        for fs in user.friendships
    ]