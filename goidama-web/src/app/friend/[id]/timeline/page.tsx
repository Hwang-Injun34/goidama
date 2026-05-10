'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { friendService } from '@/services/friend.service';
import CapsuleCard from '@/components/features/capsule/shared/CapsuleCard';
import { ChevronLeft, Sparkles, History, Lock, Loader2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  params: Promise<{ id: string }>;
}

export default function FriendTimelinePage({ params }: Props) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriendTimeline = async () => {
      try {
        const res = await friendService.getFriendTimeline(id);
        const normalizedData = Array.isArray(res) 
          ? { groups: res, friend_nickname: '친구' } 
          : res;
        setData(normalizedData);
      } catch (err: any) {
        setData({ groups: [], friend_nickname: '친구' });
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchFriendTimeline();
  }, [id]);

  /* ──────────────── 1. 프리미엄 로딩 ──────────────── */
  if (loading) return (
    <div className="h-screen bg-white flex flex-col items-center justify-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-brand-lavender-100 blur-2xl rounded-full scale-150 animate-pulse" />
        <Loader2 className="animate-spin text-brand-lavender-400 relative z-10" size={40} strokeWidth={1.5} />
      </div>
      <p className="text-[11px] font-[900] text-gray-300 uppercase tracking-[0.4em]">Searching Stream</p>
    </div>
  );

  const timelineGroups = data?.groups || [];

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col">
      {/* ── 상단 유리질감 헤더 ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 h-[72px] flex items-center px-4 pt-safe">
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-gray-100 text-brand-text active:scale-90 transition-all"
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>
        
        <div className="ml-3 flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="text-[18px] font-[900] text-brand-text truncate tracking-tight">
              {data?.friend_nickname}님의 보관함
            </h2>
            <Sparkles size={14} className="text-[#FFD86B]" fill="currentColor" />
          </div>
          <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest leading-none mt-1">
            Public Memory Stream
          </p>
        </div>
      </header>

      {/* ── 타임라인 본문 ── */}
      <main className="flex-1 relative px-6 py-10 pb-32">
        {timelineGroups.length > 0 ? (
          <div className="relative space-y-14">
            
            {/* 세로 타임라인 디자인 라인 */}
            <div className="absolute left-[23px] top-4 bottom-0 w-0.5 bg-gradient-to-b from-brand-lavender-100 via-gray-100 to-transparent z-0" />

            {timelineGroups.map((group: any, gIdx: number) => (
              <div key={group.month} className="relative z-10">
                {/* 월별 헤더 유닛 */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-white rounded-[18px] flex items-center justify-center shadow-md border-4 border-[#F6F7FB] text-brand-lavender-600 shrink-0">
                    <Calendar size={22} strokeWidth={2.5} />
                  </div>
                  <div className="bg-white px-4 py-1.5 rounded-full border border-gray-100 shadow-sm">
                    <h3 className="text-[15px] font-[900] text-brand-text tracking-tight">
                      {group.month.split('-')[0]}년 {parseInt(group.month.split('-')[1])}월
                    </h3>
                  </div>
                </div>

                {/* 캡슐 카드 리스트 */}
                <div className="pl-11 space-y-5">
                  <AnimatePresence>
                    {group.capsules.map((cap: any, cIdx: number) => (
                      <motion.div 
                        key={cap.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (gIdx * 0.1) + (cIdx * 0.05) }}
                      >
                        <CapsuleCard capsule={cap} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── 데이터가 없을 때 (Empty State) ── */
          <div className="py-24 flex flex-col items-center justify-center px-10 text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center text-gray-100 shadow-sm border border-gray-50 mb-6"
            >
              <Lock size={32} strokeWidth={1.5} />
            </motion.div>
            <h3 className="text-brand-text font-[900] text-lg mb-2 tracking-tight">비공개된 공간이에요</h3>
            <p className="text-[13px] text-gray-400 leading-relaxed font-medium">
              친구님이 [친구에게 공개]로 설정한<br/>타임캡슐이 아직 없습니다.
            </p>
          </div>
        )}
      </main>

      {/* 하단 장식 디테일 */}
      <div className="fixed bottom-10 left-0 right-0 flex justify-center pointer-events-none opacity-5">
        <p className="text-[12px] font-black uppercase tracking-[1em] text-brand-text">Goidama</p>
      </div>
    </div>
  );
}