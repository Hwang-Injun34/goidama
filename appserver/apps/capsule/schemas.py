import uuid 
from dateutil.relativedelta import relativedelta
from pydantic import BaseModel, Field, computed_field, field_validator, ConfigDict
from datetime import datetime, timezone
from typing import List, Optional

# --- 공통 설정 ---
class BaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# --- 참여자나 소유자 정보 ---
class UserSummary(BaseResponse):
    id: uuid.UUID 
    nickname: str 
    profile_image_url: Optional[str] = None 


# --- 캡슐 생성 요청 ---
class CapsuleCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=30)
    open_at: datetime
    # 잠글 때 위치를 확정하므로 생성 시에는 선택 사항(Optional)으로 두는 것이 유연합니다.
    latitude: Optional[float] = None 
    longitude: Optional[float] = None
    is_group: bool = False
    friend_ids: Optional[List[uuid.UUID]] = []
    skin_id: int = 1 # 캡슐 디자인 번호
    visibility: str = "friends" # private / friends

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
    
    @field_validator("skin_id", mode="before") # 입력값 처리 전에 먼저 확인
    @classmethod
    def force_event_skin(cls, v: any) -> int:
        now = datetime.now(timezone.utc)
        
        # [이스터 에그] 10월 30일 이벤트 조건
        if now.month == 10 and now.day == 30:
            return 1030
            
        return v # 평상시에는 유저가 보낸 값 그대로 사용


# --- 최종 장금  ---
class CapsuleLockRequest(BaseModel):
    latitude: float = Field(..., ge=33.0, le=39.0) # 대한민국 범위 제한
    longitude: float = Field(..., ge=124.0, le=133.0)


# --- 개봉시 위치 인증 요청  ---
class CapsuleCheckInRequest(BaseModel):
    latitude: float = Field(..., ge=33.0, le=39.0) # 대한민국 범위 제한
    longitude: float = Field(..., ge=124.0, le=133.0)


# --- 초대 수락/거절 요청  ---
class InvitationRespondRequest(BaseModel):
    accept: bool


# --- 이미지 정보 ---
class CapsuleImageResponse(BaseResponse):
    id: int
    image_url: str 
    order: int 


# --- 캡슐 개봉 후 보이는 실제 추억 내용 ---
class CapsuleContentResponse(BaseResponse):
    id: int 
    user: UserSummary
    text: str
    images: List[CapsuleImageResponse]
    created_at: datetime 


# --- 캡슐 정보의 기본 구조 --- 
class CapsuleBaseResponse(BaseResponse):
    id: uuid.UUID 
    title: str 
    status: str # PENDING, LOCKEd, AVAILABLE, OPEND 
    open_at: datetime 
    is_group: bool 
    address: Optional[str] = None 
    thumbnail_url: Optional[str] = None
    skin_id: int

    # D-DAY 실시간 계산 
    @computed_field 
    @property 
    def d_day(self) -> int: 
        if not self.open_at: return 0
        
        target = self.open_at
        if target.tzinfo is None:
            target = target.replace(tzinfo=timezone.utc)
        
        now = datetime.now(timezone.utc)
        delta = target - now
        
        return max(0, delta.days + 1)


# --- 지도 표시용 ---
class CapsuleMapResponse(CapsuleBaseResponse):
    latitude: float
    longitude: float


# --- 타임라인 표시용 데이터 --- 
class CapsuleTimelineResponse(CapsuleBaseResponse):
    created_at: datetime 
    owner_nickname: str 


# --- 상세 페이지 내 멤버별 체크인 현황 --- 
class CheckInMemberStatus(BaseResponse):
    participant_id: int
    
    nickname: str 
    profile_image_url: Optional[str] = None 
    is_checked_in: bool 
    checked_in_at: Optional[datetime] = None 
    status: str  # ACCEPTED, INVITED 등
    role: str    # OWNER, MEMBER 등

# --- 체크인 현황 응답 ---
class CapsuleCheckInStatusResponse(BaseResponse):
    capsule_id: uuid.UUID
    title: str
    status: str
    total_count: int
    checked_in_count: int
    is_all_checked_in: bool
    members: List[CheckInMemberStatus]


# --- 캡슐 상세 조회 (상태에 따라 컨텐츠 포함 여부 결정) --- 
class CapsuleDetailResponse(CapsuleBaseResponse):
    owner: UserSummary 
    participants: List[CheckInMemberStatus]
    created_at: datetime  
    latitude: Optional[float] = None   
    longitude: Optional[float] = None  
    # OPENED 상태가 아닐 때는 None으로 내려감
    contents: Optional[List[CapsuleContentResponse]] = None 


# --- 초대 알림 목록용 --- 
class InvitationResponse(BaseResponse):
    participant_id: int
    capsule_id: uuid.UUID
    capsule_title: str
    owner_nickname: str
    created_at: datetime


# --- 공용 성공 메시지 응답 ---
class MessageResponse(BaseModel):
    status: str = "success"
    message: str


# --- 공동 캡슐 체크인 상태 --- 
class CheckInResponse(MessageResponse):
    status: str
    all_ready: bool
    checked_in_count: int
    total_count: int


# --- 캘린더용 경량 응답 ---
class CapsuleCalendarResponse(BaseResponse):
    id: uuid.UUID
    title: str
    open_at: datetime
    status: str


# --- 그룹화된 타임라인 응답 --- 
class MonthlyTimelineResponse(BaseResponse):
    month: str 
    capsules: List[CapsuleTimelineResponse]

# --- 친구 타임라인 전용 응답 스키마 ---
class FriendTimelineResponse(BaseModel):
    friend_nickname: str
    groups: List[MonthlyTimelineResponse]