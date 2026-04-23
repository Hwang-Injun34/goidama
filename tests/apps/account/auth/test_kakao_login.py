"""
테스트 대상: kakao_login() 

내부 흐름:
    1. token 받기
    2. user info 받기
    3. DB 조회
    4. 없으면 생성
    5. JWT 발급

Given(준비)
    - 카카오 유저 정보
When(실행)
    - kakao_login 실행
Then(검증)
    - DB에 user 생성
    - JWT 반환
"""
import pytest 
from unittest.mock import AsyncMock 
from sqlmodel import select 

from appserver.apps.account.auth.kakao import service 
from appserver.apps.account.auth.kakao.client import (
    get_kakao_token, 
    get_kakao_user,
)
from appserver.apps.account.models import User 

@pytest.mark.asyncio 
async def test_kakao_login_new_user(session, monkeypatch):
    """
    신규 유저 로그인 시
    - DB에 유저 생성
    - JWT 반환
    """
    #----------------
    # Given
    #----------------
    # 1. 카카오 토큰 mock
    monkeypatch.setattr(
        "appserver.apps.account.auth.kakao.service.get_kakao_token",
        AsyncMock(return_value={"access_token": "fake_token"})
    )

    monkeypatch.setattr(
        "appserver.apps.account.auth.kakao.service.get_kakao_user",
        AsyncMock(return_value={
            "id": 1234567890,
            "profile_nickname": "test_user"
        })
    )
    #----------------
    # When 
    #----------------
    result = await service.kakao_login("fake_code", session)
    

    #----------------
    # Then
    #----------------
    # 1. JWT 확인
    assert "access_token" in result 
    assert result["user_id"] is not None 

    # 2. DB 검증
    res = await session.execute(
        select(User).where(User.oauth_id == "1234567890")
    )
    user = res.scalar_one_or_none()
    
    assert user is not None
    assert user.oauth_id == "1234567890"
    assert user.provider.value == "kakao"