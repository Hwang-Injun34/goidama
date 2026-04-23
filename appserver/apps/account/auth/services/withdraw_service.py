from datetime import datetime, timedelta, timezone 

from alembic.command import revision
from sqlmodel import select, update
from fastapi import Request, Response
from appserver.apps.account.models import RefreshToken, User

async def withdraw_service(
    response: Response,
    user: User, 
    session
):
    #---------------
    # 1. soft delete 처리
    #---------------
    user.deleted_at = datetime.now(timezone.utc).replace(tzinfo=None)
    session.add(user)

    #---------------
    # 2. 모든 refresh token revoke
    #---------------
    await session.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == user.id)
        .values(revoked=True)
    )
    
    #---------------
    # 3. 쿠키 삭제
    #---------------
    response.delete_cookie(key="refresh_token")
    response.delete_cookie(key="device_id")

    #---------------
    # 4. commit
    #---------------
    await session.commit()
    return {"detail":"회원 탈퇴가 완료되었습니다."}

    
    