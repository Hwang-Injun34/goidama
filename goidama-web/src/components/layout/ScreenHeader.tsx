'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  rightAction?: ReactNode;
  transparent?: boolean;
}

export default function ScreenHeader({ 
  title, 
  showBackButton = true, 
  rightAction, 
  transparent = false 
}: HeaderProps) {
  const router = useRouter();

  // 뒤로 가기 처리: 
  // router.back()을 사용하면 브라우저 히스토리를 따라가므로 
  // Persist가 적용된 UIStore가 이전 탭(Profile)을 기억해 자동으로 띄워줍니다.
  const handleBack = () => {
    router.back();
  };

  return (
    <header 
      className={`
        sticky top-0 w-full z-[100] flex items-center justify-between px-4 h-[72px] shrink-0 transition-all pt-safe
        ${transparent 
          ? 'bg-transparent' 
          : 'bg-white/80 backdrop-blur-lg border-b border-gray-100'
        }
      `}
    >
      {/* ── 좌측 영역: 뒤로가기 및 제목 ── */}
      <div className="flex items-center gap-1">
        {showBackButton && (
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleBack} 
            className="w-10 h-10 flex items-center justify-center text-brand-text hover:bg-brand-surface rounded-2xl transition-colors active:bg-brand-lavender-50"
          >
            <ChevronLeft size={26} strokeWidth={3} />
          </motion.button>
        )}
        
        {title && (
          <h1 className="text-[19px] font-[900] text-brand-text tracking-tight ml-1">
            {title}
          </h1>
        )}
      </div>

      {/* ── 우측 영역: 추가 액션 ── */}
      <div className="flex items-center justify-end pr-1">
        {rightAction}
      </div>
    </header>
  );
}