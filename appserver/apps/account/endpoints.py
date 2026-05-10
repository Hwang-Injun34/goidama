from urllib import response

from fastapi import APIRouter, Depends, Response, Request
from typing import Optional

from appserver.database.session import get_session

from appserver.apps.account.auth.services.logout_service import logout_service, logout_all_service
from appserver.apps.account.auth.services.withdraw_service import withdraw_service
from appserver.apps.account.auth.services.update_user_settings_service import update_user_settings_service

from appserver.apps.account.auth.kakao.service import kakao_login
from appserver.apps.account.auth.jwt.handler import handle_refresh
from appserver.apps.account.auth.jwt.dependencies import get_current_user

from appserver.apps.account.models import User, RefreshToken
from appserver.apps.account.schemas import (
    UserMeResponse,
    MessageResponse,
    LoginResponse
)

router = APIRouter()

# 로그인
@router.get("/auth/kakao/callback", response_model=LoginResponse)
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
@router.post("/auth/refresh", response_model=LoginResponse)
async def refresh(request:Request, response: Response, session=Depends(get_session)): 
    return await handle_refresh(request, response, session)


# 로그인 상태 확인
@router.get("/users/me", response_model=UserMeResponse)
async def me(current_user:User = Depends(get_current_user)):
    return UserMeResponse(
        id=current_user.id,
        nickname=current_user.nickname,
        profile_image_url=current_user.profile_image_url,
        friend_code=current_user.friend_code,
        created_at=current_user.created_at
    )


# 로그아웃
@router.post("/auth/logout", response_model=MessageResponse)
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
@router.post("/auth/logout-all", response_model=MessageResponse)
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
@router.delete("/users/me", response_model=MessageResponse)
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

# 유저 설정 변경
@router.patch("/users/me/settings", response_model=UserMeResponse)
async def get_settings(
    current_user: User = Depends(get_current_user),
    session = Depends(get_session)
):
    return await update_user_settings_service(current_user, session)
















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
    device_id: Optional[str] = None, # 프론트엔드에서 보낸 deviceId가 있다면 사용
    invite_code: Optional[str] = None, 
    session = Depends(get_session)
):
    # 1. 유저 조회 또는 생성
    result = await session.execute(select(User).where(User.oauth_id == fake_kakao_id))
    user = result.scalar_one_or_none()

    if not user:
        # 친구 코드 중복 방지 생성 로직
        while True:
            new_code = User.generate_friend_code()
            check = await session.execute(select(User).where(User.friend_code == new_code))
            if not check.scalar_one_or_none(): 
                break
            
        user = User(
            oauth_id=fake_kakao_id,
            provider=Provider.KAKAO,
            nickname=nickname,
            friend_code=new_code,
            profile_image_url=None # 테스트용이므로 기본값
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

    # 2. 초대 코드가 있다면 친구 관계 형성
    if invite_code:
        try:
            await establish_friendship_by_invite(user.id, invite_code, session)
        except Exception as e:
            print(f"초대 코드 처리 중 오류(무시가능): {e}")

    # 3. JWT 토큰 발급 로직
    # 클라이언트에서 넘겨준 device_id가 없으면 새로 생성
    target_device_id = device_id or str(uuid.uuid4())
    
    # Access/Refresh Token 생성
    access_token = create_access_token(user_id=str(user.id), device_id=target_device_id)
    refresh_token, expire = create_refresh_token(user_id=str(user.id), device_id=target_device_id)

    # 4. Refresh Token DB 저장 (기존 토큰 무효화 및 새 토큰 등록)
    rt_obj = RefreshToken(
        user_id=user.id,
        token=refresh_token,
        device_id=uuid.UUID(target_device_id) if isinstance(target_device_id, str) else target_device_id,
        expires_at=expire
    )
    session.add(rt_obj)
    await session.commit()

    # 5. 쿠키 설정 (보안 강화)
    # httponly: JS에서 접근 불가 / samesite="lax": CSRF 방지
    max_age_7d = 60 * 60 * 24 * 7
    response.set_cookie(
        key="refresh_token", 
        value=refresh_token, 
        httponly=True, 
        max_age=max_age_7d,
        samesite="lax",
        secure=False # 로컬 개발 환경(http)이라면 False, 배포(https)라면 True
    )

    # 6. 프론트엔드 AuthResponse 스키마에 맞춘 응답 반환
    return {
        "access_token": access_token,
        "user": {
            "id": str(user.id),
            "nickname": user.nickname,
            "profile_image_url": user.profile_image_url,
            "friend_code": user.friend_code,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
    }