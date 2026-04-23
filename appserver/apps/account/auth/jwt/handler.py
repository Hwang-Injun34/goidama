import uuid 
from sqlmodel import select, update
from fastapi import Request, Response, HTTPException 
from datetime import datetime, timezone

from appserver.apps.account.models import RefreshToken 
from appserver.apps.account.auth.jwt.service import (
    create_access_token,
    create_refresh_token,
    verify_token,
)

async def handle_refresh(request: Request, response: Response, session):
    
    #---------------
    # 1. 쿠키
    #---------------
    refresh_token = request.cookies.get("refresh_token")
    device_id_str = request.cookies.get("device_id")

    if not refresh_token or not device_id_str: 
        raise HTTPException(401, "인증 정보 부족")
    
    #---------------
    # 2. UUID 변환
    #---------------
    try: 
        device_id = uuid.UUID(device_id_str)
    except ValueError:
        raise HTTPException(401, "잘못된 device_id")


    #---------------
    # 3. jwt 검증
    #---------------
    payload = verify_token(refresh_token)

    if payload.get("type") != "refresh" or payload.get("device_id") != str(device_id):
        raise HTTPException(401, "토큰 정보 불일치")
    
    try:
        user_id = uuid.UUID(payload.get("sub"))
    except (ValueError, TypeError):
        raise HTTPException(401, "잘못된 user_id 형식")

    #---------------
    # 4. DB 조회
    #---------------
    result = await session.execute( 
        select(RefreshToken).where(
            RefreshToken.token == refresh_token,
            RefreshToken.device_id == device_id
        )
    )
    token_obj = result.scalar_one_or_none()

    if not token_obj:
        raise HTTPException(401, "유효하지 않은 토큰")


    #---------------
    # 5. 재사용 공격 방지
    #---------------
    if token_obj.revoked:
        await session.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == user_id, RefreshToken.device_id == device_id)
            .values(revoked=True)
        )
        await session.commit()
        raise HTTPException(401, "재사용 감지: 모든 세션 로그아웃")


    #---------------
    # 6. 만료 체크
    #---------------
    now = datetime.now(timezone.utc)
    db_expires_at = token_obj.expires_at

    if db_expires_at.tzinfo is None:
        db_expires_at = db_expires_at.replace(tzinfo=timezone.utc)
    
    if db_expires_at < now:
        raise HTTPException(401, "토큰 만료")
    
    #---------------
    # 7. rotation 
    #---------------
    token_obj.revoked = True 

    new_refresh, expire_dt = create_refresh_token(str(user_id), str(device_id))
    new_access = create_access_token(str(user_id), str(device_id))

    new_token_entry = RefreshToken(
        user_id=user_id,
        token=new_refresh,
        device_id=device_id,
        expires_at=expire_dt 
    )

    session.add(new_token_entry)
    await session.commit()

    # 쿠키 갱신
    max_age = 60 * 60 * 24 * 7 # 7일
    response.set_cookie(
        key="refresh_token",
        value=new_refresh,
        httponly=True,
        secure=False, # 배포 시 True 
        samesite="lax",
        max_age=max_age,
    )

    response.set_cookie(
        key="device_id",
        value=str(device_id),
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=max_age,
    )

    return {"access_token":new_access}