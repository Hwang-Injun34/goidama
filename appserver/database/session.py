from fastapi import Request

async def get_session(request: Request):
    # lifespan에서 저장한 session_factory를 가져오기
    session_factory = request.app.state.session_factory
    
    if session_factory is None: 
        raise RuntimeError("DB not initialized")
    
    async with session_factory() as session: 
        yield session