'use client';

import { ShieldX, User, Info, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  users: any[];
  onUnblock: (id: string) => void;
}

export default function BlockedList({ users, onUnblock }: Props) {
  return (
    <div className="space-y-8">
      {/* ── 1. 섹션 헤더 ── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 rounded-[20px] flex items-center justify-center text-gray-400 border border-gray-100">
            <ShieldX size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-[18px] font-[900] text-[#111B27] tracking-tight">차단된 인연</h3>
            <p className="text-[12px] text-gray-400 font-medium">소중한 기록으로부터 보호된 인원입니다</p>
          </div>
        </div>
        
        {users.length > 0 && (
          <div className="bg-brand-lavender-50 px-3 py-1.5 rounded-full border border-brand-lavender-100">
            <span className="text-[11px] font-black text-brand-lavender-600 uppercase tracking-widest">
              Total {users.length}
            </span>
          </div>
        )}
      </div>

      {/* ── 2. 리스트 및 비어있는 상태 ── */}
      <AnimatePresence mode="popLayout">
        {users.length > 0 ? (
          <div className="space-y-4">
            {users.map((user, index) => (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* 프로필 이미지 (차단됨을 강조하기 위해 흑백/블러 처리) */}
                  <div className="w-14 h-14 rounded-[22px] overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                    {user.profile_image_url ? (
                      <img 
                        src={user.profile_image_url} 
                        className="w-full h-full object-cover grayscale opacity-40 blur-[0.3px]" 
                        alt="" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <User size={28} strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-black text-[#111B27] text-[16px] tracking-tight">{user.nickname}</p>
                      <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-400 text-[9px] font-black uppercase tracking-tighter">Blocked</span>
                    </div>
                    <p className="text-[11px] text-gray-300 font-medium mt-0.5">인연이 잠시 멈춰있습니다</p>
                  </div>
                </div>

                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onUnblock(user.id)}
                  className="px-5 py-3 bg-[#1E233D] text-white rounded-[18px] text-[12px] font-[900] shadow-lg shadow-gray-200 active:bg-brand-lavender-600 transition-colors"
                >
                  해제하기
                </motion.button>
              </motion.div>
            ))}
          </div>
        ) : (
          /* 비어있는 상태: 더 따뜻하고 깔끔한 비주얼 */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 flex flex-col items-center justify-center bg-white/40 rounded-[36px] border-2 border-dashed border-gray-100"
          >
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-5">
              <CheckCircle2 size={32} strokeWidth={1} />
            </div>
            <p className="text-[16px] font-[900] text-[#111B27]/40 tracking-tight">차단된 인연이 없어요</p>
            <p className="text-[12px] text-gray-300 mt-2">모든 인연과 소중한 기록을 나누고 있습니다.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3. 하단 안내 문구 ── */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex gap-3 p-5 bg-brand-surface rounded-[24px] border border-brand-lavender-100/50"
      >
        <Info size={18} className="text-brand-lavender-400 shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <p className="text-[11px] text-brand-lavender-700 font-black leading-relaxed uppercase tracking-wider">Guide Notice</p>
          <ul className="space-y-1 text-[12px] text-gray-400 font-medium leading-relaxed">
            <li>• 차단을 해제하면 상대방이 다시 나에게 친구 요청을 보낼 수 있습니다.</li>
            <li>• 차단된 인연은 내 소중한 기록들을 볼 수 없도록 안전하게 보호됩니다.</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}