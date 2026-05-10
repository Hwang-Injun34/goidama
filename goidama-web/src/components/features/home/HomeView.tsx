'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUIStore, TabType } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';

import BottomTab from '@/components/layout/BottomTab';
import HomeHeader from '@/components/layout/HomeHeader';

import MapSection from './sections/MapSection';
import TimelineSection from './sections/TimelineSection';
import FriendsSection from './sections/FriendsSection';
import ProfileSection from './sections/ProfileSection';
import MainDashboard from './sections/MainDashboard';

import { motion, AnimatePresence } from 'framer-motion';

function HomeContent() {
  const { activeTab, setActiveTab } = useUIStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isAppReady, setIsAppReady] = useState(false);
  const [isStorageReady, setIsStorageReady] = useState(false); // 저장소 로드 상태 추가

  /**
   * 1. Zustand Persist 하이드레이션 체크
   * 브라우저의 localStorage에서 데이터를 완전히 읽어올 때까지 기다립니다.
   */
  useEffect(() => {
    const unsub = useUIStore.persist.onFinishHydration(() => {
      setIsStorageReady(true);
    });
    
    // 만약 이미 하이드레이션이 끝났을 경우를 대비
    if (useUIStore.persist.hasHydrated()) {
      setIsStorageReady(true);
    }

    return () => unsub();
  }, []);

  /**
   * 2. 인증 체크 및 초기화
   */
  useEffect(() => {
    const checkAuth = () => {
      const auth = useAuthStore.getState();
      const token = auth.accessToken;
      const hydrated = auth.isHydrated;

      if (token) {
        setIsAppReady(true);
        return;
      }

      if (hydrated && !token) {
        router.replace('/login');
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 500);

    return () => clearInterval(interval);
  }, [router]);

  /**
   * 3. URL 탭 동기화 (우선순위 높음)
   * URL에 직접 ?tab=...이 있다면 저장된 상태보다 URL을 우선합니다.
   */
  useEffect(() => {
    if (!isAppReady || !isStorageReady) return;
    const tab = searchParams.get('tab') as TabType;
    if (tab && ['home', 'map', 'timeline', 'friends', 'profile'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [isAppReady, isStorageReady, searchParams, setActiveTab]);

  /**
   * ── Splash Screen: 프리미엄 무드 ──
   */
  if (!isAppReady || !isStorageReady) {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="text-[32px] font-[900] text-brand-text tracking-tighter">
            고이담아
          </div>
          <div className="mt-2 flex gap-1">
             <div className="w-1 h-1 rounded-full bg-brand-lavender-600 animate-bounce" style={{ animationDelay: '0ms' }} />
             <div className="w-1 h-1 rounded-full bg-brand-lavender-600 animate-bounce" style={{ animationDelay: '150ms' }} />
             <div className="w-1 h-1 rounded-full bg-brand-lavender-600 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </motion.div>
      </div>
    );
  }

  /**
   * ── Main Layout ──
   */
  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* 고정 헤더 */}
      <HomeHeader />

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 pt-[72px] pb-[72px] relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="h-full overflow-y-auto no-scrollbar"
          >
            {activeTab === 'home' && <MainDashboard />}
            {activeTab === 'map' && <MapSection />}
            {activeTab === 'timeline' && <TimelineSection />}
            {activeTab === 'friends' && <FriendsSection />}
            {activeTab === 'profile' && <ProfileSection />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 고정 바텀탭 */}
      <BottomTab />
    </div>
  );
}

export default function HomeView() {
  return <HomeContent />;
}