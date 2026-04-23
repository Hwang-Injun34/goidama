"""
카카오 로그인 과정
https://developers.kakao.com/docs/ko/kakaologin/rest-api

[1] 인가 코드 요청
1. 서비스 서버가 카카오 인증 서버로 인가 코드 요청을 호출
2. 카카오 인증 서버가 사용자에게 인증을 요청
3. 사용자가 카카오계정으로 로그인
4. 카카오 인증 서버가 사용자에게 동의 화면을 출력하여 인가를 위한 사용자 동의를 요청
5. 사용자가 필수 동의항목과, 이 외의 원하는 동의항목에 동의한 뒤 [동의하고 계속하기] 버튼을 누른다. 
6. 카카오 인증 서버는 서비스 서버의 리다이렉트 URI로 인가 코드를 전달

[2] 토큰 요청
1. 서비스 서버가 리다이렉트 URI로 전달받은 인가 코드로 토큰 요청을 호출
2. 카카오 인증 서버가 토큰을 발급해 서비스 서버에 전달

[3] 사용자 로그인 처리
- 서비스 서버가 발급받은 액세스 토큰으로 사용자 정보 조회 API를 요청해 사용자의 회원번호 및 정보를 조회하여 서비스 회원인지 확인
- 서비스 회원 정보 확인 결과에 따라 서비스 로그인 또는 회원 가입
- 이 외 서비스에서 필요한 로그인 절차를 수행한 후, 카카오 로그인한 사용자의 서비스 로그인 처리를 완료

"""

import httpx
from appserver.settings import get_settings

settings = get_settings()

async def get_kakao_token(code: str):
    url = "https://kauth.kakao.com/oauth/token"
    
    data = {
        "grant_type": "authorization_code",
        "client_id": settings.KAKAO_REST_API_KEY,
        "redirect_uri": settings.KAKAO_REDIRECT_URI,
        "code": code,
        "client_secret": settings.KAKAO_CLIENT_SECRET
    }

    headers = {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
    }

    async with httpx.AsyncClient() as client: 
        response = await client.post(
            url=url,
            data=data,
            headers=headers
        )
        
        
        if response.status_code != 200:
            print("--- 카카오 API 에러 발생 ---")
            print(f"상태 코드: {response.status_code}")
            print(f"상세 내용: {response.json()}")
            print("--------------------------")
    
    response.raise_for_status()
    return response.json()
    # -----------------
    #       응답 
    # -----------------
    """    
    {
    "access_token": "${ACCESS_TOKEN}",
    "token_type": "bearer",
    "refresh_token": "${REFRESH_TOKEN}", //optional
    "refresh_token_expires_in": 5184000, //optional
    "expires_in": 43199
    }
    """

async def get_kakao_user(access_token: str):

    url = "https://kapi.kakao.com/v2/user/me"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
    } 

    async with httpx.AsyncClient() as client: 
        response = await client.get(
            url=url,
            headers=headers
        )

        response.raise_for_status() 
        return response.json()
        # -----------------
        #       응답 
        # -----------------
        """    
        "id": 123456789,
        "connected_at": "2022-04-11T01:45:28Z",
        "kakao_account": {
            // 프로필 또는 닉네임 동의항목 필요
            "profile_nickname_needs_agreement	": false,
            // 프로필 또는 프로필 사진 동의항목 필요
            "profile_image_needs_agreement	": false,
            "profile": {
                // 프로필 또는 닉네임 동의항목 필요
                "nickname": "홍길동",
                // 프로필 또는 프로필 사진 동의항목 필요
                "thumbnail_image_url": "http://yyy.kakao.com/.../img_110x110.jpg",
                "profile_image_url": "http://yyy.kakao.com/dn/.../img_640x640.jpg",
                "is_default_image": false,
                "is_default_nickname": false
            }
        """
    

