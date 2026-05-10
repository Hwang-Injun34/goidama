'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Plus,
  ChevronRight,
  Loader2,
  Clock3,
  Gift,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useTimeline } from '@/hooks/useTimeline';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store/uiStore';

export default function MainDashboard() {
  const { user } = useAuth();
  const { data: timelineData, loading } = useTimeline();
  const { setActiveTab } = useUIStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  const { upcomingCapsules } = useMemo(() => {
    const all = timelineData.flatMap((group) => group.capsules || []);
    const upcoming = all
      .filter((cap) => cap.status !== 'OPENED' && cap.status !== 'ARCHIVED')
      .sort((a, b) => a.d_day - b.d_day)
      .slice(0, 3);
    return { upcomingCapsules: upcoming };
  }, [timelineData]);

  const slides = [
    {
      id: 'notice',
      badge: 'NOTICE',
      title: <>소중한 순간을<br />'고이' 담아드릴게요</>,
      sub: '고이담아 버전 1.2.0 업데이트 안내',
      href: '/notice',
      icon: <Zap size={22} className="text-brand-lavender-600" />,
      bg: 'bg-brand-lavender-50',
      iconBg: 'bg-brand-lavender-100',
      dotColor: 'bg-brand-lavender-400',
      sparkle: 'text-brand-lavender-400/40',
    },
    {
      id: 'guide',
      badge: 'GUIDE',
      title: <>타임캡슐을<br />고이 만드는 방법</>,
      sub: '초보자를 위한 가이드 확인하기',
      href: '/notice',
      icon: <Zap size={22} className="text-brand-lavender-600" />,
      bg: 'bg-brand-lavender-50',
      iconBg: 'bg-brand-lavender-100',
      dotColor: 'bg-brand-lavender-600',
      sparkle: 'text-brand-lavender-300/30',
    },
    {
      id: 'event',
      badge: 'EVENT',
      title: <>소중한 인연과<br />추억을 공유해요</>,
      sub: '친구 초대 시 특별한 스킨 증정',
      href: '/notice',
      icon: <Gift size={22} className="text-pink-500" />,
      bg: 'bg-pink-50',
      iconBg: 'bg-pink-100',
      dotColor: 'bg-pink-300',
      sparkle: 'text-pink-300/40',
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-brand-lavender-400" size={28} />
      </div>
    );
  }

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-white pb-24">
      
      {/* ── 1. HEADER: 이름 강조형 ── */}
      <header className="flex items-center justify-between px-6 pt-6 pb-2">
        <div className="flex flex-col">
          <h1 className="text-[22px] font-bold tracking-tighter text-brand-text leading-tight">
            <span className="text-brand-lavender-600">{user?.nickname ?? '나'}</span>님의 타임캡슐
          </h1>
          <p className="text-[12px] font-medium text-brand-subtext mt-1">
            오늘도 소중한 추억을 고이 담아보세요.
          </p>
        </div>
      </header>

      {/* ── 2. HERO SLIDER: 드래그 & 내비게이션 ── */}
      <section className="px-5 pt-4">
        <div className="group relative h-[190px] w-full overflow-hidden rounded-[28px] border border-brand-lavender-100 shadow-sm">
          
          {/* Slider Buttons (Hover 시 노출) */}
          <button onClick={prevSlide} className="absolute left-3 top-1/2 z-30 -translate-y-1/2 w-9 h-9 rounded-full bg-white/40 backdrop-blur-md border border-white/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-90">
            <ChevronRight size={18} className="rotate-180 text-brand-lavender-600" />
          </button>
          <button onClick={nextSlide} className="absolute right-3 top-1/2 z-30 -translate-y-1/2 w-9 h-9 rounded-full bg-white/40 backdrop-blur-md border border-white/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-90">
            <ChevronRight size={18} className="text-brand-lavender-600" />
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) nextSlide();
                if (info.offset.x > 60) prevSlide();
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={`absolute inset-0 ${slide.bg} cursor-grab active:cursor-grabbing`}
            >
              <Link href={slide.href} className="block w-full h-full px-6 py-6 relative">
                <Sparkles className={`absolute top-5 right-6 ${slide.sparkle}`} size={32} strokeWidth={1.5} />
                
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/80 border border-brand-lavender-100 mb-3">
                      <span className="text-[10px] font-bold tracking-widest text-brand-lavender-600 uppercase">
                        {slide.badge}
                      </span>
                    </div>
                    <h2 className="text-[20px] font-bold leading-[1.3] tracking-tight text-brand-text">
                      {slide.title}
                    </h2>
                    <p className="mt-1.5 text-[12px] text-brand-subtext font-medium">{slide.sub}</p>
                  </div>

                  <div className="flex items-end justify-between">
                    <div className="flex gap-1.5 mb-1">
                      {slides.map((_, idx) => (
                        <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 ${currentSlide === idx ? `w-5 ${slide.dotColor}` : 'w-1.5 bg-brand-lavender-200'}`} />
                      ))}
                    </div>
                    <div className={`w-10 h-10 rounded-2xl ${slide.iconBg} flex items-center justify-center border border-white/50 shadow-sm`}>
                      {slide.icon}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── 3. TIMELINE: 곧 열릴 추억들 ── */}
      <section className="px-5 mt-9">
        <div className="flex items-end justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-brand-lavender-400" />
            <h3 className="text-[18px] font-bold tracking-tighter text-brand-text">곧 열릴 추억들</h3>
          </div>
          <button onClick={() => setActiveTab('timeline')} className="flex items-center gap-0.5 text-[12px] font-bold text-brand-subtext hover:text-brand-lavender-600 transition-colors">
            전체보기 <ChevronRight size={14} />
          </button>
        </div>

        <div className="space-y-3">
          {upcomingCapsules.length > 0 ? (
            upcomingCapsules.map((cap) => (
              <Link href={`/capsule/${cap.id}`} key={cap.id}>
                <motion.div whileTap={{ scale: 0.98 }} className="bg-white border border-brand-lavender-100 rounded-[24px] p-4 flex items-center gap-4 shadow-card active:bg-brand-surface transition-colors">
                  
                  {/* 캡슐 썸네일 박스: LockedState 스타일 계승 */}
                  <div className="w-14 h-14 rounded-2xl bg-brand-surface border border-brand-lavender-100 flex items-center justify-center shrink-0 overflow-hidden relative">
                    <img
                      src={`/images/skins/skin-${cap.skin_id || 1}-locked.png`}
                      alt="capsule"
                      className="w-10 h-10 object-contain relative z-10"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cap.status === 'AVAILABLE' ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-brand-lavender-600 bg-brand-lavender-50 border border-brand-lavender-100'}`}>
                        {cap.status === 'AVAILABLE' ? '개봉 가능' : `D-${cap.d_day}`}
                      </span>
                    </div>
                    <h4 className="text-[15px] font-bold text-brand-text truncate tracking-tight">{cap.title}</h4>
                    <p className="text-[11px] text-brand-subtext mt-0.5 font-medium">
                      {new Date(cap.open_at).toLocaleDateString('ko-KR')} 고이 열립니다
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-brand-light" />
                </motion.div>
              </Link>
            ))
          ) : (
            /* Empty State: 정갈한 빈 화면 */
            <div className="border border-dashed border-brand-lavender-100 rounded-[24px] py-14 flex flex-col items-center bg-brand-surface">
              <Clock3 size={32} className="text-brand-lavender-200 mb-3" />
              <p className="text-[14px] font-bold text-brand-subtext text-center leading-relaxed">
                아직 기다리는 추억이 없어요.<br />
                <span className="text-brand-lavender-600">새로운 캡슐</span>을 고이 담아볼까요?
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── 4. QUICK CREATE: 시그니처 버튼 ── */}
      <section className="px-5 mt-8">
        <Link
          href="/capsule/create"
          className="h-[58px] rounded-2xl bg-brand-lavender-600 text-white flex items-center justify-center gap-3 active:scale-[0.97] transition-all shadow-lg shadow-brand-lavender-600/20"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <Plus size={18} strokeWidth={3} className="text-white" />
          </div>
          <span className="text-[16px] font-bold tracking-tight">새 타임캡슐 만들기</span>
        </Link>
      </section>
    </div>
  );
}