'use client';

import { Map, Clock, Plus, Users, Home } from 'lucide-react';
import { useUIStore, TabType } from '@/store/uiStore';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

const TABS = [
  { id: 'home', label: '홈', icon: Home },
  { id: 'map', label: '지도', icon: Map },
  { id: 'create', label: '생성', icon: Plus },
  { id: 'timeline', label: '타임라인', icon: Clock }, // 타임라인/기능
  { id: 'friends', label: '친구', icon: Users },
] as const;

function BottomTabContent() {
  const { activeTab, setActiveTab } = useUIStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType;
    if (tabParam && TABS.some(t => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams, setActiveTab]);

  const handleTabClick = (id: TabType) => {
    if (id === 'create') {
      router.push('/capsule/create');
      return;
    }

    if (pathname !== '/home') {
      setActiveTab(id);
      router.push(`/home?tab=${id}`);
      return;
    }

    setActiveTab(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/80 backdrop-blur-xl border-t border-brand-lavender-100 pb-safe z-50 shadow-[0_-4px_16px_rgba(139,127,212,0.08)]">
      <div className="flex justify-around items-center h-[64px] px-2">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id && pathname === '/home';
          const isCreate = id === 'create';
          
          return (
            <button
              key={id}
              onClick={() => handleTabClick(id as TabType)}
              className="relative flex flex-col items-center justify-center w-full h-full transition-all active:scale-95"
            >
              {isCreate ? (
                /* 중앙 생성 버튼: 깨끗한 보라색 + 화이트 아이콘 */
                <div className="flex flex-col items-center justify-center -translate-y-4">
                  <div className="w-12 h-12 bg-brand-lavender-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-lavender-600/30 border-[3px] border-white transition-transform hover:scale-105 active:scale-90">
                    <Icon size={26} className="text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] mt-1.5 font-bold text-brand-lavender-600">
                    {label}
                  </span>
                </div>
              ) : (
                /* 일반 탭 버튼: 라벤더 600(Active)과 세련된 그레이 */
                <div className="flex flex-col items-center gap-1">
                  <Icon 
                    size={22} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className={`transition-all duration-300 ${
                      isActive ? 'text-brand-lavender-600' : 'text-brand-light'
                    } ${isActive ? '-translate-y-0.5' : ''}`}
                  />
                  <span className={`text-[10px] font-bold transition-colors duration-300 ${
                    isActive ? 'text-brand-lavender-600' : 'text-brand-subtext'
                  }`}>
                    {label}
                  </span>
                  
                  {/* 활성화 상태 인디케이터 (작은 바 형태) */}
                  {isActive && (
                    <div className="absolute -bottom-1 w-1 h-1 bg-brand-lavender-600 rounded-full" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default function BottomTab() {
  return (
    <Suspense fallback={<div className="h-[72px] bg-white border-t border-brand-lavender-100" />}>
      <BottomTabContent />
    </Suspense>
  );
}