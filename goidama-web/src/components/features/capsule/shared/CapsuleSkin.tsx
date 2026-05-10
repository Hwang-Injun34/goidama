'use client';

import { CapsuleStatus } from '@/types/capsule';
import { isValidSkinId } from '@/constants/skins';
import { motion } from 'framer-motion';

interface Props {
  skinId: number;
  status: CapsuleStatus | string;
  className?: string;
  animate?: boolean; // 둥실거리는 애니메이션 여부
}

export default function CapsuleSkin({ 
  skinId, 
  status, 
  className = "w-70 h-70",
  animate = true 
}: Props) {
  // 1. 상태 표준화
  const s = typeof status === 'string' ? status.toUpperCase() : 'LOCKED';
  const isOpened = s === 'OPENED' || s === 'ARCHIVED';
  const isAvailable = s === 'AVAILABLE';
  const stateSuffix = isOpened ? 'opened' : 'locked';
  
  // 2. 스킨 안전성 확보
  const safeSkinId = isValidSkinId(skinId) ? skinId : 1;
  const imageUrl = `/images/skins/skin-${safeSkinId}-${stateSuffix}.png`;

  // 3. 상태별 후광(Glow) 컬러 설정
  const glowColor = isOpened 
    ? 'bg-brand-lavender-400/20' 
    : isAvailable 
    ? 'bg-emerald-400/20'
    : s === 'LOCKED' 
    ? 'bg-amber-400/15'
    : 'bg-gray-400/10';

  return (
    <div className={`relative ${className} flex items-center justify-center`}>
      
      {/* ── 배경 광채 효과 (Glow) ── */}
      <div className={`absolute inset-0 blur-3xl rounded-full transition-colors duration-1000 ${glowColor} scale-125`} />

      {/* ── 캡슐 본체 애니메이션 ── */}
      <motion.div
        animate={animate ? {
          y: [0, -6, 0], // 위아래로 둥실둥실
        } : {}}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative w-full h-full flex items-center justify-center pointer-events-none"
      >
        <img 
          src={imageUrl} 
          alt={`Capsule Skin ${safeSkinId}`}
          className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)]"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src.includes('skin-1-locked.png')) return;
            target.src = `/images/skins/skin-1-${stateSuffix}.png`;
          }}
        />

        {/* 개봉 가능 상태일 때 반짝이는 포인트 효과 */}
        {isAvailable && (
          <motion.div 
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full blur-xl"
          />
        )}
      </motion.div>
    </div>
  );
}