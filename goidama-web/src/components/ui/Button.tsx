'use client';

import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  className = '',
  fullWidth = true,
}: ButtonProps) {
  
  // ── 공통 스타일 (안 느끼한 둥글기와 경쾌한 애니메이션) ──
  const baseStyles = "h-[56px] rounded-2xl font-bold text-[15px] tracking-tight transition-all active:scale-[0.97] flex items-center justify-center gap-2.5 disabled:active:scale-100 disabled:opacity-40 disabled:cursor-not-allowed";
  
  // ── 베리에이션 스타일 ──
  const variants = {
    // 메인 버튼: 브랜드 라벤더 + 은은한 보라색 그림자
    primary: "bg-brand-lavender-600 text-white shadow-lg shadow-brand-lavender-600/20 active:bg-brand-lavender-800",
    
    // 서브 버튼: 연보라 배경 + 브랜드 텍스트
    secondary: "bg-brand-lavender-50 text-brand-lavender-600 border border-brand-lavender-100 active:bg-brand-lavender-100",
    
    // 위험/삭제 버튼: 연한 핑크 배경 + 톤다운된 레드
    danger: "bg-red-50 text-red-500 border border-red-100 active:bg-red-100",
    
    // 투명 버튼: 텍스트 위주
    ghost: "bg-transparent text-brand-subtext hover:text-brand-text active:bg-brand-lavender-50"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${fullWidth ? 'w-full' : 'px-8'} 
        ${className}
      `}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={20} />
      ) : (
        <>
          {children}
        </>
      )}
    </button>
  );
}