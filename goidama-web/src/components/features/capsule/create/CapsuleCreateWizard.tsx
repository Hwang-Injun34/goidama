'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCapsuleStore } from '@/store/capsuleStore';
import { motion, AnimatePresence } from 'framer-motion';

// 하위 컴포넌트 임포트
import CreateHeader from './common/CreateHeader';
import Step1TypeSelect from './steps/Step1GroupSelect';
import Step2TitleDate from './steps/Step2TitleDate';
import Step3FriendSelect from './steps/Step3FriendSelect';
import Step4SkinSelect from './steps/Step4SkinSelect';
import Step5ContentInput from './steps/Step5ContentInput';
import Step6GpsSeal from './steps/Step6GpsSeal';

export default function CapsuleCreateWizard() {
  const [step, setStep] = useState(1);
  const { tempData, resetTempData } = useCapsuleStore();
  const router = useRouter();

  // --- 캡슐 생성 전체 취소 로직 ---
  const handleCancel = () => {
    // 브랜딩을 녹여낸 확인 문구
    const isConfirmed = confirm(
      "타임캡슐 작성을 그만두시겠습니까?\n지금까지 고이 담은 내용이 모두 사라집니다."
    );

    if (isConfirmed) {
      resetTempData?.(); 
      router.push('/home'); 
    }
  };

  // --- 단계 이동 로직 ---
  const nextStep = () => setStep((prev) => prev + 1);
  
  const prevStep = () => {
    if (step === 1) {
      resetTempData?.(); 
      router.back();
      return;
    }
    
    // 개인 캡슐일 때 친구 선택(3단계) 건너뛰기 로직 유지
    if (step === 4 && !tempData.isGroup) {
      setStep(2);
      return;
    }
    setStep((prev) => prev - 1);
  };

  const handleStep2Next = () => {
    if (tempData.isGroup) {
      nextStep();
    } else {
      setStep(4);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white max-w-[480px] mx-auto overflow-hidden relative shadow-card">
      
      {/* ── 1. 상단 헤더 영역 ── */}
      <div className="bg-white/80 backdrop-blur-xl z-50">
        <CreateHeader 
          step={step} 
          onBack={prevStep} 
          onCancel={handleCancel} 
        />
      </div>
      
      {/* ── 2. 단계별 컨텐츠 영역 ── */}
      <main className="flex-1 px-6 pt-6 overflow-y-auto no-scrollbar pb-32 relative bg-white">
        {/* 배경에 아주 은은한 브랜드 로고 혹은 문양을 깔아줄 수 있습니다 (선택) */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -z-10 opacity-[0.03]">
           <div className="w-64 h-64 bg-brand-lavender-600 rounded-full blur-[100px]" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            {step === 1 && <Step1TypeSelect onNext={nextStep} />}
            {step === 2 && <Step2TitleDate onNext={handleStep2Next} />}
            {step === 3 && <Step3FriendSelect onNext={nextStep} />}
            {step === 4 && <Step4SkinSelect onNext={nextStep} />}
            {step === 5 && <Step5ContentInput onNext={nextStep} />}
            {step === 6 && <Step6GpsSeal />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── 3. 하단 장식 및 안전 영역 ── */}
      {/* 기존의 무거운 네이비 바를 제거하고 브랜드 아이덴티티를 살린 얇은 라인으로 교체 */}
      <div className="fixed bottom-0 w-full max-w-[480px] h-[6px] bg-brand-lavender-50">
        <div 
          className="h-full bg-brand-lavender-600 transition-all duration-500 ease-out"
          style={{ width: `${(step / 6) * 100}%` }}
        />
      </div>
      
      {/* 모바일 하단바 대응 여백 */}
      <div className="h-pb-safe bg-white shrink-0" />
    </div>
  );
}