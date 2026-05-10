'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

export default function KakaoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAccessToken, setUser } = useAuthStore();
  const hasCalled = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');

    if (code && !hasCalled.current) {
      hasCalled.current = true;
      handleLogin(code);
    }
  }, [searchParams]);

  const handleLogin = async (code: string) => {
    try {
      // 1️⃣ 카카오 로그인 → 토큰만 받기
      const res = await authService.kakaoLogin(code);
      setAccessToken(res.access_token);

      // 2️⃣ 내 정보 조회 (안정적인 구조)
      const me = await authService.getMe();
      setUser(me);

      // 3️⃣ 홈 이동
      router.replace('/home');
    } catch (err) {
      console.error(err);
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
      router.replace('/login');
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      
      {/* 로딩 UI */}
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-brand-lavender-100 rounded-full" />
        <Loader2 className="w-16 h-16 text-brand-lavender-600 animate-spin absolute top-0 left-0" />
      </div>

      <h3 className="text-xl font-bold text-brand-text">
        로그인 처리 중
      </h3>

      <p className="text-brand-subtext text-sm mt-2 font-medium">
        고이담아에 안전하게 접속하고 있어요 :)
      </p>
    </div>
  );
}