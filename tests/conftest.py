import pytest
import asyncio

from httpx import AsyncClient, ASGITransport
from sqlmodel import SQLModel

from appserver.app import app
from appserver.database.session import get_session
from appserver.database.db import create_session_factory, create_engine



# 테스트용 DB(운영 DB와 완전히 분리)
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

# ----------------------------------
# event loop 설정
# ----------------------------------
@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop 
    loop.close()


# ----------------------------------
# engine
# ----------------------------------
@pytest.fixture(scope="session")
async def engine():
    eng = create_engine(TEST_DATABASE_URL)

    async with eng.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    
    yield eng 

    async with eng.begin() as conn: 
        await conn.run_sync(SQLModel.metadata.drop_all)
    
    await eng.dispose()

# ----------------------------------
# session
# ----------------------------------
@pytest.fixture
async def session(engine):
    SessionLocal = create_session_factory(engine)

    async with SessionLocal() as session:
        yield session

        # 테스트 데이터 초기화 (격리)
        async with engine.begin() as conn:
            for table in reversed(SQLModel.metadata.sorted_tables):
                await conn.execute(table.delete())

# -------------------------
# client
# -------------------------
@pytest.fixture
async def client(session):

    async def override_get_session():
        yield session

    app.dependency_overrides[get_session] = override_get_session

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


