'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  
  // 모달이 열려있을 때 바디 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pt-safe">
          
          {/* ── 배경 (Backdrop): 너무 검지 않은 세련된 딤 처리 ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-text/40 backdrop-blur-[2px]"
          />

          {/* ── 모달 컨텐츠 ── */}
          <motion.div
            initial={{ y: '100%', opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[480px] bg-white rounded-t-[32px] sm:rounded-[28px] shadow-2xl overflow-hidden z-10"
          >
            {/* 모바일용 상단 핸들 (바텀시트 느낌 강화) */}
            <div className="sm:hidden w-full flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-brand-lavender-100 rounded-full" />
            </div>

            <div className="px-6 py-7 sm:p-8">
              {/* 헤더 영역 */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[20px] font-bold text-brand-text tracking-tight">
                  {title}
                </h3>
                <button 
                  onClick={onClose} 
                  className="p-2 text-brand-light hover:text-brand-lavender-600 active:bg-brand-lavender-50 rounded-full transition-all"
                >
                  <X size={24} strokeWidth={2.2} />
                </button>
              </div>

              {/* 본문 영역 */}
              <div className="relative text-brand-text">
                {children}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}