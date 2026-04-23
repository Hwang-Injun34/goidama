from email.policy import HTTP
from typing import List 
from fastapi import HTTPException, Depends, status 

from appserver.apps.account.models import User, UserRole 
from appserver.apps.account.auth.jwt.dependencies import get_current_user 

class ReleChecker:
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)):
        if user.role not in self.allowed_roles: 
            raise HTTPException(403, "해당 작업에 대한 권한이 없음")
        
        return user

"""
[사용법]
예시 1
@router.get("/admin/users")
async def get_all_users(
    # ADMIN 역할만 허용
    admin: User = Depends(RoleChecker([UserRole.ADMIN])),
    session = Depends(get_session)
):
    # 이 로직은 호출자가 ADMIN일 때만 실행됨
    result = await session.execute(select(User))
    return result.scalars().all()

예시 2
@router.post("/capsules/special")
async def create_special_capsule(
    # HOST 혹은 ADMIN 역할이면 통과
    user: User = Depends(RoleChecker([UserRole.HOST, UserRole.ADMIN])),
    session = Depends(get_session)
):
    return {"detail": "스페셜 캡슐 생성 성공"}

"""