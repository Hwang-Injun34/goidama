'use client';

import ScreenHeader from '@/components/layout/ScreenHeader';
import {
  PlusCircle,
  Lock,
  MapPin,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function GuidePage() {
  const steps = [
    {
      icon: <PlusCircle size={22} />,
      color: 'text-brand-lavender-600',
      bg: 'bg-brand-lavender-50',
      title: '캡슐 작성',
      desc: '사진과 메시지를 입력하여\n새로운 타임캡슐을 생성합니다.',
    },
    {
      icon: <Lock size={22} />,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      title: '위치 봉인',
      desc: '지정된 장소에서 GPS 인증을 통해\n캡슐을 암호화하여 잠급니다.',
    },
    {
      icon: <MapPin size={22} />,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      title: '장소 재방문',
      desc: '설정한 개봉 일시가 된 후,\n봉인했던 장소를 다시 방문합니다.',
    },
    {
      icon: <Sparkles size={22} />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      title: '기록 확인',
      desc: '시간과 장소 조건이 충족되면\n봉인이 해제되어 내용을 확인합니다.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F7FB] text-[#111B27] pb-24">
      {/* 상단 헤더 */}
      <ScreenHeader title="이용 가이드" />

      {/* ── 1. 히어로 섹션 ── */}
      <div className="px-6 pt-4">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[36px] px-8 py-10 shadow-xl shadow-indigo-100/30"
          style={{ background: 'linear-gradient(135deg, #1E233D 0%, #3B3486 100%)' }}
        >
          {/* 장식 요소 */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-lavender-400/20 blur-3xl rounded-full" />
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 items-center gap-2">
              <ShieldCheck size={12} className="text-brand-lavender-300" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Security Guide</span>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-2xl font-[900] text-white tracking-tight">
                추억을 봉인하는<br />가장 안전한 프로세스
              </h1>
              <p className="text-white/50 text-[13px] font-medium leading-relaxed pt-1">
                고이다마는 시간과 공간의 동시 검증을 통해<br />당신의 소중한 기록을 보호합니다.
              </p>
            </div>
          </div>
        </motion.section>
      </div>

      {/* ── 2. 스텝 섹션 ── */}
      <section className="px-7 mt-12">
        <div className="flex items-center gap-2 mb-8 px-1">
          <div className="w-1 h-5 bg-brand-lavender-600 rounded-full" />
          <h2 className="text-[18px] font-[900] text-[#111B27] tracking-tight">이용 프로세스</h2>
        </div>

        <div className="relative">
          {/* 수직 타임라인 라인 */}
          <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gray-100 z-0" />

          <div className="space-y-10 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-5"
              >
                {/* Step 아이콘 및 번호 */}
                <div className="relative shrink-0">
                  <div className={`w-14 h-14 rounded-[22px] ${step.bg} ${step.color} flex items-center justify-center shadow-sm border border-white`}>
                    {step.icon}
                  </div>
                  <div className="absolute -right-1 -top-1 w-5 h-5 bg-[#1E233D] rounded-lg shadow-sm flex items-center justify-center text-[10px] font-black text-white">
                    {i + 1}
                  </div>
                </div>

                {/* Step 설명 */}
                <div className="flex-1 pt-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[16px] font-[900] text-[#111B27] tracking-tight">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-[13px] text-gray-400 leading-relaxed font-medium whitespace-pre-wrap">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. 하단 안내 ── */}
      <section className="mt-16 px-6">
        <div className="p-6 bg-brand-surface rounded-[28px] border border-brand-lavender-100 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-brand-lavender-400 shadow-sm shrink-0">
            <Sparkles size={20} />
          </div>
          <div className="space-y-1">
            <p className="text-[14px] font-[900] text-[#111B27]">특별한 개봉 조건</p>
            <p className="text-[12px] text-gray-400 font-medium leading-relaxed">
              모든 타임캡슐은 설정한 시간과 장소가 정확히 일치해야만 암호화가 해제됩니다.
            </p>
          </div>
        </div>
        
        <div className="mt-10 text-center opacity-20">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 leading-none">
            Goidama Memory Archive System
          </p>
        </div>
      </section>
    </div>
  );
}