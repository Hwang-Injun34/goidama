// /src/services/auth.service.ts

import api from '@/lib/axios';
import { LoginResponse, UserMeResponse, MessageResponse } from '@/types/auth';

export const authService = {
  /**
   * 카카오 로그인 및 회원가입
   * 백엔드 router.get("/auth/kakao/callback") 에 대응
   */
  kakaoLogin: async (code: string): Promise<LoginResponse> => {
    const res = await api.get('/account/auth/kakao/callback', { 
      params: { code } 
    });
    return res.data;
  },

  /**
   * 토큰 재발급
   * 백엔드 router.post("/auth/refresh") 에 대응
   */
  refresh: async (deviceId: string): Promise<LoginResponse> => {
    const res = await api.post('/account/auth/refresh', { 
      device_id: deviceId 
    });
    return res.data;
  },

  /**
   * 내 정보 조회 (로그인 상태 확인)
   * 백엔드 router.get("/users/me") 에 대응
   */
  getMe: async (): Promise<UserMeResponse> => {
    const res = await api.get('/account/users/me');
    return res.data;
  },

  /**
   * 로그아웃
   * 백엔드 router.post("/auth/logout") 에 대응
   */
  logout: async (): Promise<MessageResponse> => {
    const res = await api.post('/account/auth/logout');
    return res.data;
  },

  /**
   * 회원 탈퇴
   * 백엔드 router.delete("/users/me") 에 대응
   */
  withdraw: async (): Promise<MessageResponse> => {
    const res = await api.delete('/account/users/me');
    return res.data;
  },
};