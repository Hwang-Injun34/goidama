import httpx
import requests

from appserver.settings import get_settings

settings = get_settings()

async def reverse_geocode(lat: float, lng: float):
    url = "https://dapi.kakao.com/v2/local/geo/coord2address.json"

    headers = {
        "Authorization": f"KakaoAK {settings.KAKAO_REST_API_KEY}"
    }

    params = {"x": lng, "y": lat}

    try:
        async with httpx.AsyncClient(timeout=3) as client:
            response = await client.get(url, headers=headers, params=params)
            response.raise_for_status()
    except httpx.RequestError:
        return "주소 변환 실패"

    data = response.json()
    documents = data.get("documents")

    if not documents:
        return "주소 없음"

    road_address = documents[0].get("road_address")
    if road_address:
        return road_address.get("address_name")

    address = documents[0].get("address")
    if address:
        return address.get("address_name")

    return "주소 없음"