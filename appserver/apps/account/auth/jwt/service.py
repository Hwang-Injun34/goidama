import uuid 
import jwt 
from fastapi import HTTPException
from datetime import datetime, timedelta, timezone 

from appserver.settings import get_settings

settings = get_settings()

def create_access_token(user_id: str, device_id: str):
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=15)

    payload = {
        "sub": user_id,
        "exp": int(expire.timestamp()), 
        "iat": int(now.timestamp()),
        "type": "access",
        "jti": str(uuid.uuid4()),
        "device_id": device_id,
    }

    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def create_refresh_token(user_id: str, device_id: str):
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=7)

    payload = {
        "sub": user_id,
        "exp": int(expire.timestamp()), 
        "iat": int(now.timestamp()),
        "type": "refresh",
        "jti": str(uuid.uuid4()),
        "device_id": device_id,
    }

    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token, expire

def verify_token(token: str):
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            options={
                "require":["exp","iat","sub"]
            }
        )
        return payload 
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "토큰 만료")

    except jwt.InvalidTokenError:
        raise HTTPException(401, "유효하지 않은 토큰")
    



