import uuid 
from fastapi import Depends, HTTPException, Request, status
from fastapi import security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import select 
from sqlalchemy.ext.asyncio import AsyncSession 

from appserver.database.session import get_session
from appserver.apps.account.models import User
from appserver.apps.account.auth.jwt.service import verify_token 

reusable_oauth2 = HTTPBearer()

async def get_current_user(
        auth: HTTPAuthorizationCredentials = Depends(reusable_oauth2),
        session: AsyncSession=Depends(get_session)
    ) ->User:

    token= auth.credentials

    #---------------
    # 1. jwt 검증
    #---------------
    payload = verify_token(token)
    
    if payload.get("type") != "access":
        raise HTTPException(401, "잘못된 토큰 타입")
    
    user_id = payload.get("sub")
    device_id = payload.get("device_id")

    if not user_id or not device_id:
        raise HTTPException(401, "토큰 payload 오류")
    
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError: 
        raise HTTPException(401, "잘못된 user_id 형식")
    
    #---------------
    # 2. DB 조회
    #---------------
    result = await session.execute(
        select(User).where(
            User.id == user_uuid,
            User.deleted_at.is_(None)
            )
    )
    user = result.scalar_one_or_none()

    #---------------
    # 3. 사용자 존재 체크
    #---------------
    if not user:
        raise HTTPException(401, "존재하지 않는 유저")


    #---------------
    # 4. 최종 변환
    #---------------
    return user