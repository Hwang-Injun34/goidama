'use client';

import { useMemo } from 'react';
import { useCapsuleStore } from '@/store/capsuleStore';
import { useCapsuleCreate } from '@/hooks/useCapsuleCreate';
import Button from '@/components/ui/Button';
import { Palette, Sparkles, Check, Crown } from 'lucide-react';
import { AVAILABLE_SKIN_IDS, EASTER_EGG_SKIN_IDS } from '@/constants/skins';
import { motion } from 'framer-motion';

interface Props { onNext: () => void; }

export default function Step4SkinSelect({ onNext }: Props) {
  const { tempData, setTempData } = useCapsuleStore();
  const { createBase, loading, capsuleId: existingId } = useCapsuleCreate();

  const isEventDay = useMemo(() => {
    const now = new Date();
    return now.getMonth() === 9 && now.getDate() === 30;
  }, []);

  const displaySkins = useMemo(() => {
    const list = [...AVAILABLE_SKIN_IDS];
    if (isEventDay) list.push(...EASTER_EGG_SKIN_IDS);
    return list;
  }, [isEventDay]);

  const handleNextStep = async () => {
    if (existingId || useCapsuleStore.getState().capsuleId) {
      onNext();
      return;
    }
    const newId = await createBase(tempData);
    if (newId) onNext();
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-6 duration-500">
      {/* ── 상단 텍스트 영역 (더 컴팩트하게 수정) ── */}
      <div className="mb-5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 mb-2">
          <Palette size={12} strokeWidth={3} />
          <span className="text-[9px] font-black uppercase tracking-wider">Skin Select</span>
        </div>
        <h2 className="text-[26px] font-[900] leading-tight tracking-tight text-[#111B27]">
          캡슐의 모습 골라보기
        </h2>
        <p className="mt-1 text-gray-400 text-[12px] font-medium">
          당신의 추억을 상징할 디자인을 선택하세요.
        </p>
      </div>

      {/* ── 스킨 그리드 영역 (2x2가 보이도록 패딩/간격 최적화) ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
        <div className="grid grid-cols-2 gap-3">
          {displaySkins.map((id) => {
            const isSelected = tempData.skinId === id;
            const isEasterEgg = id === 1030;

            return (
              <motion.button 
                key={id}
                whileTap={{ scale: 0.96 }}
                onClick={() => setTempData({ skinId: id })}
                // 패딩을 p-6에서 p-4로 줄여 높이를 확보
                className={`relative group p-4 rounded-[28px] border-2 transition-all duration-300 flex flex-col items-center gap-3 ${
                  isSelected 
                    ? 'border-[#6C63FF] bg-white shadow-[0_15px_30px_rgba(108,99,255,0.12)] z-10' 
                    : 'border-gray-50 bg-white hover:border-gray-100 shadow-sm'
                }`}
              >
                {/* 선택 상태 아이콘 (크기 살짝 축소) */}
                <div className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isSelected ? 'bg-[#6C63FF] scale-100' : 'bg-gray-100 scale-75 opacity-0'
                }`}>
                  <Check size={12} className="text-white" strokeWidth={4} />
                </div>

                {/* 스페셜 라벨 (크기 축소) */}
                {isEasterEgg && (
                  <div className="absolute top-3 left-3 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-400 shadow-sm">
                    <Crown size={8} className="text-white" fill="currentColor" />
                    <span className="text-[7px] font-black text-white uppercase tracking-tighter">Special</span>
                  </div>
                )}

                {/* 스킨 이미지 (크기 최적화: w-24 -> w-20) */}
                <div className="w-20 h-20 flex items-center justify-center relative mt-2">
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#6C63FF]/10 blur-xl rounded-full animate-pulse" />
                  )}
                  <img 
                    src={`/images/skins/skin-${id}-locked.png`} 
                    className={`w-full h-full object-contain relative z-10 transition-transform duration-500 ${
                      isSelected ? 'scale-110 rotate-2' : 'opacity-70 group-hover:opacity-100'
                    }`} 
                    alt={`스킨 ${id}`} 
                  />
                </div>

                <div className="text-center pb-1">
                  <p className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${
                    isSelected ? 'text-[#6C63FF]' : 'text-gray-300'
                  }`}>
                    SKIN-{String(id).padStart(2, '0')}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── 하단 버튼 영역 (컴팩트하게 유지) ── */}
      <div className="relative pt-4 pb-2">
        {isEventDay && (
          <div className="mb-3 p-3 bg-indigo-50/80 backdrop-blur-sm rounded-[20px] border border-indigo-100 flex items-center gap-2">
            <Sparkles size={14} className="text-indigo-500 shrink-0" />
            <p className="text-[10px] font-bold text-indigo-700 leading-tight">
              오늘 한정 <span className="underline decoration-indigo-300">스페셜 스킨</span> 사용 가능!
            </p>
          </div>
        )}

        <Button 
          onClick={handleNextStep} 
          isLoading={loading}
          className="w-full py-4.5 rounded-[22px] bg-[#1E233D] text-white font-[900] text-lg shadow-[0_12px_24px_rgba(30,35,61,0.15)] active:scale-[0.97]"
        >
          선택 완료
        </Button>
        
        <p className="mt-3 text-[9px] text-center font-black text-gray-300 uppercase tracking-[0.3em]">
          Step 4 / 6
        </p>
      </div>
    </div>
  );
}