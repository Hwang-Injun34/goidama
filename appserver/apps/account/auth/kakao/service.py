import uuid 
from sqlmodel import select
from typing import Optional
from fastapi import Response, HTTPException


from apps.friend.service import establish_friendship_by_invite
from appserver.apps.account.schemas.auth import LoginResponse
from appserver.apps.account.models import RefreshToken, User, Provider
from appserver.apps.account.auth.kakao.client import (
    get_kakao_token,
    get_kakao_user
)
from appserver.apps.account.auth.jwt.service import (
    create_access_token,
    create_refresh_token,
)

async def kakao_login(code: str, session, response: Response, invite_code: Optional[str] = None) -> LoginResponse:

    #---------------
    # 1. 카카오 토큰
    #---------------
    token_data = await get_kakao_token(code)
    kakao_access_token = token_data.get("access_token")

    if not kakao_access_token:
        raise HTTPException(401, "카카오 access_token 없음")

    #---------------
    # 2. 유저 정보
    #---------------
    user_info = await get_kakao_user(kakao_access_token)
    kakao_id = str(user_info.get("id"))

    #---------------
    # 3. DB 조회
    #---------------
    result = await session.execute(
        select(User).where(
            User.oauth_id == kakao_id,
            User.provider == Provider.KAKAO
        )
    )
    user = result.scalar_one_or_none()

    #---------------
    # 4. 없으면 생성
    #---------------
    if not user:
        profile = user_info.get("kakao_account", {}).get("profile", {})
        nickname = profile.get("nickname") or f"kakao_{kakao_id[:6]}"

        user = User(
            oauth_id=kakao_id,
            provider=Provider.KAKAO,
            nickname=nickname
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

    #---------------
    # 5. 초대 코드가 있다면 친구 맺기
    #---------------


    #---------------
    # 5. JWT
    #---------------
    device_id = uuid.uuid4()

    access_token = create_access_token(
        user_id=str(user.id), 
        device_id=str(device_id)
    )
    refresh_token, expire = create_refresh_token(
        user_id=str(user.id), 
        device_id=str(device_id)
    )

    #---------------
    # 6. DB 저장
    #---------------
    refresh_token_obj = RefreshToken(
        user_id = user.id,
        token=refresh_token,
        device_id=device_id,
        expires_at=expire,
    )
    session.add(refresh_token_obj)
    await session.commit()

    #---------------
    # 7. 쿠키 설정
    #---------------
    max_age_7d = 60 * 60 * 24 * 7

    response.set_cookie(
        key="device_id",
        value=str(device_id),
        httponly=True,
        secure=False, # 배포시 True 
        samesite="lax",
        max_age= max_age_7d,
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=max_age_7d,
    )

    return LoginResponse(
        access_token=access_token,
        user_id=str(user.id)
    )
