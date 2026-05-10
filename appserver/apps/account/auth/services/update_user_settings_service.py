from fastapi import HTTPException 
from appserver.apps.account.models import User 
from appserver.apps.account.schemas import UserMeResponse

async def update_user_settings_service(user: User, session) -> UserMeResponse:
    pass
