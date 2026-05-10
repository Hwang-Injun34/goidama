// src/components/features/friend/GroupFilter.tsx
'use client';

import { FriendGroup } from '@/types/friend';
import { motion } from 'framer-motion';
import { Users, Hash } from 'lucide-react';

interface Props {
  groups: FriendGroup[];
  selectedId: string | null; 
  onSelect: (id: string | null) => void;
}

export default function GroupFilter({ groups, selectedId, onSelect }: Props) {
  return (
    <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-3 -mx-6 px-6 scroll-smooth">
      {/* ── 1. '전체' 필터 버튼 ── */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => onSelect(null)}
        className={`flex items-center gap-2 px-6 py-3 rounded-full text-[13px] font-[900] transition-all shrink-0 border-2 tracking-tight ${
          selectedId === null
            ? 'bg-[#1E233D] border-[#1E233D] text-white shadow-[0_10px_20px_rgba(30,35,61,0.15)]'
            : 'bg-white border-gray-100 text-gray-400 hover:border-brand-lavender-200'
        }`}
      >
        <Users size={14} strokeWidth={3} className={selectedId === null ? 'text-brand-lavender-400' : 'text-gray-300'} />
        <span>전체</span>
      </motion.button>

      {/* ── 2. 동적 그룹 필터 버튼 리스트 ── */}
      {groups.map((group) => {
        const isActive = selectedId === group.id;
        return (
          <motion.button
            key={group.id}
            whileTap={{ scale: 0.92 }}
            onClick={() => onSelect(group.id)}
            className={`flex items-center gap-1.5 px-6 py-3 rounded-full text-[13px] font-[900] transition-all shrink-0 border-2 tracking-tight ${
              isActive
                ? 'bg-brand-lavender-600 border-brand-lavender-600 text-white shadow-[0_10px_20px_rgba(108,99,255,0.2)]'
                : 'bg-white border-gray-100 text-gray-400 hover:border-brand-lavender-200'
            }`}
          >
            <Hash size={12} strokeWidth={4} className={isActive ? 'text-white/60' : 'text-gray-200'} />
            <span>{group.name}</span>
          </motion.button>
        );
      })}

      {/* ── 3. 빈 상태 힌트 ── */}
      {groups.length === 0 && (
        <div className="flex items-center px-6 py-3 bg-brand-surface border border-dashed border-brand-lavender-100 rounded-full shrink-0">
           <span className="text-[12px] font-black text-gray-300 uppercase tracking-widest">No Groups</span>
        </div>
      )}
    </div>
  );
}