'use client';

import { useState } from 'react';
import { capsuleService } from '@/services/capsule.service';
import { getDistance } from '@/utils/geo';

export const useCheckIn = (capsule: any, onSuccess: () => void) => {
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    if (!navigator.geolocation) {
      alert('이 브라우저에서는 위치 정보를 사용할 수 없습니다.');
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        
        // 1. 거리 계산
        const dist = getDistance(capsule.latitude, capsule.longitude, latitude, longitude);

        // 2. 거리 검증 (200m)
        if (dist > 200) {
          alert(`약속 장소와 거리가 조금 멉니다. (현재 거리: ${Math.round(dist)}m)\n장소 근처로 이동 후 다시 시도해 주세요.`);
          setLoading(false);
          return;
        }

        try {
          // 3. 인증 API 호출
          await capsuleService.checkIn(capsule.id, latitude, longitude);
          
          // 4. 성공 시 새로고침
          onSuccess(); 
        } catch (err: any) {
          /**
           * 핵심 수정 포인트:
           * 백엔드에서 이미 인증되었거나(409), 이미 열린 캡슐(400)이라는 에러가 와도
           * 실제로는 성공한 것과 다름없으므로 에러 팝업 없이 리프레시를 수행합니다.
           */
          const status = err.response?.status;
          const message = err.response?.data?.message || '';

          if (status === 409 || status === 400 || message.includes('already')) {
            console.log("인증이 이미 완료되었거나 캡슐이 열린 상태입니다. 화면을 전환합니다.");
            onSuccess(); // 에러 팝업 없이 바로 성공 처리
            return;
          }

          // 그 외 진짜 실패인 경우에만 알림
          console.error("Check-in Error:", err);
          alert(message || '도착 인증 처리 중 문제가 발생했습니다. 다시 시도해 주세요.');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("GPS Access Error:", err.message);
        alert('현재 위치 정보를 가져올 수 없습니다. GPS 권한 설정을 확인해 주세요.');
        setLoading(false);
      },
      { 
        enableHighAccuracy: false, 
        timeout: 10000,
        maximumAge: 0 
      }
    );
  };

  return { handleCheckIn, loading };
};