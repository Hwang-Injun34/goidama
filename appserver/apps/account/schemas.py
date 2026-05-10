import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from enum import Enum

# --- 공통 설정 (V2 버전) ---
class BaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

# --- 로그인 응답 (카카오 콜백 / 리프레시 공용) ---
class LoginResponse(BaseResponse):
    access_token: str
    user_id: uuid.UUID
    token_type: str = "Bearer"

# --- 내 정보 응답 (GET /users/me) ---
class UserMeResponse(BaseResponse):
    id: uuid.UUID
    nickname: str
    profile_image_url: Optional[str] = None
    friend_code: str
    created_at: datetime

# --- 유저 설정 변경 요청 (PATCH /users/me/settings) ---
class UserSettingsUpdateRequest(BaseModel):
    pass 

# --- 공용 성공 메시지 응답 ---
class MessageResponse(BaseModel):
    status: str = "success"
    message: str