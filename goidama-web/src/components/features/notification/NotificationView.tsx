'use client';

import { useNotification } from '@/hooks/useNotification';
import { useRouter } from 'next/navigation';
import { Mail, Sparkles, MapPin, Bell, UserPlus, ChevronLeft, Loader2, Clock, Inbox } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotificationView() {
  const router = useRouter();
  const { notifications, loading, readNotification } = useNotification();

  // 아이콘 컬러를 브랜드 팔레트로 통일
  const getIcon = (type: string) => {
    switch (type) {
      case 'capsule_invite': return <Mail size={20} className="text-brand-lavender-600" />;
      case 'capsule_opened': return <Sparkles size={20} className="text-brand-lavender-600" />;
      case 'member_checkin': return <MapPin size={20} className="text-emerald-500" />;
      case 'friend_request': return <UserPlus size={20} className="text-brand-lavender-600" />;
      default: return <Bell size={20} className="text-brand-lavender-400" />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* ── HEADER ── */}
      <header className="px-4 h-[64px] flex items-center bg-white/80 backdrop-blur-xl border-b border-brand-lavender-100 shrink-0 sticky top-0 z-20 pt-safe">
        <button 
          onClick={() => router.back()} 
          className="p-2 -ml-1 active:bg-brand-lavender-50 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-brand-text" strokeWidth={2.5} />
        </button>
        <h2 className="text-[18px] font-bold text-brand-text ml-1">알림</h2>
      </header>

      {/* ── LIST ── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3 pb-32 no-scrollbar">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-brand-lavender-400" size={28} />
          </div>
        ) : notifications.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-40">
             <div className="w-20 h-20 bg-brand-surface rounded-[32px] flex items-center justify-center mb-6 border border-brand-lavender-100">
                <Inbox size={32} strokeWidth={1.5} className="text-brand-lavender-200" />
             </div>
             <p className="text-[15px] font-bold text-brand-text">고이 도착한 알림이 없어요</p>
             <p className="text-[13px] text-brand-subtext mt-1">새로운 소식이 오면 알려드릴게요.</p>
          </div>
        ) : (
          notifications.map((notif, index) => (
            <motion.div 
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={async () => {
                await readNotification(notif.id);
                if (notif.related_id) router.push(`/capsule/${notif.related_id}`);
              }}
              className={`p-5 rounded-[24px] flex gap-4 transition-all active:scale-[0.98] border shadow-sm ${
                notif.is_read 
                  ? 'bg-white border-brand-lavender-50 opacity-60' 
                  : 'bg-brand-lavender-50/30 border-brand-lavender-100'
              }`}
            >
              {/* 아이콘 박스 */}
              <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shrink-0 border border-brand-lavender-100 shadow-sm">
                {getIcon(notif.type)}
              </div>

              {/* 텍스트 영역 */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[14px] text-brand-text leading-tight mb-1">{notif.title}</p>
                <p className="text-[12px] text-brand-subtext leading-snug line-clamp-2">{notif.content}</p>
                
                <div className="flex items-center gap-1.5 mt-2.5 text-brand-light">
                  <Clock size={11} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* 읽지 않음 표시 (포인트 라벤더 도트) */}
              {!notif.is_read && (
                <div className="w-2 h-2 bg-brand-lavender-600 rounded-full mt-2 shrink-0 animate-pulse shadow-sm shadow-brand-lavender-600/50" />
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}