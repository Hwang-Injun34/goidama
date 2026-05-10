'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUIStore, TabType } from '@/store/uiStore';
import HomeView from '@/components/features/home/HomeView';
import { Loader2 } from 'lucide-react';

// ── 메인 홈 컴포넌트 ──
function HomeContent() {
  const searchParams = useSearchParams();
  const { setActiveTab } = useUIStore();

  useEffect(() => {
    // 1. URL에 ?tab=profile 같은 파라미터가 있는지 확인합니다.
    const tabParam = searchParams.get('tab') as TabType;
    
    // 2. 파라미터가 있다면 해당 탭으로 강제 이동시킵니다.
    // (Zustand Persist와 별개로 URL 주소 기반으로 동작하게 함으로써 더 확실하게 복구됩니다.)
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams, setActiveTab]);

  return <HomeView />;
}

// ── 최종 페이지 (Suspense로 감싸기) ──
export default function HomePage() {
  return (
    // useSearchParams를 사용할 때는 반드시 Suspense로 감싸야 Next.js 빌드 시 에러가 나지 않습니다.
    <Suspense fallback={
      <div className="h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-brand-lavender-400" size={32} />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}