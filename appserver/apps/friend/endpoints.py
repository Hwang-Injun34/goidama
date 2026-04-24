from fastapi import APIRouter, Depends, Request
from typing import List 

from appserver.database.session import get_session 
from appserver.apps.account.models import User 
from appserver.apps.account.auth.jwt.dependencies import get_current_user 
from appserver.apps.friend.schemas import FriendResponse, PendingRequestResponse
from appserver.apps.friend.services.friend_list import get_my_friend_list
from appserver.apps.friend.services.friend_request_service import (
    send_friend_request_by_code,
    respond_friend_request,
    get_received_requests_service,
)


router = APIRouter()

# 친구 목록 조회
@router.get("/list", response_model=List[FriendResponse])
async def list_friend(
    current_user: User = Depends(get_current_user),
    session = Depends(get_session)
    ):
    return await get_my_friend_list(current_user, session)


# 친구 요청
@router.post("/request/send")
async def send_request( 
    friend_code: str,
    current_user: User = Depends(get_current_user),
    session = Depends(get_session)
): 
    return await send_friend_request_by_code(current_user, friend_code, session)


# 수락/거절
@router.get("/request/received", response_model=List[PendingRequestResponse])
async def get_received_requests(
    current_user: User = Depends(get_current_user), 
    session = Depends(get_session)
):
    return await get_received_requests_service(
        user_id=current_user.id,
        session=session
    )


# 요청 응답하기 (수락/거절)
@router.post("/request/respond")
async def respond_request(
    request_id: int, 
    accept: bool, 
    current_user: User = Depends(get_current_user), 
    session = Depends(get_session)
):
    return await respond_friend_request(request_id, current_user.id, accept, session)


# 초대 링크 생성  
@router.get("/invite/link")
async def get_invite_link(current_user: User = Depends(get_current_user)):
    base_url = "배포될 도메인 주소"
    invite_url = f"{base_url}?invite_code={current_user.friend_code}"

    return {
        "friend_code": current_user.friend_code,
        "invite_url": invite_url
    }

"""
// 카카오톡 공유 버튼 클릭 시 실행
const shareToKakao = () => {
    window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
            title: '고이다마에 초대합니다!',
            description: '함께 타임캡슐을 만들고 추억을 공유해요.',
            imageUrl: 'https://goidama.com/logo.png',
            link: {
                mobileWebUrl: inviteUrl, // 백엔드에서 받은 invite_url
                webUrl: inviteUrl,
                },
        },
        buttons: [
        {
            title: '가입하고 친구 맺기',
            link: {
            mobileWebUrl: inviteUrl,
            webUrl: inviteUrl,
            },
        },
        ],
    });
};

"""