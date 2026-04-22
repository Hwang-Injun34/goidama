from sqlalchemy.ext.asyncio import (
    create_async_engine, 
    async_sessionmaker, 
    AsyncSession
)

def create_engine(url: str):
    return create_async_engine(url, echo=True)

def create_session_factory(engine): 
    return async_sessionmaker(
        bind=engine, 
        class_=AsyncSession,
        expire_on_commit=False,
    )