import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from sqlmodel import SQLModel
from appserver.database.db import create_engine, create_session_factory
from appserver.database.session import get_session
from appserver.apps.account.endpoints import router as account_router
from appserver.apps.friend.endpoints import router as friend_router
from appserver.apps.capsule.endpoints import router as capsule_router
from appserver.core.scheduler import update_available_capsules_daily, scheduler
# from appserver.apps.notification.endpoints import router as notification_router


DATABASE_URL = "sqlite+aiosqlite:///./goidama.db"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@asynccontextmanager
async def lifespan(app: FastAPI):
    engine = create_engine(DATABASE_URL)

    async with engine.begin() as conn: 
        await conn.run_sync(SQLModel.metadata.create_all)

    app.state.engine = engine 
    app.state.session_factory = create_session_factory(engine)
    print("DB 초기화 완료")

    # 매일 00시 01분에 실행
    scheduler.add_job( 
        update_available_capsules_daily,
        'cron',
        hour = 0,
        minute = 1,
        args=[app.state.session_factory]
    )

    scheduler.start()
    print("APScheduler 시작됨")

    yield

    await engine.dispose()
    print("서버 종료 처리 완료")

app = FastAPI(lifespan=lifespan)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
app.include_router(account_router, prefix="/account")
app.include_router(friend_router, prefix="/friend")
app.include_router(capsule_router, prefix="/capsule")
# app.include_router(notification_router, prefix="/notification")