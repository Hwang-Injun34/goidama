import uuid 
from sqlmodel import select 
from typing import List
from sqlalchemy.orm import selectinload
from fastapi import HTTPException


from appserver.apps.account.models import User 
from appserver.apps.friend.models import Friendship, FriendRequest, RequestStatus
from appserver.apps.friend.schemas import FriendResponse, PendingRequestResponse

# 코드로 친구 요청 보내기
async def send_friend_request_by_code(requester: User, target_code: str, session):
    # 상대방 찾기
    result = await session.execute(
        select(User).where(User.friend_code == target_code)
    )
    receiver = result.scalar_one_or_none()
    
    if not receiver:
        raise HTTPException(404, "해당 코드를 가진 사용자를 찾을 수 없음")
    if receiver.id == requester.id:
        raise HTTPException(400, "자기 자신에게는 친구 요청을 보낼 수 없음")

    # 이미 친구인지 확인
    friend_check = await session.execute(
        select(Friendship).where(
            Friendship.user_id == requester.id, 
            Friendship.friend_id == receiver.id
        )
    )
    if friend_check.scalar_one_or_none():
        raise HTTPException(400, "이미 친구 관계")

    # 요청 생성
    new_request = FriendRequest(requester_id=requester.id, receiver_id=receiver.id)
    session.add(new_request)
    try:
        await session.commit()
    except:
        raise HTTPException(400, "이미 보낸 요청이거나 처리 중인 요청")
    return {"detail": f"{receiver.nickname}님에게 친구 요청을 보냈습니다."}

# 수락/거절
async def get_received_requests_service(user_id, session) -> List[PendingRequestResponse]:
    statement = (
        select(FriendRequest)
        .where(
            FriendRequest.receiver_id == user_id,
            FriendRequest.status == RequestStatus.PENDING
        )
        .options(selectinload(FriendRequest.requester))
    )
    
    result = await session.execute(statement)
    requests = result.scalars().all()

    return [
        PendingRequestResponse(
            request_id=fr.id,
            requester_id=fr.requester.id,
            requester_nickname=fr.requester.nickname,
            requester_code=fr.requester.friend_code,
            created_at=fr.created_at
        )
        for fr in requests
    ]

# 친구 요청 수락/거절하기
async def respond_friend_request(request_id: int, user_id: uuid.UUID, accept: bool, session):
    # 요청 존재 확인
    result = await session.execute(
        select(FriendRequest).where(FriendRequest.id == request_id)
    )
    fr = result.scalar_one_or_none()
    
    if not fr or fr.receiver_id != user_id:
        raise HTTPException(404, "요청을 찾을 수 없음")
    if fr.status != RequestStatus.PENDING:
        raise HTTPException(400, "이미 처리된 요청")

    if accept:
        fr.status = RequestStatus.ACCEPTED
        # 실제 Friendship 형성 (양방향)
        f1 = Friendship(user_id=fr.requester_id, friend_id=fr.receiver_id, source="search")
        f2 = Friendship(user_id=fr.receiver_id, friend_id=fr.requester_id, source="search")
        session.add_all([f1, f2])
    else:
        fr.status = RequestStatus.REJECTED
    
    await session.commit()
    return {"detail": "수락되었습니다." if accept else "거절되었습니다."}