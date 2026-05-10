import { useState, useCallback } from 'react';

/**
 * 브라우저 Geolocation API를 사용하여 현재 위치(위도, 경도)를 가져오는 훅
 */
export const useGps = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * 장치의 현재 위치 정보를 요청합니다.
   */
  const fetchLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert("이 브라우저에서는 위치 정보를 사용할 수 없습니다.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        console.warn("GPS access failed:", err.message);
        
        let errorMessage = "위치 정보를 가져올 수 없습니다.";
        
        // 에러 코드별 메시지 세분화
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = "위치 정보 접근 권한이 거부되었습니다. 설정에서 권한을 허용해 주세요.";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = "위치 정보를 사용할 수 없는 환경입니다.";
            break;
          case err.TIMEOUT:
            errorMessage = "위치 정보 요청 시간이 초과되었습니다. 다시 시도해 주세요.";
            break;
        }

        alert(errorMessage);
        setLoading(false);
      },
      {
        // 💡 고정 주소 테스트(HTTP) 환경에서는 false가 더 안정적일 수 있습니다.
        enableHighAccuracy: false, 
        timeout: 10000, // 10초 이내에 응답이 없으면 에러 처리
        maximumAge: 0,  // 항상 최신 위치를 가져오도록 설정
      }
    );
  }, []);

  /**
   * 위치 정보를 초기화합니다.
   */
  const resetLocation = useCallback(() => {
    setLocation(null);
  }, []);

  return { location, loading, fetchLocation, resetLocation };
};