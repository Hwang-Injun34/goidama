'use client';

import { useState, useMemo } from 'react';
import { useTimeline } from '@/hooks/useTimeline';
import CapsuleCard from '@/components/features/capsule/shared/CapsuleCard';
import { History, Loader2, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TimelineSection() {
  const { data = [], loading, sort, setSort } = useTimeline();
  const [activeFilter, setActiveFilter] = useState('ALL');

  const stats = useMemo(() => {
    const all = data.flatMap((g) => g.capsules || []);
    const count = (key: string) =>
      all.filter((c) => c.status?.toUpperCase() === key).length;

    return {
      total: all.length,
      pending: count('PENDING'),
      locked: count('LOCKED'),
      available: count('AVAILABLE'),
      opened: count('OPENED'),
    };
  }, [data]);

  const filteredData = useMemo(() => {
    if (activeFilter === 'ALL') return data;
    return data
      .map((group) => ({
        ...group,
        capsules:
          group.capsules?.filter(
            (c: any) => c.status?.toUpperCase() === activeFilter
          ) || [],
      }))
      .filter((group) => group.capsules.length > 0);
  }, [data, activeFilter]);

  if (loading) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <Loader2 size={30} className="animate-spin text-brand-lavender-400" />
      </div>
    );
  }

  const titleMap: Record<string, string> = {
    ALL: '전체 보관함',
    PENDING: '고이 담는 중',
    LOCKED: '잠긴 추억들',
    AVAILABLE: '열 수 있는 순간',
    OPENED: '열어본 기억들',
  };

  return (
    <div className="flex flex-col h-full bg-white">
      
      {/* ── HEADER ── */}
      <section className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-brand-lavender-100">
        <div className="px-6 pt-6 pb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-lavender-400">
              Goidama Archive
            </p>
            <h2 className="mt-1 text-[24px] font-bold tracking-tight text-brand-text">
              {titleMap[activeFilter]}
            </h2>
          </div>

          {/* 정렬 셀렉트 박스 스타일 개선 */}
          <div className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-brand-surface border border-brand-lavender-100 shadow-sm">
            <ArrowUpDown size={12} className="text-brand-lavender-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="bg-transparent outline-none text-[12px] font-bold text-brand-lavender-600 cursor-pointer"
            >
              <option value="latest">최신순</option>
              <option value="dday">D-Day순</option>
            </select>
          </div>
        </div>

        {/* FILTERS (Chips) */}
        <div className="px-6 pb-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 w-max">
            <FilterChip
              label="ALL"
              fullLabel="전체"
              count={stats.total}
              active={activeFilter === 'ALL'}
              onClick={() => setActiveFilter('ALL')}
            />
            <FilterChip
              label="READY"
              fullLabel="열기 가능"
              count={stats.available}
              active={activeFilter === 'AVAILABLE'}
              onClick={() => setActiveFilter('AVAILABLE')}
            />
            <FilterChip
              label="LOCKED"
              fullLabel="기다림"
              count={stats.locked}
              active={activeFilter === 'LOCKED'}
              onClick={() => setActiveFilter('LOCKED')}
            />
            <FilterChip
              label="OPENED"
              fullLabel="열어봄"
              count={stats.opened}
              active={activeFilter === 'OPENED'}
              onClick={() => setActiveFilter('OPENED')}
            />
          </div>
        </div>
      </section>

      {/* ── BODY ── */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-6 pt-6 pb-32">
        <AnimatePresence mode="popLayout">
          {filteredData.length > 0 ? (
            filteredData.map((group) => (
              <motion.section key={group.month} layout className="mb-10">
                
                {/* MONTH (월 구분선) */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-lavender-400" />
                  <span className="text-[14px] font-bold text-brand-text tracking-tight">
                    {group.month.replace('-', '. ')}
                  </span>
                  <div className="flex-1 h-[1px] bg-brand-lavender-100" />
                </div>

                {/* CARDS */}
                <div className="space-y-4">
                  {group.capsules.map((cap: any) => (
                    <motion.div
                      key={cap.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CapsuleCard capsule={cap} />
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            ))
          ) : (
            /* Empty State */
            <div className="min-h-[40vh] flex flex-col items-center justify-center text-center px-10">
              <div className="w-16 h-16 rounded-[24px] bg-brand-surface border border-brand-lavender-100 flex items-center justify-center mb-5">
                <History size={24} className="text-brand-lavender-100" />
              </div>
              <p className="text-[16px] font-bold text-brand-text tracking-tight">
                아직 비어있는 시간입니다
              </p>
              <p className="mt-1 text-[13px] font-medium text-brand-subtext leading-relaxed">
                선택하신 필터에 해당하는<br />타임캡슐이 아직 없네요.
              </p>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ── FILTER CHIP 컴포넌트 (디자인 수정) ── */
function FilterChip({ label, fullLabel, count, active, onClick }: any) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`h-11 px-4 rounded-2xl border flex items-center gap-3 transition-all
        ${
          active
            ? 'bg-brand-lavender-600 text-white border-transparent shadow-md shadow-brand-lavender-600/20'
            : 'bg-white text-brand-subtext border-brand-lavender-100'
        }`}
    >
      <div className="flex flex-col items-start">
        <span
          className={`text-[8px] font-bold tracking-widest uppercase leading-none mb-1 ${
            active ? 'text-brand-lavender-100' : 'text-brand-light'
          }`}
        >
          {label}
        </span>
        <span className="text-[13px] font-bold whitespace-nowrap leading-none">
          {fullLabel}
        </span>
      </div>

      <span
        className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
          active ? 'bg-white/20 text-white' : 'bg-brand-lavender-50 text-brand-lavender-400'
        }`}
      >
        {count}
      </span>
    </motion.button>
  );
}