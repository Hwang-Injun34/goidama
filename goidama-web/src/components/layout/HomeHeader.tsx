'use client';

import Image from 'next/image';
import { Bell, User } from 'lucide-react';
import Link from 'next/link';
import { useNotification } from '@/hooks/useNotification';
import { useUIStore } from '@/store/uiStore';

export default function HomeHeader() {
  const { unreadCount } = useNotification();
  const { setActiveTab } = useUIStore();
  
  const hasUnread = unreadCount > 0;

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[50] px-5 h-[64px] flex justify-between items-center bg-white/80 backdrop-blur-xl border-b border-brand-lavender-100 pt-safe">
      
      {/* 로고 영역: 깔끔하게 왼쪽 정렬 */}
      <div 
        className="relative h-8 w-28 flex items-center justify-start cursor-pointer transition-transform active:scale-95"
        onClick={() => setActiveTab('home')}
      >
        <Image
          src="/logo_1.png" 
          alt="고이담아"
          fill 
          priority            
          sizes="(max-width: 768px) 100vw, 480px"
          className="select-none object-contain object-left"
        />
      </div>
      
      {/* 우측 액션 버튼 그룹 */}
      <div className="flex items-center gap-1">
        {/* 알림 버튼 */}
        <Link 
          href="/notification" 
          className="relative w-10 h-10 flex items-center justify-center rounded-full transition-colors active:bg-brand-lavender-50"
        >
          <Bell size={22} strokeWidth={2} className="text-brand-text" />
          {hasUnread && (
            /* 알림 점: 노란색 대신 브랜드 컬러 혹은 세련된 핑크로 교체 */
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-lavender-600 border-2 border-white rounded-full shadow-sm" />
          )}
        </Link>

        {/* 프로필 버튼 */}
        <button 
          onClick={() => setActiveTab('profile')}
          className="w-10 h-10 flex items-center justify-center rounded-full transition-colors active:bg-brand-lavender-50"
        >
          {/* 아바타: 브랜드 라벤더 링 적용 */}
          <div className="w-8 h-8 rounded-full border-[1.5px] border-brand-lavender-400 flex items-center justify-center text-brand-lavender-600 bg-brand-lavender-50">
            <User size={18} strokeWidth={2.5} />
          </div>
        </button>
      </div>
    </header>
  );
}