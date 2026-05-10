'use client';

import { useAuthStore } from '@/store/authStore';
import { useCheckIn } from '@/hooks/useCheckIn';
import ParticipantBoard from '../ParticipantBoard';
import { 
  MapPin, CheckCircle2, Loader2, Sparkles, Navigation, 
  Map, Lock, Users, MapPinned 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AvailableState({ capsule, refresh }: any) {
  const { user } = useAuthStore();
  const { handleCheckIn, loading } = useCheckIn(capsule, refresh);

  // ── 🔒 권한 체크 로직 ──
  const myParticipant = capsule.participants.find(
    (p: any) => p.nickname === user?.nickname || p.id === user?.id
  );
  const isMeParticipant = !!myParticipant;
  const isMeCheckedIn = myParticipant?.is_checked_in || false;

  const checkedInCount = capsule.participants.filter((p: any) => p.is_checked_in).length;
  const totalCount = capsule.participants.length;

  return (
    <div className="min-h-[80vh] bg-white px-6 pb-20 relative">
      
      {/* ── 1. 상단 비주얼 영역 (LockedState와 동일한 틀) ── */}
      <section className="pt-12 pb-10 flex flex-col items-center relative">
        <div className="absolute top-10 w-32 h-32 bg-brand-lavender-100/40 blur-[50px] -z-10 rounded-full" />
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6"
        >
          {/* 캡슐 아이콘 박스 */}
          <div className="w-28 h-28 bg-white rounded-[32px] border border-brand-lavender-100 shadow-card flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-brand-surface opacity-50" />
            <img
              src={`/images/skins/skin-${capsule.skin_id || 1}-locked.png`}
              alt="capsule"
              className="w-16 h-16 object-contain relative z-10 drop-shadow-sm animate-pulse"
            />
          </div>
          
          {/* 상태 배지: 개봉 가능 상태의 보라색 포인트 */}
          <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-xl bg-brand-lavender-600 flex items-center justify-center text-white border-[3px] border-white shadow-sm">
            <Sparkles size={16} fill="currentColor" />
          </div>
        </motion.div>

        <div className="text-center space-y-1">
          <h1 className="text-[22px] font-bold text-brand-text tracking-tighter">
            {isMeParticipant ? "도착 인증이 필요해요" : "인연들이 모이고 있어요"}
          </h1>
          <p className="text-[12px] text-brand-lavender-400 font-bold uppercase tracking-widest">
            Ready to Open
          </p>
        </div>
      </section>

      {/* ── 2. 정보 바 (도착 현황 | 위치) ── */}
      <section className="max-w-md mx-auto mb-8">
        <div className="bg-brand-surface border border-brand-lavender-100 rounded-2xl py-5 px-2 flex items-center shadow-sm">
          {/* 도착 현황 */}
          <div className="flex-1 flex flex-col items-center border-r border-brand-lavender-100/50">
            <div className="flex items-center gap-1.5 mb-1.5 text-brand-light">
              <Users size={13} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Status</span>
            </div>
            <p className="text-[14px] font-bold text-brand-text">
              {checkedInCount} <span className="text-brand-lavender-300">/</span> {totalCount} 도착
            </p>
          </div>

          {/* 위치 */}
          <div className="flex-1 flex flex-col items-center px-2">
            <div className="flex items-center gap-1.5 mb-1.5 text-brand-light">
              <MapPin size={13} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Location</span>
            </div>
            <p className="text-[14px] font-bold text-brand-text truncate w-full text-center px-2">
              {capsule.address?.split(' ').slice(0, 2).join(' ') || '장소 정보 없음'}
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. 메인 액션 카드 (참여자 여부에 따른 분기) ── */}
      <section className="max-w-md mx-auto space-y-6">
        
        {/* 멤버 보드 (투명감 있게 유지) */}
        <div className="bg-white rounded-[28px] border border-brand-lavender-100 shadow-sm overflow-hidden">
          <ParticipantBoard participants={capsule.participants} />
        </div>

        {/* ── 액션 영역 ── */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          {isMeParticipant ? (
            /* A. 참여자인 경우 */
            isMeCheckedIn ? (
              <div className="bg-brand-surface rounded-[28px] p-8 text-center border border-brand-lavender-100">
                <div className="w-12 h-12 rounded-2xl bg-white border border-brand-lavender-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={24} className="text-brand-lavender-600" />
                </div>
                <h2 className="text-[18px] font-bold text-brand-text mb-2">도착 인증을 마쳤습니다</h2>
                <p className="text-[13px] text-brand-subtext font-medium">
                  모든 인연이 도착하면 추억이 고이 열립니다.
                </p>
              </div>
            ) : (
              <button 
                onClick={handleCheckIn}
                disabled={loading}
                className="w-full h-18 bg-brand-lavender-600 text-white rounded-[28px] font-bold text-[17px] flex flex-col items-center justify-center gap-1 shadow-lg shadow-brand-lavender-600/20 active:scale-[0.97] transition-all disabled:opacity-50 py-4"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    <div className="flex items-center gap-2">
                      <MapPinned size={20} />
                      <span>현장 도착 인증하기</span>
                    </div>
                    <span className="text-[11px] font-medium opacity-70">약속 장소 근처에서 눌러주세요</span>
                  </>
                )}
              </button>
            )
          ) : (
            /* B. 참여자가 아닌 경우 (LockedState의 메인 카드 스타일 계승) */
            <div className="bg-brand-surface rounded-[32px] p-8 text-center border border-dashed border-brand-lavender-200">
              <div className="w-12 h-12 rounded-2xl bg-white border border-brand-lavender-100 flex items-center justify-center mx-auto mb-4">
                <Lock size={22} className="text-brand-lavender-300" />
              </div>
              <h2 className="text-[17px] font-bold text-brand-text mb-2">참여자 전용 캡슐입니다</h2>
              <p className="text-[12px] text-brand-subtext leading-relaxed font-medium">
                초대된 인연들만 인증하고 열어볼 수 있습니다.<br/>
                참여자들이 모두 모이기를 기다려주세요.
              </p>
            </div>
          )}
        </motion.div>

        {/* ── 하단 보안 배지 ── */}
        <div className="flex items-center justify-center gap-2 pt-4">
           <div className="w-1 h-1 bg-brand-lavender-200 rounded-full" />
           <p className="text-[10px] text-brand-light font-bold uppercase tracking-[0.3em]">
             Goidama Security Verify
           </p>
           <div className="w-1 h-1 bg-brand-lavender-200 rounded-full" />
        </div>
      </section>
    </div>
  );
}