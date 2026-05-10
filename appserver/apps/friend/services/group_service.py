from enum import member
import uuid 
from fastapi import HTTPException, status
from typing import List 
from sqlmodel import select, delete 
from sqlalchemy.orm import selectinload

from appserver.apps.friend.schemas import FriendGroupRequest, FriendGroupResponse, MessageResponse
from appserver.apps.friend.models import FriendGroup, FriendGroupMember 

# 그룹 조회
async def get_my_groups_service(user_id: uuid.UUID, session) -> List[FriendGroupResponse]:
    statement = (
        select(FriendGroup)
        .where(FriendGroup.user_id == user_id)
        .options(selectinload(FriendGroup.members))
    )
    result = await session.execute(statement)
    groups = result.scalars().all()

    return [
        FriendGroupResponse(
            id=g.id,
            name=g.name,
            member_count=len(g.members),
            members=[{
                "id": m.id, 
                "nickname": m.nickname, 
                "friend_code": m.friend_code, 
                "profile_image_url": m.profile_image_url
            } for m in g.members],
            created_at=g.created_at)
        for g in groups
    ]


# 그룹 생성
async def create_group_service(user_id: uuid.UUID, data:FriendGroupRequest, session) -> FriendGroupResponse:
    # 그룹 마스터 생성
    new_group = FriendGroup(user_id=user_id, name=data.name)
    session.add(new_group)
    await session.flush() # ID를 먼저 할당

    # 그룹 멤버(연결 테이블) 데이터 생성
    for f_id in data.friend_ids:
        link = FriendGroupMember(group_id=new_group.id, friend_id=f_id)
        session.add(link)
    
    await session.commit()

    return await get_group_detail(new_group.id, user_id, session)


# 그룹 수정
async def update_group_service(group_id: uuid.UUID, user_id: uuid.UUID, data:FriendGroupRequest, session) -> FriendGroupResponse:
    # 그룹 존재 및 소유권 확인
    group_stmt = (
        select(FriendGroup)
        .where(FriendGroup.id == group_id, FriendGroup.user_id == user_id)
    )
    
    group_res = await session.execute(group_stmt)
    group = group_res.scalar_one_or_none()
    
    if not group:
        raise HTTPException(status_code=404, detail="그룹을 찾을 수 없습니다.")

    # 이름 수정
    group.name = data.name

    # 멤버 교체 (기존 연결 삭제 후 새로 등록)
    # 기존 멤버 삭제
    del_stmt = delete(FriendGroupMember).where(FriendGroupMember.group_id == group_id)
    await session.execute(del_stmt)
    
    # 새 멤버 등록
    for f_id in data.friend_ids:
        link = FriendGroupMember(group_id=group_id, friend_id=f_id)
        session.add(link)

    await session.commit()
    return await get_group_detail(group_id, user_id, session)


# 그룹 삭제
async def delete_group_service(group_id: uuid.UUID, user_id: uuid.UUID, session) -> MessageResponse:
    statement = (
        select(FriendGroup)
        .where(FriendGroup.id == group_id, FriendGroup.user_id == user_id)
    )
    res = await session.execute(statement)
    group = res.scalar_one_or_none()

    if not group:
        raise HTTPException(status_code=404, detail="그룹을 찾을 수 없습니다.")

    # 연결된 멤버 데이터는 DB의 ForeignKey(cascade) 설정에 의해 자동 삭제되거나, 
    # 아래처럼 수동으로 지워줄 수 있습니다.
    del_members_stmt = delete(FriendGroupMember).where(FriendGroupMember.group_id == group_id)
    await session.execute(del_members_stmt)
    
    await session.delete(group)
    await session.commit()
    
    return MessageResponse(message="그룹이 삭제되었습니다.")


# 내부 헬퍼 함수
async def get_group_detail(group_id: uuid.UUID, user_id: uuid.UUID, session) -> FriendGroupResponse:
    statement  = (
        select(FriendGroup)
        .where(FriendGroup.id == group_id, FriendGroup.user_id == user_id)
        .options(selectinload(FriendGroup.members))
    )

    res = await session.execute(statement)
    g = res.scalar_one_or_none()
    
    if not g: return None
    
    return FriendGroupResponse(
        id=g.id,
        name=g.name,
        member_count=len(g.members),
        members=g.members,
        created_at=g.created_at
    )