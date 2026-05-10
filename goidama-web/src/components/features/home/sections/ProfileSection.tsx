'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore'; // setActiveTab 사용을 위해 임포트
import {
  LogOut,
  ChevronRight,
  Archive,
  Users,
  Copy,
  UserRound,
  Loader2,
  ShieldCheck,
  HelpCircle,
  Info,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfileSection() {
  const router = useRouter();
  const { user, setUser, logout, isHydrated } = useAuthStore();
  const { setActiveTab } = useUIStore(); // 탭 상태 변경 함수
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initProfile = async () => {
      if (!isHydrated) return;
      setLoading(true);
      try {
        const data = await authService.getMe();
        setUser(data);
      } catch (err) {
        console.error('User data sync failed');
      } finally {
        setLoading(false);
      }
    };
    initProfile();
  }, [isHydrated, setUser]);

  const handleLogout = async () => {
    if (!confirm('로그아웃 하시겠습니까?')) return;
    try {
      await authService.logout();
    } catch (err) {
    } finally {
      logout();
      router.replace('/login');
    }
  };

  const copyFriendCode = () => {
    if (!user?.friend_code) return;
    navigator.clipboard.writeText(user.friend_code);
    alert('친구 코드가 복사되었습니다. ✨');
  };

  if (!isHydrated || loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-brand-lavender-400" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F6F7FB] overflow-y-auto no-scrollbar pb-32">
      
      {/* ── 1. 상단 프로필 헤더 ── */}
      <section className="bg-white px-6 pt-12 pb-10 flex flex-col items-center rounded-b-[48px] shadow-[0_10px_30px_rgba(0,0,0,0.02)] border-b border-gray-100">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-6 relative"
        >
          <div className="w-28 h-28 rounded-[40px] overflow-hidden bg-brand-surface border-[6px] border-brand-surface shadow-inner flex items-center justify-center">
            {user?.profile_image_url ? (
              <img src={user.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserRound size={48} className="text-brand-lavender-200" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-brand-lavender-600 rounded-full border-[5px] border-white flex items-center justify-center shadow-lg">
            <ShieldCheck size={18} className="text-white" />
          </div>
        </motion.div>

        <div className="text-center space-y-1">
          <h2 className="text-[26px] font-[900] text-brand-text tracking-tight">
            {user?.nickname}
          </h2>
          <p className="text-[14px] text-gray-400 font-bold uppercase tracking-widest">
            Memory Keeper
          </p>
        </div>

        <button
          onClick={copyFriendCode}
          className="mt-8 flex items-center gap-2.5 px-6 py-3 bg-brand-surface rounded-2xl active:scale-95 transition-all border border-brand-lavender-100 group"
        >
          <span className="text-[13px] font-black text-brand-lavender-600 tracking-tight">
            ID: {user?.friend_code}
          </span>
          <Copy size={14} className="text-brand-lavender-300 group-hover:text-brand-lavender-600 transition-colors" />
        </button>
      </section>

      {/* ── 2. 메뉴 리스트 (통계 섹션 제거됨) ── */}
      <section className="px-6 mt-10 space-y-4">
        <div className="flex items-center gap-2 px-1 mb-2">
           <div className="w-1 h-4 bg-brand-lavender-600 rounded-full" />
           <h3 className="text-[16px] font-[900] text-brand-text tracking-tight">서비스 설정</h3>
        </div>

        <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
          <MenuRow
            icon={<Archive size={18} />}
            label="나의 보관함"
            onClick={() => setActiveTab('timeline')} // 상태 바로 변경
          />
          <Divider />
          <MenuRow
            icon={<Users size={18} />}
            label="인연 및 모임 관리"
            onClick={() => setActiveTab('friends')} // 상태 바로 변경
          />
          <Divider />
          <MenuRow
            icon={<HelpCircle size={18} />}
            label="사용 가이드"
            onClick={() => router.push('/guide')}
          />
          <Divider />
          <MenuRow
            icon={<Info size={18} />}
            label="고이담아 이야기"
            onClick={() => router.push('/about')}
          />
        </div>

        {/* 로그아웃 */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-6 text-gray-300 font-black text-[13px] uppercase tracking-[0.2em] hover:text-red-400 transition-colors"
        >
          <LogOut size={16} strokeWidth={3} />
          Sign Out
        </button>

        <div className="pt-2 flex flex-col items-center gap-1 opacity-20">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-text">
            Version 1.0.4
          </p>
        </div>
      </section>
    </div>
  );
}

/* ── 내부 컴포넌트: MenuRow ── */
function MenuRow({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-7 py-5.5 active:bg-brand-surface transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-brand-surface flex items-center justify-center text-brand-lavender-400 group-active:text-brand-lavender-600 transition-colors">
          {icon}
        </div>
        <span className="text-[16px] font-[800] text-brand-text tracking-tight">
          {label}
        </span>
      </div>
      <ChevronRight size={18} className="text-gray-200 group-hover:text-brand-lavender-400 transition-colors" />
    </button>
  );
}

function Divider() {
  return <div className="h-[1px] bg-gray-50 mx-7" />;
}