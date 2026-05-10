'use client';

import { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useGps } from '@/hooks/useGps';
import { capsuleService } from '@/services/capsule.service';
import { useUIStore } from '@/store/uiStore';
import { useRouter } from 'next/navigation';
import ParticipantBoard from '../ParticipantBoard';
import { 
  Lock, MailOpen, MapPin, CheckCircle2, Loader2, 
  Sparkles, Clock, Navigation2, ShieldCheck, Users,
  ClipboardCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function PendingState({ capsule, isOwner, refresh }: any) {
  const { user } = useAuthStore();
  const { location, fetchLocation, loading: gpsLoading } = useGps();
  const { setActiveTab } = useUIStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // ── 수락 인원 계산 로직 ──
  const { acceptedCount, totalCount, isAllAccepted } = useMemo(() => {
    const participants = capsule.participants || [];
    const accepted = participants.filter((p: any) => {
      const s = (p.status || "").toUpperCase();
      const role = (p.role || "").toUpperCase();
      return s === 'ACCEPTED' || role === 'OWNER';
    });

    return {
      acceptedCount: accepted.length,
      totalCount: participants.length,
      isAllAccepted: accepted.length === participants.length && participants.length > 0
    };
  }, [capsule.participants]);

  const myParticipant = capsule.participants.find(
    (p: any) => p.nickname === user?.nickname || p.id === user?.id
  );
  const isAccepted = isOwner || myParticipant?.status?.toUpperCase() === 'ACCEPTED';

  // ── 🔒 수락 처리 ──
  const handleAcceptInvite = async () => {
    if (!myParticipant) return;
    setLoading(true);
    try {
      await capsuleService.respondInvitation(myParticipant.participant_id, true);
      refresh();
    } catch (err) {
      alert("수락 처리에 실패했습니다.");
    } finally { setLoading(false); }
  };


  // ── 💎 최종 봉인 처리 ──
  const handleFinalLock = async () => {
    if (!location) return;
    setLoading(true);
    try {
      await capsuleService.lock(capsule.id, location.lat, location.lng);
      setActiveTab('map'); 
      router.replace('/home');
    } catch (err: any) {
      alert(err.response?.data?.detail || "봉인 실패");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] bg-white px-6 pb-20 relative">
      
      {/* ── 1. 상단 비주얼 영역 (디자인 시스템 틀) ── */}
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
              className="w-32 h-32 object-contain relative z-10 opacity-60 grayscale-[0.3]"
            />
          </div>
          
          {/* 상태 배지: 준비 중인 노란색 포인트 */}
          <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white border-[3px] border-white shadow-sm">
            <Clock size={16} strokeWidth={3} />
          </div>
        </motion.div>

        <div className="text-center space-y-1">
          <h1 className="text-[22px] font-bold text-brand-text tracking-tighter">
            {isOwner ? "추억을 담을 준비 중" : "새로운 초대장이 도착했어요"}
          </h1>
          <p className="text-[12px] text-brand-lavender-400 font-bold uppercase tracking-widest">
            Pending Memories
          </p>
        </div>
      </section>

      {/* ── 2. 정보 바 (수락 현황 | 그룹 정보) ── */}
      <section className="max-w-md mx-auto mb-8">
        <div className="bg-brand-surface border border-brand-lavender-100 rounded-2xl py-5 px-2 flex items-center shadow-sm">
          {/* 수락 현황 */}
          <div className="flex-1 flex flex-col items-center border-r border-brand-lavender-100/50">
            <div className="flex items-center gap-1.5 mb-1.5 text-brand-light">
              <ClipboardCheck size={13} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Acceptance</span>
            </div>
            <p className="text-[14px] font-bold text-brand-text">
              {acceptedCount} <span className="text-brand-lavender-300">/</span> {totalCount} 명
            </p>
          </div>

          {/* 인연 정보 */}
          <div className="flex-1 flex flex-col items-center px-2">
            <div className="flex items-center gap-1.5 mb-1.5 text-brand-light">
              <Users size={13} />
              <span className="text-[10px] font-bold uppercase tracking-wider">With</span>
            </div>
            <p className="text-[14px] font-bold text-brand-text truncate w-full text-center px-2">
              {totalCount > 1 ? `${totalCount - 1}명의 인연과` : '나만의 기록'}
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. 메인 액션 영역 ── */}
      <section className="max-w-md mx-auto space-y-6">
        
        {/* 참여자 보드 */}
        <div className="bg-white rounded-[28px] border border-brand-lavender-100 shadow-sm overflow-hidden">
          <ParticipantBoard participants={capsule.participants} />
        </div>

        {/* ── 권한 및 상태에 따른 액션 카드 ── */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          {isOwner ? (
            /* A. 내가 방장일 때 */
            isAllAccepted ? (
              <div className="space-y-4">
                <div className="bg-brand-surface rounded-[28px] p-6 border border-brand-lavender-100 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-brand-lavender-100 flex items-center justify-center mx-auto mb-4">
                    <MapPin size={24} className={location ? "text-brand-lavender-600" : "text-brand-lavender-200"} />
                  </div>
                  <h2 className="text-[18px] font-bold text-brand-text mb-2">모든 인연이 모였습니다</h2>
                  <p className="text-[13px] text-brand-subtext font-medium mb-5">
                    {location ? "이제 이 장소에 추억을 고이 봉인합니다" : "캡슐을 묻을 장소를 인증해 주세요"}
                  </p>
                  {!location && (
                    <button 
                      onClick={fetchLocation} 
                      className={`w-full h-14 rounded-2xl font-bold text-[14px] transition-all flex items-center justify-center gap-2 ${gpsLoading ? 'bg-brand-lavender-50 text-brand-lavender-300' : 'bg-white border border-brand-lavender-200 text-brand-lavender-600 active:scale-95 shadow-sm'}`}
                    >
                      {gpsLoading ? <Loader2 className="animate-spin" size={18} /> : <><Navigation2 size={18} /> 현재 위치 인증하기</>}
                    </button>
                  )}
                </div>
                <button 
                  onClick={handleFinalLock} 
                  disabled={!location || loading}
                  className="w-full h-16 bg-brand-lavender-600 text-white rounded-[28px] font-bold text-[17px] shadow-lg shadow-brand-lavender-600/20 active:scale-[0.97] disabled:opacity-30 transition-all flex items-center justify-center gap-3"
                >
                  <Lock size={20} strokeWidth={2.5} /> 추억 고이 봉인하기
                </button>
              </div>
            ) : (
              <div className="bg-brand-surface rounded-[32px] p-10 text-center border border-dashed border-brand-lavender-200">
                <Clock className="text-brand-lavender-200 animate-pulse mx-auto mb-4" size={36} />
                <h2 className="text-[18px] font-bold text-brand-text mb-1">인연들의 응답을 기다리는 중</h2>
                <p className="text-[12px] text-brand-subtext leading-relaxed font-medium">
                  초대받은 모든 분이 수락 버튼을 누르면<br/>
                  추억을 단단히 잠글 수 있습니다.
                </p>
              </div>
            )
          ) : (
            /* B. 내가 초대받은 사람일 때 */
            !isAccepted ? (
              <div className="bg-brand-lavender-600 rounded-[32px] p-8 text-center text-white shadow-xl shadow-brand-lavender-600/20 relative overflow-hidden">
                <Sparkles className="absolute top-4 right-4 text-white/20" size={24} />
                <MailOpen size={56} strokeWidth={1.5} className="mx-auto mb-5 text-white/90" />
                <h2 className="text-[20px] font-bold mb-2">함께 추억을 남길까요?</h2>
                <p className="text-[13px] text-white/70 mb-8 leading-relaxed">
                  초대를 수락하시면 함께 참여하여<br/>당신의 소중한 이야기를 담을 수 있습니다.
                </p>
                <button onClick={handleAcceptInvite} disabled={loading} className="w-full h-14 bg-white text-brand-lavender-600 rounded-2xl font-bold text-[16px] active:scale-[0.97] transition-all flex items-center justify-center">
                  {loading ? <Loader2 className="animate-spin" /> : "기꺼이 참여할게요"}
                </button>
              </div>
            ) : (
              <div className="bg-brand-surface rounded-[28px] p-10 text-center border border-brand-lavender-100">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-brand-lavender-600 mx-auto mb-5 shadow-inner border border-brand-lavender-100">
                  <CheckCircle2 size={32} strokeWidth={1.5} />
                </div>
                <h2 className="text-[18px] font-bold text-brand-text mb-1">초대 수락 완료</h2>
                <p className="text-[12px] text-brand-subtext font-medium uppercase tracking-[0.2em]">Ready for sealing ✦</p>
              </div>
            )
          )}
        </motion.div>

        {/* ── 하단 보안 배지 ── */}
        <div className="flex items-center justify-center gap-2 pt-4 opacity-20">
           <ShieldCheck size={18} className="text-brand-lavender-400" />
           <p className="text-[10px] text-brand-text font-bold uppercase tracking-[0.3em]">
             Goidama Secure Archive
           </p>
        </div>
      </section>
    </div>
  );
}