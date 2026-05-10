'use client';

import { useGps } from '@/hooks/useGps';
import { useCapsuleCreate } from '@/hooks/useCapsuleCreate';
import { useCapsuleStore } from '@/store/capsuleStore';
import { Lock, MapPin, Send, CheckCircle2, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';

export default function Step6GpsSeal() {
  const { location, fetchLocation, loading: gpsLoading } = useGps();
  const { finishCreation, loading, capsuleId } = useCapsuleCreate();
  const { tempData } = useCapsuleStore();

  const isGroup = tempData.isGroup;

  const handleFinish = async () => {
    if (!capsuleId) {
      alert("캡슐 정보가 유실되었습니다. 처음부터 다시 시도해주세요.");
      return;
    }
    if (!isGroup && !location) {
      alert("개인 캡슐은 현재 위치 확인이 필요합니다.");
      return;
    }
    await finishCreation(location?.lat, location?.lng);
  };

  return (
    <div className="flex flex-col h-full items-center text-center px-4 py-10 animate-in zoom-in-95 duration-500">
      
      {/* ── 1. 상단 뱃지 ── */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 mb-8"
      >
        <Sparkles size={12} strokeWidth={3} />
        <span className="text-[10px] font-black uppercase tracking-widest">Final Process</span>
      </motion.div>

      {/* ── 2. 메인 비주얼 (중앙 아이콘) ── */}
      <div className="relative mb-10">
        {/* 장식용 배경 원 */}
        <div className={`absolute inset-0 blur-3xl opacity-20 transition-colors duration-700 ${
          (isGroup || location) ? 'bg-indigo-600' : 'bg-gray-400'
        }`} />
        
        <motion.div 
          animate={location || isGroup ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 3 }}
          className={`relative w-28 h-28 rounded-[40px] flex items-center justify-center border-2 transition-all duration-500 shadow-2xl ${
            (isGroup || location) 
              ? 'bg-[#6C63FF] text-white border-indigo-400 shadow-indigo-200' 
              : 'bg-white text-gray-300 border-gray-100 shadow-gray-100'
          }`}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={40} />
          ) : isGroup ? (
            <Send size={44} className="ml-1" />
          ) : location ? (
            <ShieldCheck size={44} />
          ) : (
            <Lock size={44} />
          )}
        </motion.div>
      </div>
      
      {/* ── 3. 가이드 텍스트 ── */}
      <div className="space-y-4 mb-12">
        <h2 className="text-[28px] font-[900] text-[#111B27] tracking-tight leading-tight">
          {isGroup ? '이제 초대장을\n보내볼까요?' : '추억을 이 장소에\n봉인할까요?'}
        </h2>
        <p className="text-gray-400 text-[14px] font-medium leading-relaxed px-6 whitespace-pre-wrap">
          {isGroup 
            ? '친구들이 초대를 수락하면 이 장소에서\n함께 캡슐을 단단히 잠글 수 있습니다.'
            : '나중에 이곳으로 돌아와야만 열 수 있도록\n현재 위치를 캡슐의 매립지로 지정합니다.'}
        </p>
      </div>
      
      {/* ── 4. 위치 상태 카드 (개인 캡슐 전용) ── */}
      {!isGroup && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full p-6 rounded-[32px] border-2 transition-all flex items-center gap-4 text-left ${
            location 
              ? 'bg-indigo-50/50 border-indigo-100 shadow-sm' 
              : 'bg-white border-gray-50'
          }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
            location ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-gray-100 text-gray-300'
          }`}>
            {location ? <CheckCircle2 size={22} /> : <MapPin size={22} />}
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">GPS Verification</p>
            <p className={`font-black text-[15px] ${location ? 'text-indigo-600' : 'text-gray-300'}`}>
              {location ? '위치 인증 완료' : '위치 확인이 필요해요'}
            </p>
          </div>
          {!location && (
            <button 
              onClick={fetchLocation} 
              disabled={gpsLoading}
              className="px-5 py-2.5 bg-[#1E233D] text-white rounded-xl text-[11px] font-black uppercase active:scale-95 transition-all shadow-md shadow-gray-200"
            >
              {gpsLoading ? '...' : 'Verify'}
            </button>
          )}
        </motion.div>
      )}

      {/* ── 5. 하단 최종 버튼 ── */}
      <div className="mt-auto w-full pt-10">
        <Button 
          onClick={handleFinish} 
          disabled={(!isGroup && !location) || loading} 
          isLoading={loading} 
          className={`w-full py-5 rounded-[24px] font-[900] text-lg transition-all shadow-xl ${
            (!isGroup && !location)
              ? 'bg-gray-100 text-gray-300'
              : 'bg-[#1E233D] text-white shadow-indigo-100/50 active:scale-[0.97]'
          }`}
        >
          {isGroup ? '초대장 보내기' : '캡슐 단단히 잠그기'}
        </Button>
        
        <div className="mt-6 flex flex-col items-center gap-2 opacity-10">
          <div className="flex gap-1.5">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className={`w-1 h-1 rounded-full ${i === 6 ? 'bg-indigo-600' : 'bg-gray-400'}`} />
            ))}
          </div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em]">
            Memory Sealed Forever
          </p>
        </div>
      </div>
    </div>
  );
}