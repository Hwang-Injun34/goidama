'use client';

import { useState } from 'react';
import { friendService } from '@/services/friend.service';
import { Send, Hash, Loader2, Sparkles, UserPlus2, Info } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { motion } from 'framer-motion';

export default function FriendRequestModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    const cleanCode = code.trim();
    if (cleanCode.length < 4) return alert('올바른 친구 코드를 입력해 주세요.');

    setLoading(true);
    try {
      await friendService.sendRequest(cleanCode);
      alert('인연을 맺고 싶은 마음을 소중히 전달했습니다! ✨');
      setCode('');
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.detail || '사용자를 찾을 수 없거나 이미 연결된 인연입니다.';
      alert(message);
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="새로운 인연 찾기">
      <div className="space-y-8 py-2">
        {/* ── 1. 상단 비주얼 영역 ── */}
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            {/* 은은한 배경 광채 */}
            <div className="absolute inset-0 bg-brand-lavender-100 blur-2xl rounded-full opacity-50 animate-pulse" />
            
            <div className="relative w-full h-full bg-white rounded-[28px] border border-brand-lavender-100 flex items-center justify-center text-brand-lavender-600 shadow-sm">
              <UserPlus2 size={36} strokeWidth={2} />
              <motion.div 
                animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="absolute -top-1 -right-1 text-amber-400"
              >
                <Sparkles size={22} fill="currentColor" />
              </motion.div>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <h3 className="text-xl font-[900] text-brand-text tracking-tight">고유 코드로 인연 맺기</h3>
            <p className="text-[13px] text-gray-400 font-medium leading-relaxed">
              친구의 8자리 코드를 입력하여<br />함께 추억을 고이 담아보세요.
            </p>
          </div>
        </div>

        {/* ── 2. 코드 입력 영역 ── */}
        <div className="relative group">
          <div className="absolute left-7 top-1/2 -translate-y-1/2 text-brand-lavender-300">
            <Hash size={24} strokeWidth={3} />
          </div>
          <input 
            autoFocus
            className="w-full pl-16 pr-6 py-7 bg-brand-surface rounded-[32px] text-left text-3xl font-[900] tracking-[0.15em] outline-none border-2 border-transparent focus:border-brand-lavender-200 focus:bg-white transition-all text-brand-text placeholder:text-gray-200 shadow-inner"
            placeholder="ABC12345"
            value={code}
            maxLength={12}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
          {code && (
            <button 
              onClick={() => setCode('')}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-[10px] font-black uppercase">Clear</span>
            </button>
          )}
        </div>

        {/* ── 3. 안내 문구 박스 ── */}
        <div className="bg-brand-surface p-5 rounded-[26px] border border-brand-lavender-100/50 flex gap-3">
           <Info size={18} className="text-brand-lavender-400 shrink-0 mt-0.5" />
           <p className="text-[12px] text-gray-400 font-medium leading-relaxed">
             내 코드는 <span className="text-brand-lavender-600 font-black underline underline-offset-2 cursor-pointer" onClick={() => alert('프로필에서 확인해주세요!')}>내 프로필</span> 하단에서 확인할 수 있어요. 상대방이 수락하면 인연 목록에 추가됩니다.
           </p>
        </div>

        {/* ── 4. 전송 버튼 ── */}
        <motion.button 
          whileTap={{ scale: 0.97 }}
          onClick={handleRequest}
          disabled={loading || !code}
          className={`w-full py-5 rounded-[24px] font-[900] text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${
            loading || !code 
              ? 'bg-gray-100 text-gray-300 shadow-none' 
              : 'bg-[#1E233D] text-white shadow-indigo-100/30 hover:bg-[#111B27]'
          }`}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <>
              <Send size={20} strokeWidth={2.5} className={code ? "text-white" : "text-gray-300"} />
              <span>친구 요청 보내기</span>
            </>
          )}
        </motion.button>
      </div>
    </Modal>
  );
}