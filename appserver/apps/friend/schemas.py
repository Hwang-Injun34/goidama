import profile
from turtle import st
import uuid 
from datetime import datetime 
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from tomlkit import date


# --- 공통 설정 ---
class BaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

# --- 유저 요약 정보 (공통 사용) ---
class UserSummaryResponse(BaseResponse):
    id: uuid.UUID 
    nickname: str 
    friend_code: str 
    profile_image_url: Optional[str] = None 

# --- 친구 요청 보낼 때 Body 데이터 ---
class FriendRequestSendRequest(BaseModel):
    friend_code: str

# --- 친구 목록 응답(GET /friend/list) --- 
class FriendResponse(UserSummaryResponse):
    # UserSummaryResponse를 상속 받음
    friend_since: datetime 

# --- 친구 요청 관련 --- 
class PendingRequestResponse(BaseModel):
    request_id: int 
    requester: UserSummaryResponse 
    created_at: datetime 

class FriendRequestRespondRequest(BaseModel):
    accept: bool

# --- 친구 그룹 관련(N:M) ---
class FriendGroupRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    friend_ids: List[uuid.UUID] = [] # 생성 시 함께 추가할 친구들

class FriendGroupResponse(BaseResponse):
    id: uuid.UUID
    name: str
    member_count: int 
    members: List[UserSummaryResponse] = [] 
    created_at: datetime

# --- 차단 목록 관련 ---
class BlockedUserResponse(UserSummaryResponse):
    blocked_at: datetime 

# --- 초대 링크 응답 --- 
class InviteLinkResponse(BaseModel):
    friend_code: str 
    invite_url: str 

# --- 일괄 처리 결과 --- 
class BulkActionResponse(BaseModel):
    success_count: int 
    message: str 

# --- 공용 성공 메시지 응답 ---
class MessageResponse(BaseModel):
    status: str = "success"
    message: str

