'use client';

import { Calendar, MapPin, Lock, Clock3, Hourglass, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LockedState({ capsule, isOwner }: { capsule: any; isOwner: boolean }) {
  const openDate = new Date(capsule.open_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-[80vh] bg-white px-6 pb-20 relative">
      
      {/* ── 1. 상단 캡슐 비주얼 ── */}
      <section className="pt-12 pb-10 flex flex-col items-center relative">
        {/* 은은한 배경 광채 */}
        <div className="absolute top-10 w-32 h-32 bg-brand-lavender-100/40 blur-[50px] -z-10 rounded-full" />
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-6"
        >
          {/* 캡슐 아이콘 박스 */}
          <div className="w-28 h-28 bg-white rounded-[32px] border border-brand-lavender-100 shadow-card flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-brand-surface opacity-50" />
            <img
              src={`/images/skins/skin-${capsule.skin_id || 1}-locked.png`}
              alt="capsule"
              className="w-32 h-32 object-contain relative z-10 drop-shadow-sm"
            />
          </div>
          
          {/* 잠금 배지: 브랜드 라벤더 적용 */}
          <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-xl bg-brand-lavender-600 flex items-center justify-center text-white border-[3px] border-white shadow-sm">
            <Lock size={14} strokeWidth={2.5} />
          </div>
        </motion.div>

        <div className="text-center space-y-1">
          <h1 className="text-[22px] font-bold text-brand-text tracking-tighter">
            {capsule.title}
          </h1>
          <p className="text-[12px] text-brand-lavender-400 font-bold uppercase tracking-widest">
            Safely Archived
          </p>
        </div>
      </section>

      {/* ── 2. 정보 바 (날짜 | 위치) ── */}
      <section className="max-w-md mx-auto mb-8">
        <div className="bg-brand-surface border border-brand-lavender-100 rounded-2xl py-5 px-2 flex items-center shadow-sm">
          {/* 날짜 */}
          <div className="flex-1 flex flex-col items-center border-r border-brand-lavender-100/50">
            <div className="flex items-center gap-1.5 mb-1.5 text-brand-light">
              <Calendar size={13} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Unlock Date</span>
            </div>
            <p className="text-[14px] font-bold text-brand-text">{openDate}</p>
          </div>

          {/* 위치 */}
          <div className="flex-1 flex flex-col items-center px-2">
            <div className="flex items-center gap-1.5 mb-1.5 text-brand-light">
              <MapPin size={13} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Location</span>
            </div>
            <p className="text-[14px] font-bold text-brand-text truncate w-full text-center px-2">
              {capsule.address?.split(' ').slice(0, 2).join(' ') || '장소 미지정'}
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. 메인 잠금 안내 카드 (안 느끼하게 정갈한 감성) ── */}
      <section className="max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[32px] p-8 text-center border border-brand-lavender-100 shadow-card relative overflow-hidden"
        >
          {/* 상단 장식 별 */}
          <Sparkles className="absolute top-4 right-4 text-brand-lavender-100" size={20} />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-lavender-50 flex items-center justify-center mb-6">
              <Hourglass size={24} className="text-brand-lavender-600" strokeWidth={2.2} />
            </div>
            
            <h2 className="text-[19px] font-bold text-brand-text mb-3 tracking-tight">
              추억이 고이 보관되고 있어요
            </h2>
            
            <p className="text-[13px] text-brand-subtext leading-relaxed font-medium">
              설정된 시간과 장소 조건이 모두 충족되어야<br/>
              소중한 기록을 다시 열어볼 수 있습니다.
            </p>
          </div>
        </motion.div>

        {/* 하단 관리 배지 */}
        {isOwner && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-brand-surface rounded-full border border-brand-lavender-100">
              <div className="w-1.5 h-1.5 bg-brand-lavender-600 rounded-full animate-pulse" />
              <span className="text-[11px] font-bold text-brand-lavender-600 uppercase tracking-widest">
                My Goidama Capsule
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}