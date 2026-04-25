"""
캡슐 생성 및 초대
POST /capsules: 캡슐 기본 정보 생성 (제목, 개봉 시간, 위치 좌표 설정).
    개인 캡슐인 경우 즉시 생성.
    공동 캡슐인 경우 PENDING 상태로 시작.
POST /capsules/{id}/invite: 친구 코드를 이용해 공동 작성자 초대.
GET /capsules/invitations: 나에게 온 초대 목록 확인.
POST /capsules/invitations/{id}/respond: 초대 수락(ACCEPTED)    또는 거절(REJECTED).
    모든 참여자가 수락하면 대표자가 '잠금' 가능 상태가 됨.


콘텐츠 작성 및 잠금
POST /capsules/{id}/content: 사진(최대 5장) 및 텍스트(100자) 업로드.
    이미지는 서버에서 WebP 압축 및 S3 업로드 처리.
POST /capsules/{id}/lock: 캡슐 잠금 처리 (LOCKED 상태로 변경).
    이 시점부터 개봉 전까지 내용 수정 및 조회 불가.
    생성 조건 확인 (위치 기반인 경우 현재 GPS 체크).

조회 및 시각화
GET /capsules/map: 지도 표시용 내 캡슐 목록 (좌표, 상태, 아이콘 유형 포함).
필터: 전체, 개인, 공동 구분 조회.
GET /capsules/timeline: 타임라인 표시용 내 캡슐 목록 (시간순 정렬).
GET /capsules/{id}: 캡슐 상세 조회.
    LOCKED/AVAILABLE 상태: 메타데이터(제목, 개봉일, 참여자 현황)만 반환.
    OPENED 상태: 모든 콘텐츠(사진, 텍스트) 반환.

개봉 엔진
POST /capsules/{id}/check-in: 사용자의 현재 GPS를 전송하여 위치 인증.
    조건 1: 설정된 시간이 지났는가? (서버 시간 체크)
    조건 2: 설정된 반경 100m 이내인가? (Haversine 계산)
    로직: 인증 성공 시 is_checked_in = True 변경. 모든 멤버가 체크인 완료 시 OPENED로 상태 변경.
GET /capsules/{id}/check-in-status: 공동 캡슐의 현재 체크인 현황 확인 (예: "4명 중 3명 방문 완료").

관리 및 히스토리
PATCH /capsules/{id}: 캡슐 정보 수정 (잠금 전 또는 제한된 횟수 내 수정).
DELETE /capsules/{id}: 캡슐 삭제.
POST /capsules/{id}/archive: 개봉된 캡슐을 히스토리(ARCHIVED)로 수동 전환 (또는 자동).

"""
import uuid 
from datetime import datetime
from fastapi import APIRouter, Depends, Request, Form, UploadFile, File
from typing import List, Optional
from httpx import delete
from pytest import Session

from appserver.database.session import get_session 
from appserver.apps.account.auth.jwt.dependencies import get_current_user 
from appserver.apps.account.models import User
from appserver.apps.capsule.schemas import (
    CapsuleCheckInStatusResponse,
    CapsuleCreateRequest,
    CapsuleResponse,
    CapsuleCheckInRequest,
    CapsuleMapResponse,
    CapsuleTimelineResponse,
    InvitationRespondRequest,
    CapsuleDetailResponse,
    InvitationResponse,
)



from appserver.apps.capsule.services.list_service import get_my_capsules_map_service, get_my_timeline_service
from appserver.apps.capsule.services.create_service import create_capsule_service
from appserver.apps.capsule.services.add_content_service import add_capsule_content_service
from appserver.apps.capsule.services.lock_service import lock_capsule_service
from appserver.apps.capsule.services.check_in_service import check_in_service, get_check_in_status_service
from appserver.apps.capsule.services.invite_service import get_my_invitations_service, respond_invitation_service
from appserver.apps.capsule.services.get_detail_service import get_capsule_detail_service
from appserver.apps.capsule.services.manage_service import update_capsule_service, delete_capsule_service

router = APIRouter()

# 캡슐 생성
@router.post("/create", response_model=CapsuleResponse)
async def create_capsule(
    data: CapsuleCreateRequest,
    current_user = Depends(get_current_user),
    session = Depends(get_session)
):
    return await create_capsule_service(current_user.id, data, session)

# 내용 입력
@router.post("/{id}/content")
async def upload_content(
    id: uuid.UUID,
    text: str = Form(..., max_length=100), 
    files: List[UploadFile] = File(...,media_type="multipart/form-data"),
    current_user=Depends(get_current_user), 
    session=Depends(get_session)
): 
    return await add_capsule_content_service(id, current_user.id, text, files, session)

# 잠금 버튼
@router.post("/{id}/lock")
async def lock(
    id:uuid.UUID, 
    lat:float, 
    lon: float, 
    current_user = Depends(get_current_user),
    session = Depends(get_session)
):
    return await lock_capsule_service(id, current_user.id, lat, lon, session)

# 체크인 버튼
@router.post("/{id}/check-in")
async def check_in(
    id: uuid.UUID,
    data: CapsuleCheckInRequest,
    current_user = Depends(get_current_user),
    session = Depends(get_session)
):
    return await check_in_service(
        capsule_id = id,
        user_id = current_user.id,
        lat=data.latitude,
        lon=data.longitude,
        session=session
    )

# 체크인 상태
@router.get("/{id}/check-in-status", response_model=CapsuleCheckInStatusResponse)
async def get_check_in_status(
    id: uuid.UUID, 
    current_user = Depends(get_current_user),
    session = Depends(get_session)
):
    return await get_check_in_status_service(id, session)

# 지도에 표시 
@router.get("/map", response_model=List[CapsuleMapResponse])
async def get_capsules_for_map(
    current_user = Depends(get_current_user),
    session = Depends(get_session)
):
    return await get_my_capsules_map_service(current_user.id, session)


# 타임라인에 표시
@router.get("/timeline", response_model=List[CapsuleTimelineResponse])
async def get_capsules_for_timeline(
    current_user = Depends(get_current_user),
    session = Depends(get_session)
):
    return await get_my_timeline_service(current_user.id, session)

#초대 받은 목록 보기
@router.get("/invitations", response_model=List[InvitationResponse])
async def get_invitations(user=Depends(get_current_user), session=Depends(get_session)):
    return await get_my_invitations_service(user.id, session)

# 초대 요청: 수락/거절
@router.post("/invitations/{participant_id}/respond")
async def respond_invitation(
    participant_id: int, 
    data: InvitationRespondRequest, 
    user=Depends(get_current_user), 
    session=Depends(get_session)
):
    return await respond_invitation_service(participant_id, user.id, data.accept, session)

# 캡슐 조회하기(보안 로직 적용)
@router.get("/{id}", response_model=CapsuleDetailResponse)
async def get_capsule_detail(
    id: uuid.UUID, 
    user=Depends(get_current_user), 
    session=Depends(get_session)
):
    return await get_capsule_detail_service(id, user.id, session)


# 캡슐 수정 (제목/날짜만)
@router.patch("/{id}", response_model=CapsuleResponse)
async def update_capsule(
    id: uuid.UUID,
    title: Optional[str] = Form(None),
    open_at: Optional[datetime] = Form(None),
    current_user = Depends(get_current_user),
    session = Depends(get_session)
):
    # 날짜 수정 시 스키마 검증을 위해 임시 객체 생성 (검증 로직 활용)
    return await update_capsule_service(id, current_user.id, title, open_at, session)

# 캡슐 삭제
@router.delete("/{id}")
async def delete_capsule(
    id: uuid.UUID,
    current_user = Depends(get_current_user),
    session = Depends(get_session)
):
    return await delete_capsule_service(id, current_user.id, session)