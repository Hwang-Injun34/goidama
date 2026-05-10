'use client';

import { History, Lock, Sparkles, User2, Unlock, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import StatusBadge from './StatusBadge'; 
import { getDDay } from '@/utils/date';

export default function CapsuleCard({ capsule }: { capsule: any }) {
  const status = capsule.status?.toUpperCase() || '';
  const isPending = status === 'PENDING';
  const isLocked = status === 'LOCKED';
  const isAvailable = status === 'AVAILABLE';
  const isOpened = status === 'OPENED';

  const participants = capsule.participants || [];
  const dday = getDDay(capsule.open_at);

  // ── 🎨 고이담아 통합 브랜드 테마 시스템 (색감 정돈) ──
  const theme = isPending
    ? {
        border: 'border-brand-lavender-100',
        bg: 'bg-brand-surface',
        subText: 'text-brand-subtext',
        label: '소중한 내용을 고이 담는 중',
        badge: <Clock size={11} className="text-brand-lavender-400" strokeWidth={2.5} />
      }
    : isLocked
    ? {
        border: 'border-amber-100',
        bg: 'bg-amber-50/50',
        subText: 'text-amber-600',
        label: dday || '추억이 고이 익어가고 있어요',
        badge: <Lock size={11} className="text-amber-500" strokeWidth={2.5} />
      }
    : isAvailable
    ? {
        border: 'border-emerald-100',
        bg: 'bg-emerald-50/50',
        subText: 'text-emerald-600',
        label: '지금 바로 확인할 수 있어요!',
        badge: <Sparkles size={11} className="text-emerald-500" fill="currentColor" />
      }
    : {
        border: 'border-brand-lavender-100',
        bg: 'bg-brand-lavender-50',
        subText: 'text-brand-lavender-600',
        label: '함께 열어본 소중한 기억',
        badge: <Unlock size={11} className="text-brand-lavender-600" strokeWidth={2.5} />
      };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="mb-4"
    >
      <Link
        href={`/capsule/${capsule.id}`}
        className={`relative flex items-center gap-4 px-5 py-5 bg-white rounded-[24px] border shadow-card transition-all overflow-hidden ${theme.border}`}
      >
        {/* 배경 워터마크 아이콘 (매우 은은하게 처리) */}
        <div className={`absolute -right-6 -bottom-6 text-brand-lavender-100/10 rotate-12`}>
          <History size={100} strokeWidth={1} />
        </div>

        {/* 좌측 캡슐 비주얼 영역 */}
        <div className={`relative z-10 w-[68px] h-[68px] rounded-2xl shrink-0 flex items-center justify-center border border-brand-lavender-100/50 ${theme.bg}`}>
          {/* 내부 은은한 광채 효과 */}
          <div className="absolute inset-2 bg-white/40 rounded-full blur-md" />
          
          <img
            src={`/images/skins/skin-${capsule.skin_id || 1}-${isOpened ? 'opened' : 'locked'}.png`}
            alt="capsule"
            className="relative z-10 w-[70px] h-[70px] object-contain drop-shadow-sm"
          />

          {/* 우측 상단 상태 아이콘 배지 */}
          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white shadow-sm border border-brand-lavender-100 flex items-center justify-center z-20">
            {theme.badge}
          </div>
        </div>

        {/* 중앙 정보 영역 */}
        <div className="flex-1 min-w-0 z-10">
          <div className="mb-1.5">
            <StatusBadge status={status} />
          </div>

          <h4 className="text-[16px] font-bold text-brand-text truncate tracking-tight leading-snug">
            {capsule.title}
          </h4>

          <p className={`mt-1 text-[12px] font-medium tracking-tight ${theme.subText}`}>
            {theme.label}
          </p>
        </div>

        {/* 우측 참여자 스택 및 화살표 */}
        <div className="flex flex-col items-end gap-3 shrink-0 z-10 pl-2">
          <div className="flex -space-x-2">
            {participants.slice(0, 2).map((p: any, i: number) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 border-white overflow-hidden bg-brand-surface shadow-sm"
              >
                {p.profile_image_url ? (
                  <img src={p.profile_image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-lavender-200">
                    <User2 size={12} />
                  </div>
                )}
              </div>
            ))}
            {participants.length > 2 && (
              <div className="w-7 h-7 rounded-full border-2 border-white bg-brand-lavender-600 text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                +{participants.length - 2}
              </div>
            )}
          </div>
          <ChevronRight size={16} className="text-brand-light" />
        </div>
      </Link>
    </motion.div>
  );
}