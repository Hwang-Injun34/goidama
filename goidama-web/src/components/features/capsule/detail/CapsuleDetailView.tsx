'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { capsuleService } from '@/services/capsule.service';
import { useAuthStore } from '@/store/authStore';
import { useCapsule } from '@/hooks/useCapsule';
import {
  ChevronLeft,
  Trash2,
  Loader2,
  Sparkles,
  Lock,
  Unlock,
  Gift,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import PendingState from './states/PendingState';
import LockedState from './states/LockedState';
import AvailableState from './states/AvailableState';
import OpenedState from './states/OpenedState';

export default function CapsuleDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { deleteCapsule } = useCapsule();

  const [capsule, setCapsule] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const data = await capsuleService.getDetail(id);
      setCapsule(data);
    } catch (err) {
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const normalizeId = (targetId: string | undefined | null) => {
    if (!targetId) return '';
    return targetId.replace(/-/g, '').toLowerCase();
  };

  const myId = normalizeId(user?.id);
  const ownerId = normalizeId(capsule?.owner?.id);
  const isOwner = myId !== '' && ownerId !== '' && myId === ownerId;
  const status = (capsule?.status || '').toUpperCase();
  const canDelete = isOwner && (status === 'PENDING' || status === 'OPENED');

  // ── 🎨 CapsuleCard & StatusBadge와 완벽히 일치시킨 상태 테마 ──
  const statusTheme: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
    PENDING: {
      label: '작성 중',
      icon: Clock,
      color: 'text-gray-400',
      bg: 'bg-gray-50',
      border: 'border-gray-100',
    },
    LOCKED: {
      label: '보관 중',
      icon: Lock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
    AVAILABLE: {
      label: '개봉 가능',
      icon: Unlock,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    OPENED: {
      label: '열린 추억',
      icon: Gift,
      color: 'text-brand-lavender-600',
      bg: 'bg-brand-lavender-50',
      border: 'border-brand-lavender-100',
    },
  };

  const theme = statusTheme[status] || statusTheme.PENDING;
  const StatusIcon = theme.icon;

  /* ──────────────── 1. 프리미엄 로딩 ──────────────── */
  if (loading || !capsule) {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-brand-lavender-100/30 blur-3xl rounded-full scale-150 animate-pulse" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="relative z-10"
          >
            <Loader2 size={40} className="text-brand-lavender-200" strokeWidth={1.5} />
          </motion.div>
        </div>
        <div className="mt-8 text-center space-y-2">
          <h3 className="text-[17px] font-bold text-brand-text tracking-tight">추억을 꺼내고 있어요</h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-light">Searching Memories</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative pb-16">
      
      {/* ── 2. 상단 헤더 (배지 스타일 통일) ── */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 z-[70] w-full max-w-[480px] px-5 pt-4">
        <div className="h-16 px-4 rounded-[28px] bg-white/80 backdrop-blur-xl border border-brand-lavender-100 shadow-card flex items-center justify-between">
          
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-brand-lavender-100 text-brand-text active:bg-brand-lavender-50 transition-all"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>

          <div className="flex flex-col items-center">
            {/* StatusBadge와 동일한 디자인 언어 적용 */}
            <div className={`px-4 py-1.5 rounded-full border ${theme.bg} ${theme.border} flex items-center gap-2 transition-colors duration-500`}>
              <StatusIcon size={12} className={theme.color} strokeWidth={2.5} />
              <span className={`text-[11px] font-[900] ${theme.color} tracking-tight`}>
                {theme.label}
              </span>
            </div>
          </div>

          <div className="w-10 flex justify-end">
            {canDelete && (
              <button 
                onClick={() => {
                  if (confirm('이 추억을 정말 삭제하시겠어요?\n삭제된 추억은 다시 불러올 수 없습니다.')) {
                    deleteCapsule(capsule.id, capsule.status);
                  }
                }}
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-red-100 text-red-400 active:bg-red-50 transition-colors shadow-sm"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── 3. 메인 콘텐츠 ── */}
      <main className="pt-24 relative z-10 px-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            {!capsule.is_group && (status === 'PENDING' || status === 'LOCKED') ? (
              <LockedState capsule={capsule} isOwner={isOwner} />
            ) : (
              (() => {
                switch (status) {
                  case 'PENDING': return <PendingState capsule={capsule} isOwner={isOwner} refresh={fetchDetail} />;
                  case 'LOCKED': return <LockedState capsule={capsule} isOwner={isOwner} />;
                  case 'AVAILABLE': return <AvailableState capsule={capsule} refresh={fetchDetail} />;
                  case 'OPENED': return <OpenedState capsule={capsule} />;
                  default: return (
                    <div className="py-20 flex flex-col items-center opacity-20">
                      <Sparkles size={40} className="text-brand-lavender-200" />
                      <p className="mt-4 font-bold tracking-widest text-[11px] uppercase">No Information</p>
                    </div>
                  );
                }
              })()
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="mt-16 flex flex-col items-center justify-center opacity-20 pointer-events-none pb-12">
        <ShieldCheck size={20} className="text-brand-lavender-400" />
        <p className="mt-2 text-[9px] font-black uppercase tracking-[0.4em] text-brand-text">Goidama Encrypted</p>
      </div>
    </div>
  );
}