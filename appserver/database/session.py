from pytest import Session

from appserver.database.db import create_session_factory

async def get_session():
    if create_session_factory is None: 
        raise RuntimeError("DB not initialized")
    
    async with create_session_factory() as session: 
        yield session