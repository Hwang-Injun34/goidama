'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MoreHorizontal, 
  ShieldX, 
  UserMinus, 
  ChevronRight, 
  User, 
  Sparkles,
  Link as LinkIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  friend: any;
  onUnfriend: (id: string) => void;
  onBlock: (id: string) => void;
}

export default function FriendItem({ friend, onUnfriend, onBlock }: Props) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleItemClick = () => {
    router.push(`/friend/${friend.id}/timeline`);
  };

  const handleAction = (callback: (id: string) => void) => {
    callback(friend.id);
    setShowMenu(false);
  };

  return (
    <div className="relative mb-3">
      {/* ── 1. 메인 친구 카드 ── */}
      <motion.div 
        whileTap={{ scale: 0.97 }}
        onClick={handleItemClick}
        className="group relative flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[32px] shadow-[0_8px_20px_rgba(0,0,0,0.02)] hover:border-brand-lavender-200 hover:shadow-[0_12px_25px_rgba(108,99,255,0.05)] transition-all cursor-pointer overflow-hidden"
      >
        {/* 호버 시 나타나는 은은한 배경 강조 */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-lavender-50/0 to-brand-lavender-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative z-10 flex items-center gap-4">
          {/* 프로필 이미지 (Squircle 스타일) */}
          <div className="w-14 h-14 rounded-[22px] overflow-hidden bg-gray-50 border border-gray-100 shadow-inner flex-shrink-0">
            {friend.profile_image_url ? (
              <img 
                src={friend.profile_image_url} 
                className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                alt={friend.nickname} 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-200 bg-gray-50">
                <User size={28} strokeWidth={1.5} />
              </div>
            )}
          </div>

          {/* 친구 정보 */}
          <div className="text-left">
            <h4 className="font-[900] text-[#111B27] text-[17px] tracking-tight leading-tight mb-2">
              {friend.nickname}
            </h4>
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 rounded-full bg-brand-lavender-50 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-lavender-600 animate-pulse" />
                <span className="text-[10px] font-black text-brand-lavender-600 uppercase tracking-tight">Connected</span>
              </div>
              <span className="text-[11px] text-gray-300 font-bold flex items-center gap-1">
                <LinkIcon size={10} />
                Timeline
              </span>
            </div>
          </div>
        </div>

        {/* 우측 액션 그룹 */}
        <div className="relative z-10 flex items-center gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all ${
              showMenu 
                ? 'bg-[#1E233D] text-white shadow-lg' 
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
            }`}
          >
            <MoreHorizontal size={20} strokeWidth={2.5} />
          </button>
          <ChevronRight 
            size={18} 
            className="text-gray-200 group-hover:text-brand-lavender-400 group-hover:translate-x-1 transition-all" 
          />
        </div>
      </motion.div>

      {/* ── 2. 드롭다운 액션 메뉴 ── */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Overlay for closing */}
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: -10, x: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10, x: 10 }}
              className="absolute right-4 top-[80px] w-48 bg-white/90 backdrop-blur-xl rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/60 z-50 py-2.5 overflow-hidden ring-1 ring-black/[0.03]"
            >
              <div className="px-5 py-2 mb-1 flex items-center gap-2">
                <Sparkles size={10} className="text-brand-lavender-400" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">인연 관리</p>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); handleAction(onUnfriend); }}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-[14px] font-bold text-gray-600 hover:bg-brand-lavender-50 hover:text-brand-lavender-600 transition-colors"
              >
                <UserMinus size={16} strokeWidth={2} /> 
                <span>친구 삭제</span>
              </button>
              
              <div className="h-px bg-gray-50 mx-4 my-1.5" />
              
              <button 
                onClick={(e) => { e.stopPropagation(); handleAction(onBlock); }}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-[14px] font-bold text-red-500 hover:bg-red-50 transition-colors"
              >
                <ShieldX size={16} strokeWidth={2} /> 
                <span>인연 차단하기</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}