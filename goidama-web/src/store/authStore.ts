// /src/store/authStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { UserMeResponse } from '@/types/auth';

interface AuthState {
  accessToken: string | null;
  deviceId: string;
  user: UserMeResponse | null;
  isHydrated: boolean;

  setAccessToken: (token: string | null) => void;
  setUser: (user: UserMeResponse | null) => void;
  setHydrated: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      deviceId: '',
      isHydrated: false,

      // 토큰 저장
      setAccessToken: (token) => set({ accessToken: token }),
      
      // 유저 정보 저장
      setUser: (user) => set({ user }),

      // 하이드레이션 및 디바이스 ID 생성
      setHydrated: () => {
        const currentId = get().deviceId;
        set({
          isHydrated: true,
          deviceId: currentId || uuidv4(),
        });
      },

      // 로그아웃: 인증 관련 정보를 깨끗이 비움
      logout: () => {
        set({ 
          accessToken: null, 
          user: null 
        });
        // 필요시 로컬스토리지 강제 삭제
        localStorage.removeItem('auth-storage');
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // 저장할 데이터만 골라내기
      partialize: (state) => ({
        accessToken: state.accessToken,
        deviceId: state.deviceId,
        user: state.user,
      }),
      // 하이드레이션 완료 시 실행
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);