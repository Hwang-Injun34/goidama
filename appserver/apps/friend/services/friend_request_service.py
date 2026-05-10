from mailbox import Message
import uuid 
from sqlmodel import select 
from typing import List
from sqlalchemy.orm import selectinload
from fastapi import HTTPException


from appserver.apps.account.models import User 
from appserver.apps.friend.models import Friendship, RequestStatus
from appserver.apps.friend.schemas import FriendResponse, PendingRequestResponse, MessageResponse, UserSummaryResponse

# 코드로 친구 요청 보내기
async def send_friend_request_by_code(
        requester: User, 
        target_code: str, 
        session
)-> MessageResponse:
    # 상대방 찾기
    result = await session.execute(
        select(User).where(User.friend_code == target_code)
    )
    receiver = result.scalar_one_or_none()
    
    if not receiver:
        raise HTTPException(404, "해당 코드를 가진 사용자를 찾을 수 없습니다.")
    if receiver.id == requester.id:
        raise HTTPException(400, "자기 자신에게는 친구 요청을 보낼 수 없습니다.")

    # 이미 친구인지 확인
    friend_check = await session.execute(
        select(Friendship).where(
            Friendship.user_id == requester.id, 
            Friendship.friend_id == receiver.id
        )
    )
    if friend_check.scalar_one_or_none():
        raise HTTPException(400, "이미 친구 관계입니다.")

    # 요청 생성
    new_request = Friendship(
        user_id=requester.id, 
        friend_id=receiver.id,
        status=RequestStatus.PENDING,
        source="search"
    )
    session.add(new_request)
    try:
        await session.commit()
    except:
        raise HTTPException(400, "이미 보낸 요청이거나 처리 중인 요청입니다.")
    
    return MessageResponse(message=f"{receiver.nickname}님에게 친구 요청을 보냈습니다.")


# 수락/거절
async def get_received_requests_service(user_id, session) -> List[PendingRequestResponse]:
    statement = (
        select(Friendship, User)
        .join(User, Friendship.user_id == User.id)  # 요청을 보낸 사람(User) 조인
        .where(
            Friendship.friend_id == user_id,        # 받는 사람이 '나'
            Friendship.status == RequestStatus.PENDING
        )
    )
    
    result = await session.execute(statement)
    rows = result.all() 

    return [
        PendingRequestResponse(
            request_id=friendship.id,
            created_at=friendship.created_at,
            requester=UserSummaryResponse(
                id=requester_user.id,
                nickname=requester_user.nickname,
                profile_image_url=requester_user.profile_image_url,
                friend_code=requester_user.friend_code 
            )
        )
        for friendship, requester_user in rows
    ]

# 친구 요청 수락/거절하기
async def respond_friend_request(request_id: int, user_id: uuid.UUID, accept: bool, session)-> MessageResponse:
    # 요청 존재 확인
    result = await session.execute(
        select(Friendship).where(Friendship.id == request_id)
    )
    fr = result.scalar_one_or_none()
    
    if not fr or fr.friend_id != user_id:
        raise HTTPException(404, "요청을 찾을 수 없습니다.")
        
    if fr.status != RequestStatus.PENDING:
        raise HTTPException(400, "이미 처리된 요청입니다.")

    if accept:
        # A. 기존 요청 수락 (상대 -> 나)
        fr.status = RequestStatus.ACCEPTED
        
        # B. 반대 방향 관계 처리 (나 -> 상대)
        # 이미 데이터가 있는지 조회 (ID 타입 불일치 방지를 위해 UUID 객체로 비교)
        reverse_stmt = select(Friendship).where(
            Friendship.user_id == user_id,
            Friendship.friend_id == fr.user_id
        )
        reverse_result = await session.execute(reverse_stmt)
        reverse_fs = reverse_result.scalar_one_or_none()

        if reverse_fs:
            # 이미 존재한다면(예: 서로 요청을 보냈던 경우) 상태만 업데이트
            reverse_fs.status = RequestStatus.ACCEPTED
        else:
            # 존재하지 않을 때만 새로 생성
            new_fs = Friendship(
                user_id=user_id,
                friend_id=fr.user_id,
                status=RequestStatus.ACCEPTED,
                source=fr.source
            )
            session.add(new_fs)
        
        msg = "친구 요청을 수락했습니다."
    else:
        # 거절 시
        fr.status = RequestStatus.REJECTED
        msg = "친구 요청을 거절했습니다."
    
    try:
        await session.commit()
    except Exception as e:
        await session.rollback()
        print(f"DB Error: {e}")
        raise HTTPException(500, "데이터베이스 처리 중 오류가 발생했습니다.")
    
    return MessageResponse(status="success", message=msg)