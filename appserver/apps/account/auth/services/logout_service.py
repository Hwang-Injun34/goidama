from alembic.command import revision
from sqlmodel import select, update
from fastapi import Request, Response
from appserver.apps.account.models import RefreshToken, User

async def logout_service(request:Request, response:Response, user: User, session):
    #---------------
    # 1. 쿠키에서 사용 중인 리프레시 토큰 가져오기
    #---------------
    refresh_token = request.cookies.get("refresh_token")

    #---------------
    # 2. 토큰 무효화
    #---------------
    if refresh_token: 
        result = await session.execute(
            select(RefreshToken).where(
                RefreshToken.token == refresh_token,
                RefreshToken.user_id == user.id
            )
        )
        token_obj = result.scalar_one_or_none()

        if token_obj: 
            token_obj.revoked = True 
            await session.commit()
    
    #---------------
    # 3. 브라우저 쿠키 삭제
    #---------------
    response.delete_cookie(key="refresh_token")
    response.delete_cookie(key="device_id")

    return {"detail":"로그아웃 성공"}


async def logout_all_service(
    response: Response,
    user: User, 
    session
): 
    #---------------
    # 1. 해당 유저의 모든 리프레시 토큰을 한 번에 무효화
    #---------------
    await session.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == user.id)
        .values(revoked=True)
    )
    await session.commit()

    #---------------
    # 2. 브라우저 쿠키 삭제
    #---------------
    response.delete_cookie(key="refresh_token")
    response.delete_cookie(key="device_id")

    return {"detail": "모든 기기에서 로그아웃 성공"}