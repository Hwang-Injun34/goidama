import uuid 
from email.policy import HTTP
from typing import List
from fastapi import HTTPException
from sqlalchemy import delete, select

from appserver.apps.account.models import User 
from appserver.apps.friend.models import Friendship, BlockList
from appserver.apps.friend.schemas import MessageResponse, BlockedUserResponse

# 친구 삭제(양방향 삭제)
async def remove_friendship(user_id:uuid.UUID, friend_id:uuid.UUID, session)->MessageResponse:
    # 양방향 삭제 
    statement = delete(Friendship).where(
        ((Friendship.user_id == user_id) & (Friendship.friend_id == friend_id)) |
        ((Friendship.user_id == friend_id) & (Friendship.friend_id == user_id))
    )
    await session.execute(statement)
    await session.commit()
    return MessageResponse(message="친구가 삭제되었습니다.")


# 사용자 차단
async def block_user_service(blocker_id: uuid.UUID, blocked_id: uuid.UUID, session)->MessageResponse:
    if blocker_id == blocked_id:
        raise HTTPException(400, "자기 자신 차단할 수 없습니다.")

    # 1. 기존 친구 관계가 있다면 즉시 삭제 (양방향)
    await remove_friendship(blocker_id, blocked_id, session)

    # 2. 오고 간 친구 요청이 있다면 모두 삭제
    exist_check = await session.execute(
        select(BlockList).where(
            BlockList.blocker_id == blocker_id, 
            BlockList.blocked_id == blocked_id
        )
    )
    if exist_check.scalar_one_or_none():
        raise HTTPException(400, "이미 차단된 사용자입니다.")

    # 3. 차단 목록에 추가
    new_block = BlockList(blocker_id=blocker_id, blocked_id=blocked_id)
    session.add(new_block)

    await session.commit()
    return MessageResponse(message="사용자를 차단합니다.")
    


# 차단 해제
async def unblock_user_service(blocker_id: uuid.UUID, blocked_id: uuid.UUID, session)->MessageResponse:
    statement = delete(BlockList).where(
        BlockList.blocker_id == blocker_id,
        BlockList.blocked_id == blocked_id
    )
    result = await session.execute(statement)

    if result.rowcount == 0:
        raise HTTPException(404, "차단 내역을 찾을 수 없습니다.")
    
    await session.commit()
    return MessageResponse(message="차단을 해제합니다.")


# 차단 목록 조회하기
async def get_blocked_user_list(user_id: uuid.UUID, session) -> List[BlockedUserResponse]:
    statement = (
        select(User, BlockList)
        .join(BlockList, User.id == BlockList.blocked_id)
        .where(BlockList.blocker_id == user_id)
    )

    result = await session.execute(statement)
    rows = result.all()

    return [
        BlockedUserResponse(
            id=user.id,
            nickname=user.nickname,
            friend_code=user.friend_code,
            profile_image_url=user.profile_image_url,
            blocked_at=block.created_at
        )
        for user, block in rows
    ]
