from email.policy import HTTP
import uuid 
from fastapi import HTTPException
from sqlalchemy import delete

from appserver.apps.friend.models import Friendship, FriendRequest, BlockList

# 친구 삭제(양방향 삭제)
async def remove_friendship(user_id:uuid.UUID, friend_id:uuid.UUID, session):
    # 양방향 삭제 
    statement = delete(Friendship).where(
        ((Friendship.user_id == user_id) & (Friendship.friend_id == friend_id)) |
        ((Friendship.user_id == friend_id) & (Friendship.friend_id == user_id))
    )
    await session.execute(statement)
    await session.commit()
    return {"detail": "친구 관계가 삭제"}

# 사용자 차단
async def block_user_service(blocker_id: uuid.UUID, blocked_id: uuid.UUID, session):
    if blocker_id == blocked_id:
        raise HTTPException(400, "자기 자신 차단할 수 없음")

    # 1. 기존 친구 관계가 있다면 즉시 삭제 (양방향)
    await remove_friendship(blocker_id, blocked_id, session)

    # 2. 오고 간 친구 요청이 있다면 모두 삭제
    await session.execute(
        delete(FriendRequest).where(
            ((FriendRequest.requester_id == blocker_id) & (FriendRequest.receiver_id == blocked_id)) |
            ((FriendRequest.requester_id == blocked_id) & (FriendRequest.receiver_id == blocker_id))
        )
    )

    # 3. 차단 목록에 추가
    new_block = BlockList(blocker_id=blocker_id, blocked_id=blocked_id)
    session.add(new_block)

    try:
        await session.commit()
    except:
        await session.rollback() # 이미 차단된 경우 에러 방지
        raise HTTPException(400, "이미 차단된 사용자")
    return {"detail": "사용자를 차단"}

# 차단 해제
async def unblock_user_service(blocker_id: uuid.UUID, blocked_id: uuid.UUID, session):
    await session.execute( 
        delete(BlockList).where(
            BlockList.blocker_id == blocker_id,
            BlockList.blocked_id == blocked_id
        )
    )
    await session.commit()
    return {"detail": "차단 해제"}