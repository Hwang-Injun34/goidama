'use client';

import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import BottomTab from './BottomTab';

export default function TabWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  /**
   * 바텀 탭을 노출하지 않는 경로 설정
   */
  const isAuthRoute = ['/', '/login', '/account/auth/kakao/callback'].includes(pathname);
  const isCapsuleProcess = pathname.startsWith('/capsule/'); 

  const shouldShowTab = !isAuthRoute && !isCapsuleProcess;

  return (
    /* 외부 배경: 순백색 혹은 아주 연한 라벤더 그레이로 설정해 모바일 프레임을 강조 */
    <div className="relative flex flex-col min-h-screen bg-brand-surface">
      
      {/* 
        중앙 집중형 레이아웃: 
        max-width를 480px로 제한하여 모바일 앱 퀄리티를 유지합니다.
      */}
      <div className="flex-1 flex flex-col w-full max-w-[480px] mx-auto bg-white shadow-card min-h-screen relative overflow-x-hidden">
        
        {/* 메인 컨텐츠 영역 */}
        <main 
          className={`flex-1 flex flex-col transition-all duration-500 ${
            /* 바텀탭 높이 64px에 맞춰 패딩 조정 */
            shouldShowTab ? 'pb-[64px]' : 'pb-0'
          }`}
        >
          {children}
        </main>
        
        {/* 
          바텀 탭 애니메이션: 
          탭바가 등장할 때 투박하지 않게 스프링 애니메이션 적용
        */}
        <AnimatePresence>
          {shouldShowTab && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[50]"
            >
              <BottomTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}