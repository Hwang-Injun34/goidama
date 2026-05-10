'use client';

import { useMemo, useEffect } from 'react';
import { useCapsuleStore } from '@/store/capsuleStore';
import Button from '@/components/ui/Button';
import { Calendar, ChevronDown, Type } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props { onNext: () => void; }

export default function Step2TitleDate({ onNext }: Props) {
  const { tempData, setTempData } = useCapsuleStore();

  // 1. 개봉 날짜 옵션 생성 (1년 뒤 ~ 10년 뒤)
  const dateOptions = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => {
      const d = new Date();
      d.setFullYear(d.getFullYear() + i + 1);
      d.setDate(d.getDate() + 1); 
      d.setHours(0, 0, 0, 0);
      
      return { 
        label: `${i + 1}년 뒤`, 
        year: d.getFullYear(),
        fullDate: d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
        value: d.toISOString() 
      };
    });
  }, []);

  // 2. 초기 날짜 자동 설정
  useEffect(() => {
    if (!tempData.openAt) {
      setTempData({ openAt: dateOptions[0].value });
    }
  }, [dateOptions, setTempData, tempData.openAt]);

  return (
    <div className="space-y-12 py-4">
      {/* ── 1. 상단 가이드 문구 ── */}
      <div className="space-y-3">
        <h2 className="text-[28px] font-bold leading-[1.3] text-brand-text tracking-tighter">
          고이 기억될 이름과<br />
          <span className="text-brand-lavender-600">열어볼 날을 정해주세요</span>
        </h2>
        <p className="text-brand-subtext text-[15px] font-medium leading-relaxed">
          지정한 날짜가 지나야만 캡슐을 열어볼 수 있습니다.<br />
          그때의 나에게 보낼 선물을 준비해 보세요.
        </p>
      </div>

      <div className="space-y-8">
        {/* ── 2. 제목 입력 섹션 ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 ml-1">
            <Type size={14} className="text-brand-lavender-400" />
            <p className="text-[11px] font-bold text-brand-lavender-400 uppercase tracking-widest">Capsule Title</p>
          </div>
          <input 
            className="w-full p-5 bg-brand-surface rounded-2xl outline-none font-bold text-brand-text placeholder:text-brand-light focus:bg-white focus:ring-2 focus:ring-brand-lavender-100 transition-all border border-brand-lavender-100 focus:border-brand-lavender-400" 
            placeholder="추억의 이름을 지어주세요 (최대 30자)" 
            maxLength={30}
            value={tempData.title} 
            onChange={e => setTempData({ title: e.target.value })} 
          />
        </div>

        {/* ── 3. 날짜 선택 섹션 ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 ml-1">
            <Calendar size={14} className="text-brand-lavender-400" />
            <p className="text-[11px] font-bold text-brand-lavender-400 uppercase tracking-widest">Unlock Date</p>
          </div>
          <div className="relative">
            <select 
              className="w-full p-5 bg-brand-surface rounded-2xl outline-none font-bold text-brand-text appearance-none cursor-pointer focus:bg-white focus:ring-2 focus:ring-brand-lavender-100 transition-all border border-brand-lavender-100 focus:border-brand-lavender-400" 
              value={tempData.openAt} 
              onChange={e => setTempData({ openAt: e.target.value })}
            >
              {dateOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} — {opt.fullDate}
                </option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-brand-light">
              <ChevronDown size={20} />
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-4">
             <div className="w-1 h-1 bg-brand-lavender-600 rounded-full" />
             <p className="text-[12px] text-brand-lavender-600 font-bold opacity-80 text-center">
               선택한 기간이 지나야 캡슐이 고이 열립니다.
             </p>
          </div>
        </div>
      </div>

      {/* ── 4. 하단 버튼 ── */}
      <div className="pt-4 pb-10">
        <Button 
          variant="primary"
          onClick={onNext} 
          disabled={!tempData.title.trim()}
        >
          다음 단계로
        </Button>
      </div>
    </div>
  );
}