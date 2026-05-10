'use client';
import { ChevronLeft, X } from 'lucide-react';

interface Props {
  step: number;
  onBack: () => void;
  onCancel: () => void; 
}

export default function CreateHeader({ step, onBack, onCancel }: Props) {
  return (
    <header className="px-5 h-[64px] flex items-center justify-between border-b border-brand-lavender-100 shrink-0 bg-white/80 backdrop-blur-xl sticky top-0 z-50 pt-safe">
      
      {/* ── LEFT: 뒤로가기 ── */}
      <div className="w-10">
        <button 
          onClick={onBack} 
          className="p-2 -ml-2 text-brand-text active:bg-brand-lavender-50 rounded-full transition-all"
          aria-label="뒤로 가기"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── CENTER: 프로그레스 바 (진행도) ── */}
      <div className="flex-1 px-4 flex flex-col items-center gap-1.5">
        {/* 진행 퍼센트 혹은 단계 표시 (선택 사항) */}
        <span className="text-[10px] font-bold text-brand-lavender-600 uppercase tracking-widest">
          Step {step} of 6
        </span>
        
        <div className="w-full h-1.5 bg-brand-lavender-50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-lavender-600 transition-all duration-500 ease-out shadow-[0_0_8px_rgba(139,127,212,0.3)]" 
            style={{ width: `${(step / 6) * 100}%` }} 
          />
        </div>
      </div>

      {/* ── RIGHT: 취소 (나가기) ── */}
      <div className="w-10 flex justify-end">
        <button
          onClick={onCancel}
          className="p-2 -mr-2 text-brand-light hover:text-brand-text active:bg-brand-lavender-50 rounded-full transition-all"
          aria-label="생성 취소"
        >
          <X size={22} strokeWidth={2} />
        </button>
      </div>

    </header>
  );
}