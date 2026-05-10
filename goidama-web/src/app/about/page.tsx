'use client';

import ScreenHeader from '@/components/layout/ScreenHeader';
import { Sparkles, History, MapPin, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col">
      {/* ── 상단 헤더 ── */}
      <ScreenHeader title="서비스 소개" />
      
      <div className="flex-1 px-7 pt-6 pb-24 space-y-10 overflow-y-auto no-scrollbar">
        
        {/* ── 1. 브랜드 아이덴티티 ── */}
        <section className="text-center py-12 space-y-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex w-20 h-20 bg-white rounded-[28px] shadow-sm border border-brand-lavender-100 items-center justify-center mx-auto"
          >
            <Sparkles size={40} className="text-[#FFD86B]" fill="currentColor" />
          </motion.div>
          
          <div className="space-y-1">
            <h1 className="text-[32px] font-[900] text-[#111B27] tracking-tight">고이담아</h1>
            <p className="text-brand-lavender-600 text-[11px] font-black uppercase tracking-[0.3em]">
              Location-Based Time Capsule
            </p>
          </div>
        </section>

        {/* ── 2. 서비스 핵심 로직 ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
             <div className="w-1 h-4 bg-brand-lavender-600 rounded-full" />
             <h2 className="text-[17px] font-[900] text-[#111B27] tracking-tight">작동 원리</h2>
          </div>
          
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-brand-lavender-50 flex items-center justify-center text-brand-lavender-600 shrink-0 mt-1">
                <Clock size={20} strokeWidth={2.5} />
              </div>
              <div className="space-y-1">
                <p className="font-black text-[15px] text-[#111B27]">시간의 제약</p>
                <p className="text-[13px] text-gray-400 font-medium leading-relaxed">
                  작성 시 설정한 개봉 일시가 되기 전까지 기록은 암호화되어 열람이 불가능합니다.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 mt-1">
                <MapPin size={20} strokeWidth={2.5} />
              </div>
              <div className="space-y-1">
                <p className="font-black text-[15px] text-[#111B27]">공간의 제약</p>
                <p className="text-[13px] text-gray-400 font-medium leading-relaxed">
                  기록을 봉인한 특정 반경 내에 사용자가 실제로 위치해야만 캡슐이 해제됩니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. 주요 특징 ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
             <div className="w-1 h-4 bg-brand-lavender-600 rounded-full" />
             <h2 className="text-[17px] font-[900] text-[#111B27] tracking-tight">서비스 가치</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-5 bg-white rounded-[28px] border border-gray-100 shadow-sm space-y-3">
              <ShieldCheck size={20} className="text-brand-lavender-600" />
              <p className="text-[14px] font-[900] text-[#111B27] leading-tight">데이터 보안</p>
              <p className="text-[11px] text-gray-400 font-medium leading-tight">개인정보 및 미디어는 암호화 보관됩니다.</p>
            </div>
            <div className="p-5 bg-white rounded-[28px] border border-gray-100 shadow-sm space-y-3">
              <CheckCircle2 size={20} className="text-emerald-500" />
              <p className="text-[14px] font-[900] text-[#111B27] leading-tight">정확한 검증</p>
              <p className="text-[11px] text-gray-400 font-medium leading-tight">GPS 기반으로 정확한 장소 인증을 거칩니다.</p>
            </div>
          </div>
        </section>

        {/* ── 4. 푸터 ── */}
        <footer className="pt-10 text-center space-y-2 pb-10">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">
            SYSTEM VERSION 1.0.4 (BETA)
          </p>
          <p className="text-[9px] font-bold text-gray-200 uppercase tracking-widest">
            © 2026 Goidama Lab. All rights reserved.
          </p>
        </footer>

      </div>
    </div>
  );
}