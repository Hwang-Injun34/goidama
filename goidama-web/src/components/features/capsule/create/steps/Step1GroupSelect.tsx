'use client';

import { User, Users, Globe, Lock, CheckCircle2 } from 'lucide-react';
import { useCapsuleStore } from '@/store/capsuleStore';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';

export default function Step1TypeSelect({ onNext }: { onNext: () => void }) {
  const { tempData, setTempData } = useCapsuleStore();

  return (
    <div className="space-y-12 py-4">
      {/* ── 1. 상단 헤더: 브랜드 톤앤매너 문구 ── */}
      <div className="space-y-3 px-1">
        <h2 className="text-[28px] font-bold leading-[1.3] text-brand-text tracking-tighter">
          어떤 추억을<br />
          <span className="text-brand-lavender-600">고이 담아볼까요?</span>
        </h2>
        <p className="text-brand-subtext text-[15px] font-medium leading-relaxed">
          나중에 혼자 조용히 열어볼지,<br />
          소중한 인연들과 함께 나눌지 골라주세요.
        </p>
      </div>

      <div className="space-y-10">
        {/* ── 2. 캡슐 유형 선택 카드: 브랜드 라벤더 적용 ── */}
        <div className="grid grid-cols-1 gap-4">
          {/* 개인 캡슐 */}
          <button 
            onClick={() => setTempData({ isGroup: false })}
            className={`group relative p-6 rounded-[28px] border-2 transition-all flex items-center gap-5 text-left ${
              !tempData.isGroup 
                ? 'border-brand-lavender-600 bg-brand-lavender-50 shadow-sm' 
                : 'border-brand-lavender-100 bg-white text-brand-light'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
              !tempData.isGroup 
                ? 'bg-brand-lavender-600 text-white shadow-lg shadow-brand-lavender-600/20' 
                : 'bg-brand-surface text-brand-light'
            }`}>
              <User size={26} strokeWidth={2.2} />
            </div>
            <div className="flex-1">
              <p className={`font-bold text-[17px] ${!tempData.isGroup ? 'text-brand-text' : 'text-brand-light'}`}>개인 캡슐</p>
              <p className={`text-[13px] font-medium ${!tempData.isGroup ? 'text-brand-lavender-600/70' : 'text-brand-light'}`}>
                나만의 비밀스러운 기록 보관
              </p>
            </div>
            {!tempData.isGroup && (
              <motion.div layoutId="check" className="absolute right-6 text-brand-lavender-600">
                <CheckCircle2 size={24} fill="white" />
              </motion.div>
            )}
          </button>

          {/* 공동 캡슐 */}
          <button 
            onClick={() => setTempData({ isGroup: true })}
            className={`group relative p-6 rounded-[28px] border-2 transition-all flex items-center gap-5 text-left ${
              tempData.isGroup 
                ? 'border-brand-lavender-600 bg-brand-lavender-50 shadow-sm' 
                : 'border-brand-lavender-100 bg-white text-brand-light'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
              tempData.isGroup 
                ? 'bg-brand-lavender-600 text-white shadow-lg shadow-brand-lavender-600/20' 
                : 'bg-brand-surface text-brand-light'
            }`}>
              <Users size={26} strokeWidth={2.2} />
            </div>
            <div className="flex-1">
              <p className={`font-bold text-[17px] ${tempData.isGroup ? 'text-brand-text' : 'text-brand-light'}`}>공동 캡슐</p>
              <p className={`text-[13px] font-medium ${tempData.isGroup ? 'text-brand-lavender-600/70' : 'text-brand-light'}`}>
                멤버 전원이 모여야 열리는 약속
              </p>
            </div>
            {tempData.isGroup && (
              <motion.div layoutId="check" className="absolute right-6 text-brand-lavender-600">
                <CheckCircle2 size={24} fill="white" />
              </motion.div>
            )}
          </button>
        </div>

        {/* ── 3. 공개 설정 영역: 간결하고 정갈한 디자인 ── */}
        <div className="space-y-4 pt-2">
          <p className="text-[11px] font-bold text-brand-lavender-400 uppercase tracking-[0.2em] ml-2">Visibility Settings</p>
          <div className="flex gap-2 bg-brand-surface p-1.5 rounded-[22px] border border-brand-lavender-100">
            {[
              { id: 'friends', label: '인연 공개', icon: Globe },
              { id: 'private', label: '나만 보기', icon: Lock }
            ].map((v) => (
              <button 
                key={v.id}
                onClick={() => setTempData({ visibility: v.id as 'friends' | 'private' })}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[18px] text-[14px] font-bold transition-all ${
                  tempData.visibility === v.id 
                    ? 'bg-white text-brand-lavender-600 shadow-sm ring-1 ring-brand-lavender-100' 
                    : 'text-brand-light hover:text-brand-subtext'
                }`}
              >
                <v.icon size={16} strokeWidth={2.5} />
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. 하단 액션 버튼: 공통 Button 컴포넌트 활용 ── */}
      <div className="pt-6 pb-10">
        <Button 
          variant="primary"
          onClick={onNext} 
        >
          다음 단계로
        </Button>
      </div>
    </div>
  );
}