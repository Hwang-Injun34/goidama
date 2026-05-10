from mailbox import Message
import uuid 
from fastapi import APIRouter, Depends, Request
from typing import List

from fastapi.types import DependencyCacheKey 

from appserver.apps.account.models import User 

from appserver.database.session import get_session 
from appserver.apps.account.auth.jwt.dependencies import get_current_user 

from appserver.apps.friend.services.friend_list import get_my_friend_list
from appserver.apps.friend.services.block_service import (
    block_user_service, remove_friendship, 
    unblock_user_service,
    get_blocked_user_list,
)
from appserver.apps.friend.services.friend_request_service import (
    send_friend_request_by_code,
    respond_friend_request,
    get_received_requests_service,
)

from appserver.apps.friend.services.group_service import (
    get_my_groups_service,
    create_group_service,
    update_group_service,
    delete_group_service
)


from appserver.apps.friend.schemas import (
    FriendResponse, 
    PendingRequestResponse,
    FriendRequestRespondRequest,
    FriendGroupRequest,
    FriendGroupResponse,
    BlockedUserResponse,
    InviteLinkResponse,
    BulkActionResponse,
    FriendRequestSendRequest,
    MessageResponse,
)

router = APIRouter()

# 친구 목록
@router.get("/list", response_model=List[FriendResponse])
async def list_friend(
    current_user: User = Depends(get_current_user),
    session = Depends(get_session)
    ):
    return await get_my_friend_list(current_user, session)


# 친구 요청 보내기
@router.post("/request/send", response_model=MessageResponse)
async def send_request( 
    data: FriendRequestSendRequest,
    current_user: User = Depends(get_current_user),
    session = Depends(get_session)
): 
    return await send_friend_request_by_code(current_user, data.friend_code, session)


# 받은 친구 요청 목록 조회
@router.get("/request/received", response_model=List[PendingRequestResponse])
async def get_received_requests(
    current_user: User = Depends(get_current_user), 
    session = Depends(get_session)
):
    return await get_received_requests_service(user_id=current_user.id,session=session)


# 요청 응답하기 (수락/거절)
@router.post("/request/respond", response_model=MessageResponse)
async def respond_request(
    request_id: int, 
    accept: bool, 
    current_user: User = Depends(get_current_user), 
    session = Depends(get_session)
):
    return await respond_friend_request(request_id, current_user.id, accept, session)


# 초대 링크 생성  
@router.get("/invite/link", response_model=InviteLinkResponse)
async def get_invite_link(current_user: User = Depends(get_current_user)):
    base_url = "배포될 도메인 주소"
    invite_url = f"{base_url}?invite_code={current_user.friend_code}"

    return InviteLinkResponse(
        friend_code=current_user.friend_code,
        invite_url=invite_url
    )

# 친구 삭제
@router.delete("/delete/{friend_id}", response_model=MessageResponse)
async def delete_friend( 
    friend_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session = Depends(get_session)
):
    return await remove_friendship(current_user.id, friend_id, session)

# 사용자 차단 
@router.post("/block/{target_id}", response_model=MessageResponse)
async def block_user(
    target_id: uuid.UUID, 
    current_user: User = Depends(get_current_user),
    session = Depends(get_session)
):
    return await block_user_service(current_user.id, target_id, session)

# 차단 해제
@router.delete("/unblock/{target_id}", response_model=MessageResponse)
async def unblock_user(
    target_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session = Depends(get_session)
):
    return await unblock_user_service(current_user.id, target_id, session)


# 차단 관리(목록 조회)
@router.get("/block/list", response_model=List[BlockedUserResponse])
async def get_blocked_users(
    current_user: User = Depends(get_current_user), 
    session = Depends(get_session)
):
    return await get_blocked_user_list(current_user.id, session)


# 내 모든 친구 그룹 조회
@router.get("/groups", response_model=List[FriendGroupResponse])
async def list_my_groups(
    current_user: User = Depends(get_current_user),
    session = Depends(get_session)
):
    return await get_my_groups_service(current_user.id, session)

# 새 친구 그룹 만들기
@router.post("/groups", response_model=FriendGroupResponse)
async def create_group(
    data: FriendGroupRequest,
    current_user: User = Depends(get_current_user),
    session = Depends(get_session)
):
    return await create_group_service(current_user.id, data, session)

# 그룹 수정(이름 변경 또는 멤버 교체)
@router.patch("/groups/{group_id}", response_model=FriendGroupResponse)
async def update_group(
    group_id: uuid.UUID,
    data: FriendGroupRequest,
    current_user: User = Depends(get_current_user),
    session = Depends(get_session)
):
    return await update_group_service(group_id, current_user.id, data, session)


# 그룹 삭제(그룹만 삭제, 친구 관계 유지)
@router.delete("/groups/{group_id}")
async def delete_group(
    group_id: uuid.UUID, 
    current_user: User = Depends(get_current_user),
    session = Depends(get_session)
):
    return await delete_group_service(group_id, current_user.id, session)
