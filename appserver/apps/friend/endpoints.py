from fastapi import APIRouter, Depends 
from appserver.database.session import get_session 
from appserver.apps.account.models import User 
from appserver.apps.account.auth.jwt.dependencies import get_current_user 
from appserver.apps.friend.service import create_invite_code 

router = APIRouter()

@router.post("/invited/link")
async def generate_invite_link(
    current_user: User = Depends(get_current_user),
    session = Depends(get_session)
):
    code = await create_invite_code(current_user.id, session)
    invite_url = f"https://yourapp.com/invite?code={code}"
    return {"invite_code": code, "invite_url": invite_url}