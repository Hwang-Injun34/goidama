import uuid 
from dateutil.relativedelta import relativedelta
from pydantic import BaseModel, Field, field_validator, ConfigDict
from datetime import datetime, timezone
from typing import List, Optional

# --- 캡슐 생성 요청 ---
class CapsuleCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=30)
    open_at: datetime
    # 잠글 때 위치를 확정하므로 생성 시에는 선택 사항(Optional)으로 두는 것이 유연합니다.
    latitude: Optional[float] = None 
    longitude: Optional[float] = None
    is_group: bool = False
    friend_ids: Optional[List[uuid.UUID]] = []

    @field_validator("open_at", mode="before")
    @classmethod
    def validate_open_at(cls, v: any) -> datetime:
        if isinstance(v, str):
            v = datetime.fromisoformat(v.replace('Z', '+00:00'))
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        
        # 시간 무시, 날짜만 고정
        v = v.replace(hour=0, minute=0, second=0, microsecond=0)
        
        now = datetime.now(timezone.utc)
        today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        min_date = today + relativedelta(years=1)
        max_date = today + relativedelta(years=10)
        
        if v < min_date:
            raise ValueError("개봉 날짜는 최소 오늘로부터 1년 뒤여야 합니다.")
        if v > max_date:
            raise ValueError("개봉 날짜는 최대 오늘로부터 10년까지만 설정 가능합니다.")
            
        return v

# --- 공통 응답 설정 (V2 표준) ---
class BaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

# --- 개별 응답 스키마 ---
class CapsuleResponse(BaseResponse):
    id: uuid.UUID
    title: str
    status: str
    is_group: bool

class CapsuleImageResponse(BaseResponse):
    id: int
    image_url: str 
    order: int 

class CapsuleContentResponse(BaseResponse):
    id: int 
    user_id: uuid.UUID 
    text: str
    images: List[CapsuleImageResponse]
    created_at: datetime 

# --- 위치 관련 요청 (상속으로 중복 제거) ---
class CapsuleLockRequest(BaseModel):
    latitude: float = Field(..., ge=33.0, le=39.0, description="현재 위도 (대한민국)")
    longitude: float = Field(..., ge=124.0, le=133.0, description="현재 경도 (대한민국)")

class CapsuleCheckInRequest(CapsuleLockRequest):
    """LockRequest와 검증 로직이 동일하므로 상속받아 사용"""
    pass

# --- 상세 현황 조회 ---
class CheckInMemberStatus(BaseResponse):
    nickname: str 
    is_checked_in: bool
    checked_in_at: Optional[datetime] = None 

class CapsuleCheckInStatusResponse(BaseResponse):
    capsule_id: uuid.UUID 
    title: str 
    status: str 
    total_count: int 
    checked_in_count: int 
    is_all_checked_in: bool 
    members: List[CheckInMemberStatus]

# --- 지도 및 타임라인 ---
class CapsuleMapResponse(BaseResponse):
    id: uuid.UUID
    title: str
    latitude: float
    longitude: float
    status: str
    is_group: bool
    open_at: datetime

class CapsuleTimelineResponse(BaseResponse):
    id: uuid.UUID
    title: str
    status: str
    open_at: datetime
    created_at: datetime
    is_owner: bool

class InvitationResponse(BaseResponse):
    participant_id: int
    capsule_id: uuid.UUID
    capsule_title: str
    owner_nickname: str
    created_at: datetime

class InvitationRespondRequest(BaseModel):
    accept: bool

# --- 최종 상세 조회 (보안 적용 버전) ---
class CapsuleDetailResponse(BaseResponse):
    id: uuid.UUID
    title: str
    status: str
    open_at: datetime
    is_group: bool
    owner_id: uuid.UUID
    participants: List[CheckInMemberStatus] 
    contents: Optional[List[CapsuleContentResponse]] = None