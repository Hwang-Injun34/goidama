'use client';

import { Check, X, UserRound, Sparkles, CheckCheck, Clock } from 'lucide-react';
import { FriendRequest } from '@/types/friend';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  requests: FriendRequest[];
  onRespond: (id: number, accept: boolean) => void;
  onAcceptAll: () => void;
}

export default function FriendRequestList({ requests, onRespond, onAcceptAll }: Props) {
  if (requests.length === 0) return null;

  return (
    <section className="bg-white rounded-[32px] border border-brand-lavender-100 p-7 shadow-[0_10px_30px_rgba(0,0,0,0.02)] overflow-hidden relative">
      {/* 배경 은은한 포인트 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-lavender-50 rounded-full blur-3xl opacity-50 -mr-10 -mt-10" />

      {/* ── 1. 헤더 영역 ── */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-lavender-50 flex items-center justify-center shadow-sm">
            <Sparkles size={18} className="text-brand-lavender-600" fill="currentColor" />
          </div>
          <div>
            <h3 className="text-[17px] font-[900] text-brand-text tracking-tight">새로 도착한 인연</h3>
            <p className="text-[11px] text-brand-lavender-400 font-bold uppercase tracking-wider">
              {requests.length} New Requests
            </p>
          </div>
        </div>
        
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={onAcceptAll}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-lavender-600 text-white rounded-full text-[11px] font-black shadow-lg shadow-brand-lavender-100 transition-all active:bg-brand-lavender-700"
        >
          <CheckCheck size={14} strokeWidth={3} />
          모두 수락
        </motion.button>
      </div>

      {/* ── 2. 요청 리스트 ── */}
      <div className="relative z-10 space-y-4">
        <AnimatePresence mode="popLayout">
          {requests.map((req, index) => (
            <motion.div
              key={req.request_id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 bg-brand-surface rounded-[26px] border border-brand-lavender-100/50 hover:border-brand-lavender-200 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-4">
                {/* 프로필 이미지 (Squircle) */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-[18px] overflow-hidden bg-white border border-gray-100 shadow-inner">
                    {req.requester.profile_image_url ? (
                      <img src={req.requester.profile_image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <UserRound size={24} strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-lavender-600 border-2 border-white rounded-full animate-pulse shadow-sm" />
                </div>

                <div className="text-left">
                  <p className="font-[900] text-[15px] text-brand-text tracking-tight leading-none mb-1.5">
                    {req.requester.nickname}
                  </p>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Clock size={10} />
                    <span className="text-[10px] font-bold tracking-tight uppercase">
                      {new Date(req.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-2">
                <button 
                  onClick={() => onRespond(req.request_id, false)}
                  className="w-10 h-10 bg-white text-gray-300 rounded-2xl flex items-center justify-center hover:text-red-400 border border-gray-50 transition-all active:scale-90"
                >
                  <X size={18} strokeWidth={3} />
                </button>
                
                <button 
                  onClick={() => onRespond(req.request_id, true)}
                  className="w-10 h-10 bg-[#1E233D] text-white rounded-2xl flex items-center justify-center shadow-md active:bg-brand-lavender-600 transition-all active:scale-90"
                >
                  <Check size={18} strokeWidth={3} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 하단 장식 문구 */}
      <div className="mt-5 flex justify-center">
        <p className="text-[10px] text-gray-300 font-bold italic">
          누군가 당신과 함께 추억을 고이 담고 싶어 합니다
        </p>
      </div>
    </section>
  );
}