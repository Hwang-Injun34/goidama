from fastapi import APIRouter, Depends, Response, Request

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
    code: str, response: Response, session=Depends(get_session)
    ) -> LoginResponse:
    return await kakao_login(code, session, response)

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