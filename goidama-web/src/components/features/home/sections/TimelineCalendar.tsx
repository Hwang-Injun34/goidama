'use client';

import { useState, useMemo } from 'react';
import { useTimeline } from '@/hooks/useTimeline';
import CapsuleCard from '@/components/features/capsule/shared/CapsuleCard';
import { ChevronLeft, ChevronRight, ListFilter, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from 'date-fns';

export default function TimelineSection() {
  const { data = [], loading, sort, setSort } = useTimeline();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 1. 모든 캡슐 평탄화 (캘린더 표시 및 필터링용)
  const allCapsules = useMemo(() => {
    return data.flatMap(group => group.capsules || []);
  }, [data]);

  // 2. 캘린더 날짜 그리드 계산
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // 3. 선택된 날짜에 따른 필터링 리스트
  const filteredCapsules = useMemo(() => {
    if (!selectedDate) return null;
    return allCapsules.filter(c => isSameDay(new Date(c.open_at), selectedDate));
  }, [selectedDate, allCapsules]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 overflow-hidden">
      {/* --- 상단 캘린더 영역 (38%) --- */}
      <section className="h-[42%] bg-gray-900 text-white p-6 flex flex-col shrink-0">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <h2 className="text-xl font-black italic tracking-tighter text-blue-400 leading-none">GOIDAMA</h2>
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mt-1">Calendar</span>
          </div>
          <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-2xl border border-white/10">
            <button onClick={() => setCurrentMonth(prev => new Date(prev.setMonth(prev.getMonth() - 1)))}><ChevronLeft size={16}/></button>
            <span className="font-bold text-xs w-[70px] text-center">{format(currentMonth, 'yyyy. MM')}</span>
            <button onClick={() => setCurrentMonth(prev => new Date(prev.setMonth(prev.getMonth() + 1)))}><ChevronRight size={16}/></button>
          </div>
        </div>
        
        <div className="flex-1 grid grid-cols-7 gap-y-1 text-center">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={`weekday-${i}`} className="text-[10px] font-black text-gray-600 mb-2">{d}</div>
          ))}
          
          {days.map((day, i) => {
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const dayCapsules = allCapsules.filter(c => isSameDay(new Date(c.open_at), day));
            const hasCapsule = dayCapsules.length > 0;
            const hasOpened = dayCapsules.some(c => c.status?.toLowerCase() === 'opened');

            return (
              <div 
                key={day.toString()} 
                onClick={() => setSelectedDate(isSelected ? null : day)}
                className={`relative py-2 flex flex-col items-center cursor-pointer transition-all ${!isCurrentMonth && 'opacity-20'}`}
              >
                {/* 선택된 날짜 배경 */}
                {isSelected && (
                  <div className="absolute inset-0 m-auto w-8 h-8 bg-blue-600 rounded-full -z-0 animate-in zoom-in duration-200" />
                )}
                
                <span className={`relative z-10 text-xs font-bold ${isSelected ? 'text-white' : isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}`}>
                  {format(day, 'd')}
                </span>

                {/* 캡슐 점 표시 */}
                {isCurrentMonth && hasCapsule && !isSelected && (
                  <div className={`w-1 h-1 rounded-full mt-1 ${hasOpened ? 'bg-green-400' : 'bg-blue-400'}`} />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* --- 하단 리스트 영역 (스크롤) --- */}
      <section className="flex-1 bg-white rounded-t-[40px] px-6 pt-8 pb-32 overflow-y-auto no-scrollbar shadow-[0_-20px_40px_rgba(0,0,0,0.3)] relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
             <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">
               {selectedDate ? `${format(selectedDate, 'MM. dd')} Capsules` : 'Timeline List'}
             </h3>
             {selectedDate && (
               <button onClick={() => setSelectedDate(null)} className="flex items-center gap-1 text-[10px] text-blue-500 font-bold mt-1 uppercase">
                 <X size={10} /> Show All Timeline
               </button>
             )}
          </div>
          {!selectedDate && (
            <div className="flex items-center gap-2">
              <select 
                value={sort} 
                onChange={(e) => setSort(e.target.value as any)}
                className="text-[10px] font-black uppercase bg-gray-50 px-3 py-2 rounded-xl border-none outline-none appearance-none"
              >
                <option value="latest">Latest</option>
                <option value="dday">D-Day</option>
              </select>
              <div className="p-2 bg-gray-50 rounded-xl text-gray-300"><ListFilter size={14} /></div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {selectedDate ? (
            /* [Case 1] 날짜 선택 시 해당 날짜 리스트 */
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
              {filteredCapsules && filteredCapsules.length > 0 ? (
                filteredCapsules.map(cap => <CapsuleCard key={cap.id} capsule={cap} />)
              ) : (
                <div className="py-20 text-center text-gray-300 text-xs font-bold italic bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-100">
                  No memories on this day.
                </div>
              )}
            </div>
          ) : (
            /* [Case 2] 전체 타임라인 (월별 그룹) */
            data.map((group) => (
              <div key={group.month}>
                <div className="flex items-center gap-3 mb-6">
                  <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">{group.month}</h3>
                  <div className="h-[1px] flex-1 bg-gray-50" />
                </div>
                <div className="space-y-4">
                  {group.capsules.map((cap) => (
                    <CapsuleCard key={cap.id} capsule={cap} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}