'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SplashScreen() {
  const router = useRouter();
  const { setUser, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;

    const checkSession = async () => {
      try {
        const user = await authService.getMe();
        setUser(user);
        router.replace('/home');
      } catch (err) {
        router.replace('/login');
      }
    };

    // 브랜드 노출을 위해 2초의 대기 시간을 가집니다.
    const timer = setTimeout(checkSession, 2000); 
    return () => clearTimeout(timer);
  }, [isHydrated, router, setUser]);

  return (
    <div className="h-screen bg-white flex flex-col items-center justify-center overflow-hidden relative">
      
      {/* ── 배경 장식: 아주 연한 라벤더 글로우 효과 ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-lavender-50 rounded-full blur-[120px] opacity-60" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-lavender-50 rounded-full blur-[120px] opacity-60" />

      {/* ── 중앙 브랜드 영역 ── */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center z-10"
      >
        <div className="relative mb-8">
          {/* 메인 심볼: 라벤더 빛 반짝이 아이콘 */}
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="text-brand-lavender-600"
          >
            <Sparkles size={68} strokeWidth={1.5} fill="rgba(139, 127, 212, 0.1)" />
          </motion.div>
          
          {/* 빛나는 포인트 효과 */}
          <motion.div 
            animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.5, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute -top-2 -right-2 w-4 h-4 bg-brand-lavender-400 rounded-full blur-[4px]" 
          />
        </div>

        <div className="text-center">
          {/* 로고 텍스트 */}
          <h1 className="text-[36px] font-bold text-brand-text tracking-tighter mb-3">
            고이담아
          </h1>
          
          {/* 서브 문구: 브랜드 컬러와 연계 */}
          <div className="flex flex-col items-center gap-4">
            <div className="h-[1.5px] w-5 bg-brand-lavender-100" />
            <p className="text-brand-lavender-600 text-[15px] font-medium tracking-wide">
              소중한 추억을 고이 담아드릴게요
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── 하단 정보 (푸터) ── */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="fixed bottom-12 flex flex-col items-center gap-2"
      >
        <p className="text-[11px] font-bold text-brand-lavender-400 tracking-[0.4em] uppercase">
          Digital Time Capsule
        </p>
        <div className="flex items-center gap-2 text-brand-light text-[10px] font-medium">
          <span>v1.0.4</span>
          <span className="w-1 h-1 bg-brand-lavender-100 rounded-full" />
          <span>© 2025 GOIDAMA PROJECT</span>
        </div>
      </motion.div>

    </div>
  );
}