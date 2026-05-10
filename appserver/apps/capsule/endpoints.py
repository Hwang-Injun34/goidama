import uuid 
from datetime import datetime
from fastapi import APIRouter, Depends, Request, Form, UploadFile, File, Query
from typing import List, Optional
from httpx import delete
from pytest import Session

from appserver.database.session import get_session 
from appserver.apps.account.auth.jwt.dependencies import get_current_user 
from appserver.apps.account.models import User
from appserver.apps.capsule.schemas import (
    CapsuleCreateRequest,
    CapsuleLockRequest,
    CapsuleCheckInRequest,
    CapsuleBaseResponse,
    CapsuleMapResponse,
    CapsuleTimelineResponse,
    CapsuleDetailResponse,
    CheckInResponse,
    InvitationResponse,
    InvitationRespondRequest,
    MessageResponse,
    CapsuleCheckInStatusResponse,
    CapsuleCalendarResponse,
    MonthlyTimelineResponse,
    FriendTimelineResponse,
)

from appserver.apps.capsule.services.open_capsule_service import open_capsule_service
from appserver.apps.capsule.services.friend_timeline_service import get_friend_timeline_service
from appserver.apps.capsule.services.list_service import get_my_capsules_map_service, get_my_timeline_service, get_capsule_calendar_service, get_filtered_timeline_service
from appserver.apps.capsule.services.create_service import create_capsule_service
from appserver.apps.capsule.services.add_content_service import add_capsule_content_service
from appserver.apps.capsule.services.lock_service import lock_capsule_service
from appserver.apps.capsule.services.check_in_service import check_in_service, get_check_in_status_service
from appserver.apps.capsule.services.invite_service import get_my_invitations_service, respond_invitation_service
from appserver.apps.capsule.services.get_detail_service import get_capsule_detail_service
from appserver.apps.capsule.services.manage_service import update_capsule_service, delete_capsule_service

router = APIRouter()


# 캡슐 초대 목록 
@router.get("/invitations", response_model=List[InvitationResponse])
async def get_invitations(
    current_user=Depends(get_current_user), 
    session=Depends(get_session)
):
    return await get_my_invitations_service(current_user.id, session)


# ==========================================
# 1. 캡슐 생성 및 작성 (Creation & Writing)
# ==========================================

# 캡슐 생성
@router.post("/create", response_model=CapsuleBaseResponse)
async def create_capsule(
    data: CapsuleCreateRequest,
    current_user = Depends(get_current_user),
    session = Depends(get_session)
):
    return await create_capsule_service(current_user.id, data, session)

# 캡슐 내용 입력(사진, 텍스트)
@router.post("/{id}/content", response_model=MessageResponse)
async def upload_content(
    id: uuid.UUID,
    text: str = Form(..., max_length=100), 
    rep_index: int = Form(0), # 대표 이미지 번호
    files: List[UploadFile] = File(...,media_type="multipart/form-data"),
    current_user: User =Depends(get_current_user), 
    session=Depends(get_session)
): 
    return await add_capsule_content_service(id, current_user.id, text, files, rep_index, session)


# 캡슐 잠금 버튼
@router.post("/{id}/lock", response_model=MessageResponse)
async def lock(
    id:uuid.UUID, 
    data: CapsuleLockRequest,
    current_user: User = Depends(get_current_user),
    session = Depends(get_session)
):
    return await lock_capsule_service(id, current_user.id, data.latitude, data.longitude, session)


# ==========================================
# 2. 조회 및 시각화 
# ==========================================

# 지도 표시
@router.get("/map", response_model=List[CapsuleMapResponse])
async def get_capsules_for_map(
    current_user: User = Depends(get_current_user),
    session = Depends(get_session)
):
    return await get_my_capsules_map_service(current_user.id, session)


# 타임라인 표시 
@router.get("/timeline", response_model=List[CapsuleTimelineResponse])
async def get_capsules_for_timeline(
    current_user: User = Depends(get_current_user),
    session = Depends(get_session)
):
    return await get_my_timeline_service(current_user.id, session)

# 타임라인 필터링/정렬/그룹화
@router.get("/timeline-v2", response_model=List[MonthlyTimelineResponse])
async def get_advanced_timeline(
    sort: str = Query("date", description="date | name | status"),
    status: Optional[str] = Query(None, description="pending | locked | available | opened"),
    current_user = Depends(get_current_user),
    session = Depends(get_session)
):
    return await get_filtered_timeline_service(current_user.id, sort, status, session)



# 캘린더 전용
@router.get("/calendar", response_model=List[CapsuleCalendarResponse])
async def get_calendar_data(
    year: int, 
    month: int, 
    current_user: User = Depends(get_current_user),
    session = Depends(get_session)
): 
    return await get_capsule_calendar_service(current_user.id, year, month, session)




# ==========================================
# 3. 개봉 및 참여 (Opening & Participation)
# ==========================================

# 체크인 버튼
@router.post("/{id}/check-in", response_model=CheckInResponse)
async def check_in(
    id: uuid.UUID,
    data: CapsuleCheckInRequest,
    current_user: User = Depends(get_current_user),
    session = Depends(get_session)
):
    return await check_in_service(
        capsule_id = id,
        user_id = current_user.id,
        lat=data.latitude,
        lon=data.longitude,
        session=session
    )

# 체크인 상태 조회
@router.get("/{id}/check-in-status", response_model=CapsuleCheckInStatusResponse)
async def get_check_in_status(
    id: uuid.UUID, 
    current_user: User = Depends(get_current_user),
    session = Depends(get_session)
):
    return await get_check_in_status_service(id, session)



# 캡슐 초대 요청: 수락/거절
@router.post("/invitations/{participant_id}/respond", response_model=MessageResponse)
async def respond_invitation(
    participant_id: int, 
    data: InvitationRespondRequest, 
    current_user=Depends(get_current_user), 
    session=Depends(get_session)
):
    return await respond_invitation_service(participant_id, current_user.id, data.accept, session)

# # 캡슐 초대 요청: 수락/거절
# @router.post("/invitations/{capsule_id}/respond", response_model=MessageResponse)
# async def respond_invitation(
#     capsule_id: uuid.UUID, 
#     data: InvitationRespondRequest, 
#     current_user=Depends(get_current_user), 
#     session=Depends(get_session)
# ):
#     return await respond_invitation_service(capsule_id, current_user.id, data.accept, session)



# ==========================================
# 4. 관리 및 수정 (Management)
# ==========================================

# 캡슐 수정 (제목/날짜만)
# @router.patch("/{id}", response_model=CapsuleBaseResponse)
# async def update_capsule(
#     id: uuid.UUID,
#     title: Optional[str] = Form(None),
#     open_at: Optional[datetime] = Form(None),
#     current_user = Depends(get_current_user),
#     session = Depends(get_session)
# ):
#     return await update_capsule_service(id, current_user.id, title, open_at, session)

# 캡슐 삭제
@router.delete("/{id}", response_model=MessageResponse)
async def delete_capsule(
    id: uuid.UUID,
    current_user = Depends(get_current_user),
    session = Depends(get_session)
):
    return await delete_capsule_service(id, current_user.id, session)


# ==========================================
# 5. 친구 캡슐 보기
# ==========================================
# 친구 캡슐 타임라인 
@router.get("/friend/{friend_id}/timeline", response_model=FriendTimelineResponse)
async def get_friend_timeline(
    friend_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session = Depends(get_session)
):
    """
    특정 친구의 공개된(FRIENDS) 타임라인을 조회합니다.
    """
    return await get_friend_timeline_service(friend_id, current_user.id, session)



# ==========================================
# 6. 캡슐 열기(체크인 완료된 캡슐만 열기 가능)
# ==========================================
@router.post("/{capsule_id}/open", response_model=MessageResponse)
async def open_capsule(
    capsule_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session = Depends(get_session)
):
    return await open_capsule_service(capsule_id, current_user.id, session)



# 캡슐 상세 조회하기(보안 로직 적용)
@router.get("/{id}", response_model=CapsuleDetailResponse)
async def get_capsule_detail(
    id: uuid.UUID, 
    current_user: User = Depends(get_current_user), 
    session=Depends(get_session)
):
    return await get_capsule_detail_service(id, current_user.id, session)