'use client';

import { UserRound, CheckCircle2, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ParticipantBoard({ participants = [] }: { participants: any[] }) {
  // 💡 수정: 봉인 전 '준비 완료' 기준은 status가 ACCEPTED이거나 role이 OWNER인 경우입니다.
  const readyCount = participants.filter(p => 
    (p.status?.toUpperCase() === 'ACCEPTED') || (p.role?.toUpperCase() === 'OWNER')
  ).length;
  
  const totalCount = participants.length || 1;
  const progressPercent = (readyCount / totalCount) * 100;

  return (
    <div className="w-full p-6 rounded-[32px] bg-white border border-brand-lavender-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-5">
      
      {/* ── 헤더: 타이틀 및 진행 상태 ── */}
      <div className="space-y-3">
        <div className="flex justify-between items-end px-1">
          <div className="flex items-center gap-2 text-brand-text">
            <Users size={14} className="text-brand-lavender-400" />
            <h4 className="text-[11px] font-[900] uppercase tracking-[0.2em]">Member Status</h4>
          </div>
          <p className="text-[13px] font-[900] text-brand-lavender-600">
            {readyCount}<span className="text-gray-300 mx-1">/</span>{totalCount}
          </p>
        </div>

        {/* 진행 바 */}
        <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-brand-lavender-600 rounded-full"
          />
        </div>
      </div>
      
      {/* ── 멤버 그리드: 4열 배열 ── */}
      <div className="grid grid-cols-4 gap-y-5 gap-x-3">
        {participants.map((p, idx) => {
          // 💡 개별 멤버의 준비 여부 판단
          const isReady = (p.status?.toUpperCase() === 'ACCEPTED') || (p.role?.toUpperCase() === 'OWNER');
          
          return (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div className={`relative w-14 h-14 rounded-[22px] border-2 flex items-center justify-center transition-all duration-500 ${
                isReady 
                  ? 'border-brand-lavender-200 bg-brand-lavender-50 shadow-sm' 
                  : 'border-gray-50 bg-gray-50/50'
              }`}>
                
                {/* 프로필 이미지 영역 */}
                <div className="w-full h-full p-0.5 overflow-hidden rounded-[20px]">
                  {p.profile_image_url ? (
                    <img 
                      src={p.profile_image_url} 
                      className={`w-full h-full object-cover rounded-[18px] transition-all duration-500 ${
                        !isReady && 'grayscale opacity-30 blur-[0.4px]'
                      }`} 
                      alt={p.nickname}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      <UserRound size={24} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                
                {/* 도착 완료 배지 (애니메이션) */}
                {isReady && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md"
                  >
                    <CheckCircle2 size={18} className="text-brand-lavender-600 fill-white" />
                  </motion.div>
                )}
              </div>

              {/* 닉네임 */}
              <span className={`text-[11px] font-bold truncate w-full text-center tracking-tight transition-colors ${
                isReady ? 'text-brand-text' : 'text-gray-300'
              }`}>
                {p.nickname}
              </span>
            </div>
          );
        })}
      </div>

      <div className="pt-1 flex justify-center">
        <p className="text-[10px] text-gray-300 font-medium italic">
          모든 인연이 모여야 추억이 고이 열립니다
        </p>
      </div>
    </div>
  );
}