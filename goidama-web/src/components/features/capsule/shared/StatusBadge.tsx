'use client';

export default function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  
  // ── 🎨 고이담아 상태별 프리미엄 컬러 팔레트 ──
  const config: Record<string, { label: string; style: string }> = {
    pending: { 
      label: '작성 중', 
      style: 'bg-gray-50 text-gray-400 border-gray-100' 
    },
    locked: { 
      label: '보관 중', 
      style: 'bg-amber-50 text-amber-600 border-amber-100' 
    },
    available: { 
      label: '개봉 가능', 
      style: 'bg-emerald-50 text-emerald-600 border-emerald-100' 
    },
    opened: { 
      label: '열린 추억', 
      style: 'bg-brand-lavender-50 text-brand-lavender-600 border-brand-lavender-100' 
    },
  };

  const { label, style } = config[s] || config.pending;

  return (
    <span className={`
      inline-flex items-center px-2 py-0.5 rounded-[6px] border
      text-[10px] font-[900] tracking-tight
      ${style}
    `}>
      {label}
    </span>
  );
}