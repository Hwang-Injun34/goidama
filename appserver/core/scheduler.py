from apscheduler.schedulers.asyncio import AsyncIOScheduler 
from sqlmodel import select, update 
from sqlalchemy.orm import selectinload
from datetime import datetime, timezone 
from dateutil.relativedelta import relativedelta


from appserver.apps.capsule.models import Capsule, CapsuleStatus, CapsuleParticipant
from appserver.apps.notification.models import NotificationType 
from appserver.apps.notification.services.create_service import create_notification

scheduler = AsyncIOScheduler()

async def update_available_capsules_daily(session_factory):
    async with session_factory() as session:
        now = datetime.now(timezone.utc)
        today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        one_year_ago = today - relativedelta(years=1)
        
        # ============================================================
        # 로직 1: 일반 개봉 대기 전환 (LOCKED -> AVAILABLE) 및 알림
        # ============================================================
        # 오늘 날짜가 된 잠긴 캡슐들 조회 (참여자 정보 포함)
        stmt1 = (
            select(Capsule)
            .where(Capsule.status == CapsuleStatus.LOCKED)
            .where(Capsule.open_at <= today)
            .options(selectinload(Capsule.participants)) # 참여자 미리 로드
        )
        result1 = await session.execute(stmt1)
        to_available = result1.scalars().all()

        for capsule in to_available:
            capsule.status = CapsuleStatus.AVAILABLE
            
            # 모든 참여자에게 알림 발송
            for p in capsule.participants:
                await create_notification(
                    user_id=p.user_id,
                    n_type=NotificationType.CAPSULE_AVAILABLE,
                    title="시간이 됐어요!",
                    message=f"'{capsule.title}' 캡슐을 열 시간이 됐습니다. 장소로 이동해 캡슐을 깨워주세요!",
                    related_data={"capsule_id": str(capsule.id)},
                    session=session
                )

        # ============================================================
        # 로직 2: 지연 개봉 처리 (Grace Policy) 및 알림
        # ============================================================
        # 1년이 지났는데 아직 안 열린 캡슐들 조회
        stmt2 = (
            select(Capsule)
            .where(Capsule.status.in_([CapsuleStatus.LOCKED, CapsuleStatus.AVAILABLE]))
            .where(Capsule.open_at <= one_year_ago)
            .options(selectinload(Capsule.participants))
        )
        result2 = await session.execute(stmt2)
        to_opened = result2.scalars().all()

        for capsule in to_opened:
            capsule.status = CapsuleStatus.OPENED
            
            # 모든 참여자에게 알림 발송
            for p in capsule.participants:
                await create_notification(
                    user_id=p.user_id,
                    n_type=NotificationType.CAPSULE_OPENED,
                    title="기억이 돌아왔어요.",
                    message=f"약속 장소에는 못 갔지만, 1년이 지나 '{capsule.title}' 캡슐이 자동으로 열렸습니다.",
                    related_data={"capsule_id": str(capsule.id)},
                    session=session
                )

        await session.commit()
        
        # 로그 기록
        if to_available or to_opened:
            print(f"[{today}] 스케줄러 작업 완료: {len(to_available)}개 활성화, {len(to_opened)}개 자동 개봉")