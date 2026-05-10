import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';

/**
 * 전역 인증 상태 관리 및 유저 정보 동기화 훅
 */
export const useAuth = () => {
  const { user, setUser, accessToken, logout, isHydrated } = useAuthStore();

  /**
   * 서버로부터 최신 유저 정보를 가져와 스토어에 동기화합니다.
   */
  const refreshMe = async () => {
    try {
      const data = await authService.getMe();
      setUser(data);
    } catch (err) {
      // 토큰은 존재하나 정보 로드에 실패한 경우 세션 만료로 간주하여 로그아웃 처리
      if (accessToken) {
        console.warn("Failed to synchronize user data. Logging out.");
        logout();
      }
    }
  };

  useEffect(() => {
    // 저장소 복구(Hydration)가 완료되었고, 토큰은 있으나 유저 정보가 없는 경우 실행
    if (isHydrated && accessToken && !user) {
      refreshMe();
    }
  }, [isHydrated, accessToken, user]);

  return { 
    user, 
    isAuthenticated: !!accessToken, 
    isHydrated,
    logout, 
    refreshMe 
  };
};