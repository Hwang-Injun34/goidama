'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function LoginScreen() {
  const REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
  const REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;

  const handleKakaoLogin = () => {
    if (!REST_API_KEY || !REDIRECT_URI) {
      alert("카카오 설정이 누락되었습니다.");
      return;
    }
    window.location.href = KAKAO_AUTH_URL;
  };

  return (
    <div className="h-screen flex flex-col px-10 pb-16 bg-white relative overflow-hidden">
      
      {/* ── 배경 장식: 상단에 은은한 라벤더 빛 ── */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] bg-brand-lavender-50 rounded-full blur-[100px] opacity-60" />

      {/* 상단: 브랜드 로고 및 감성 문구 */}
      <div className="flex-1 flex flex-col justify-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* 브랜드 심볼: 보라색 반짝이 */}
          <div className="text-brand-lavender-600">
            <Sparkles size={32} strokeWidth={1.5} />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-brand-text text-[34px] font-bold tracking-tighter leading-tight">
              고이담아
            </h1>
            <div className="space-y-1">
              <p className="text-brand-text text-[16px] font-medium leading-relaxed">
                지나간 시간은 돌아오지 않지만,
              </p>
              <p className="text-brand-lavender-600 text-[16px] font-bold leading-relaxed">
                추억은 언제든 고이 꺼내볼 수 있도록.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 하단: 로그인 버튼 및 약관 */}
      <div className="space-y-8 relative z-10">
        <div className="space-y-3">
          <motion.button 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            onClick={handleKakaoLogin}
            className="w-full h-[58px] bg-[#FEE500] text-[#191919] rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-sm"
          >
            {/* 카카오 아이콘: 공식 비율 유지 */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M10 3C6.13401 3 3 5.5134 3 8.61438C3 10.6277 4.3005 12.3951 6.2505 13.435L5.43 16.435C5.39 16.585 5.48 16.735 5.63 16.785C5.68 16.795 5.73 16.8 5.78 16.8C5.89 16.8 5.99 16.745 6.05 16.655L9.58 14.285C9.72 14.3 9.86 14.315 10 14.315C13.866 14.315 17 11.8016 17 8.70062C17 5.59963 13.866 3.08624 10 3.08624V3Z" fill="#191919"/>
            </svg>
            카카오로 3초만에 시작하기
          </motion.button>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-[12px] text-brand-subtext font-medium"
          >
          </motion.p>
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-[11px] text-brand-light leading-relaxed"
        >
          시작함으로써 고이담아의 <span className="underline underline-offset-4">이용약관</span> 및 <br />
          <span className="underline underline-offset-4">개인정보 처리방침</span>에 동의하게 됩니다.
        </motion.p>
      </div>
    </div>
  );
}