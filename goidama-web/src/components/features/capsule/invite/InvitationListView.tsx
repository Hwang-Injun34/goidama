'use client';

import { useEffect, useState } from 'react';
import { capsuleService } from '@/services/capsule.service';
import { MailOpen, Check, X, Loader2, Sparkles, UserRound, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 1. 초대장 데이터 타입 정의 (에러 해결의 핵심)
interface Invitation {
  participant_id: number;
  capsule_title: string;
  owner_nickname: string;
  // 필요한 다른 필드가 있다면 추가하세요
}

export default function InvitationListView() {
  // 2. useState<Invitation[]>([]) 라고 타입을 명시해줍니다.
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = async () => {
    try {
      const data = await capsuleService.getInvitations();
      setInvites(data); // 이제 에러가 나지 않습니다!
    } finally { setLoading(false); }
  };

  const handleRespond = async (id: number, accept: boolean) => {
    try {
      await capsuleService.respondInvitation(id, accept);
      fetchInvites();
    } catch (err) { alert('처리 중 오류가 발생했습니다.'); }
  };

  useEffect(() => { fetchInvites(); }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-brand-lavender-400" size={32} />
        <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.3em]">Checking Invites</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-1">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-brand-lavender-400" />
          <h3 className="text-[15px] font-[900] text-brand-text">도착한 초대장</h3>
        </div>
        <span className="text-[11px] font-black text-brand-lavender-600 bg-brand-lavender-50 px-2.5 py-1 rounded-full">
          {invites.length}
        </span>
      </div>

      <AnimatePresence mode="popLayout">
        {invites.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-16 text-center border-2 border-dashed border-gray-50 rounded-[32px] flex flex-col items-center justify-center"
          >
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <MailOpen size={24} className="text-gray-200" />
            </div>
            <p className="text-[13px] font-bold text-gray-300 uppercase tracking-widest">새로운 초대가 없습니다</p>
          </motion.div>
        ) : (
          invites.map((inv, index) => ( // inv: any 대신 위에서 정의한 타입이 적용됨
            <motion.div 
              key={inv.participant_id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
              className="p-5 bg-white border border-brand-lavender-100 rounded-[28px] shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 bg-brand-lavender-50 rounded-[20px] flex items-center justify-center text-brand-lavender-600 shrink-0">
                  <UserRound size={22} strokeWidth={1.5} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-[16px] text-brand-text truncate pr-2 tracking-tight">
                    {inv.capsule_title}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-gray-400 font-medium">From.</span>
                    <span className="text-[11px] text-brand-lavender-600 font-[900]">{inv.owner_nickname}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button 
                  onClick={() => handleRespond(inv.participant_id, false)}
                  className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-400 transition-all active:scale-90"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
                <button 
                  onClick={() => handleRespond(inv.participant_id, true)}
                  className="w-10 h-10 flex items-center justify-center bg-brand-lavender-600 text-white rounded-2xl shadow-lg shadow-brand-lavender-100 hover:bg-brand-lavender-700 transition-all active:scale-90"
                >
                  <Check size={18} strokeWidth={3} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
}