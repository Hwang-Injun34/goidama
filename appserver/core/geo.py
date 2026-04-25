"""
geopy: 지도/위치 계산 라이브러리
geodesic: 지구 곡률을 고려한 실제 거리 계산
"""
from geopy.distance import geodesic

def get_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    #두 좌표 사이의 거리를 미터(m) 단위로 반환
    return geodesic((lat1, lon1), (lat2, lon2)).meters