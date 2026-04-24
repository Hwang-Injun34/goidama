from fastapi import APIRouter, Depends, Response, Request
from typing import Optional

from appserver.database.session import get_session
from appserver.apps.account.auth.jwt.dependencies import get_current_user
from appserver.apps.account.auth.services.logout_service import logout_service, logout_all_service
from appserver.apps.account.auth.services.withdraw_service import withdraw_service
from appserver.apps.account.auth.kakao.service import kakao_login
from appserver.apps.account.auth.jwt.handler import handle_refresh
from appserver.apps.account.models import User, RefreshToken

from appserver.apps.account.schemas.auth import LoginResponse

router = APIRouter()

# 로그인
@router.get("/auth/kakao/callback")
async def kakao_callback(
    code: str, 
    response: Response, 
    invite_code: Optional[str] = None,
    session=Depends(get_session)
    ) -> LoginResponse:
    return await kakao_login(
        code=code, 
        session=session, 
        response=response,
        invite_code=invite_code
        )

# 토큰 재발급
@router.post("/auth/refresh")
async def refresh(request:Request, response: Response, session=Depends(get_session)): 
    return await handle_refresh(request, response, session)

# 로그인 상태 확인
@router.get("/users/me")
async def me(current_user:User = Depends(get_current_user)):
    return current_user

# 로그아웃
@router.post("/auth/logout")
async def logout(
    request: Request,
    response: Response,
    current_user: User = Depends(get_current_user),
    session=Depends(get_session),
):
    return await logout_service(
        request=request,
        response=response,
        user=current_user,
        session=session
    )

# 전체 로그아웃
@router.post("/auth/logout-all")
async def logout_all(
    response: Response,
    current_user: User = Depends(get_current_user),
    session=Depends(get_session)
):
    return await logout_all_service( 
        response=response,
        user=current_user,
        session=session
    )

# 회원탈퇴
@router.delete("/users/me")
async def withdraw(
    response: Response,
    current_user: User = Depends(get_current_user),
    session = Depends(get_session)
):
    return await withdraw_service(
        response=response,
        user=current_user,
        session=session
    )

#==================================
#   테스트 api
#==================================
import uuid 
from sqlalchemy import select 
from appserver.apps.friend.services.friend_invite_service import establish_friendship_by_invite
from appserver.apps.account.models import User, Provider
from appserver.apps.account.models import RefreshToken
from appserver.apps.account.auth.jwt.service import create_access_token, create_refresh_token

@router.post("/auth/test/mock-login")
async def mock_login(
    fake_kakao_id: str, 
    nickname: str, 
    response: Response,
    invite_code: Optional[str] = None, 
    session=Depends(get_session)
):
    # 1. 유저 조회/생성
    result = await session.execute(select(User).where(User.oauth_id == fake_kakao_id))
    user = result.scalar_one_or_none()

    if not user:
        while True:
            new_code = User.generate_friend_code()
            check = await session.execute(select(User).where(User.friend_code == new_code))
            if not check.scalar_one_or_none(): break
            
        user = User(
            oauth_id=fake_kakao_id,
            provider=Provider.KAKAO,
            nickname=nickname,
            friend_code=new_code
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

    # 2. 초대 코드가 있다면 친구 맺기
    if invite_code:
        await establish_friendship_by_invite(user.id, invite_code, session)

    # ------------------------------------------------------------
    #  테스트용 JWT 토큰 발급
    # ------------------------------------------------------------
    device_id = uuid.uuid4()
    
    # JWT 생성
    access_token = create_access_token(user_id=str(user.id), device_id=str(device_id))
    refresh_token, expire = create_refresh_token(user_id=str(user.id), device_id=str(device_id))

    # Refresh Token DB 저장 (나중에 토큰 갱신 테스트를 위해)
    rt_obj = RefreshToken(
        user_id=user.id,
        token=refresh_token,
        device_id=device_id,
        expires_at=expire
    )
    session.add(rt_obj)
    await session.commit()

    # 쿠키 설정 (브라우저 테스트용)
    max_age_7d = 60 * 60 * 24 * 7
    response.set_cookie(key="device_id", value=str(device_id), httponly=True, max_age=max_age_7d)
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, max_age=max_age_7d)

    # 응답에 access_token을 포함시킴
    return {
        "message": "로그인 성공",
        "access_token": access_token,  # <-- 이제 이게 보일 겁니다!
        "user_id": user.id,
        "nickname": user.nickname,
        "friend_code": user.friend_code
    }