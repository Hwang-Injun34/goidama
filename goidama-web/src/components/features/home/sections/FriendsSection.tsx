'use client';

import { useState, useMemo } from 'react';
import { useFriend } from '@/hooks/useFriend';
import {
  Search,
  Plus,
  Users,
  ShieldAlert,
  Loader2,
  SearchX,
  Settings2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import FriendItem from '../../friend/FriendItem';
import FriendRequestList from '../../friend/FriendRequestList';
import GroupFilter from '../../friend/GroupFilter';
import FriendRequestModal from '../../friend/FriendRequestModal';
import GroupManageSheet from '../../friend/GroupManageSheet';
import BlockedList from '../../friend/BlockedList';

export default function FriendsSection() {
  const {
    friends,
    requests,
    groups,
    blockedUsers,
    respond,
    unblock,
    unfriend,
    block,
    loading,
    acceptAllRequests,
  } = useFriend();

  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'friends' | 'blocked'>('friends');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [modals, setModals] = useState({
    add: false,
    group: false,
  });

  const filteredFriends = useMemo(() => {
    return friends.filter((f: any) => {
      const name = (f.nickname || '').toLowerCase();
      const matchesSearch = name.includes(search.toLowerCase());
      if (!selectedGroupId) return matchesSearch;
      const currentGroup = groups.find((g: any) => g.id === selectedGroupId);
      return matchesSearch && currentGroup?.members?.some((m: any) => m.id === f.id);
    });
  }, [friends, groups, search, selectedGroupId]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-brand-lavender-400" size={32} />
        <p className="mt-4 text-[13px] font-bold text-brand-lavender-400 tracking-tight">인연을 불러오고 있어요</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white pb-32 overflow-y-auto no-scrollbar">
      
      {/* ── 1. 상단 탭 및 추가 버튼 ── */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex bg-brand-lavender-50 p-1 rounded-2xl border border-brand-lavender-100">
            <button
              onClick={() => setTab('friends')}
              className={`flex-1 h-10 rounded-[12px] text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
                tab === 'friends' 
                  ? 'bg-white text-brand-lavender-600 shadow-sm' 
                  : 'text-brand-subtext hover:text-brand-lavender-400'
              }`}
            >
              <Users size={14} />
              나의 인연
            </button>
            <button
              onClick={() => setTab('blocked')}
              className={`flex-1 h-10 rounded-[12px] text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
                tab === 'blocked' 
                  ? 'bg-white text-brand-subtext shadow-sm' 
                  : 'text-brand-subtext hover:text-brand-lavender-400'
              }`}
            >
              <ShieldAlert size={14} />
              차단됨
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setModals((prev) => ({ ...prev, add: true }))}
            className="w-12 h-12 rounded-2xl bg-brand-lavender-600 text-white flex items-center justify-center shadow-lg shadow-brand-lavender-600/20 active:bg-brand-lavender-800 transition-colors"
          >
            <Plus size={24} />
          </motion.button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {tab === 'friends' ? (
          <motion.div
            key="friends"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-6 space-y-7 mt-2"
          >
            {/* 검색바 - 브랜드 스타일 적용 */}
            <div className="relative group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-light group-focus-within:text-brand-lavender-600 transition-colors" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="친구 이름을 입력하세요"
                className="w-full h-12 pl-12 pr-4 rounded-2xl bg-brand-surface border border-brand-lavender-100 outline-none text-[15px] font-medium placeholder:text-brand-light focus:border-brand-lavender-400 focus:bg-white transition-all"
              />
            </div>

            {/* 친구 요청 알림 영역 */}
            {requests.length > 0 && (
              <div className="rounded-3xl overflow-hidden border border-brand-lavender-100 bg-brand-lavender-50/50">
                <FriendRequestList requests={requests} onRespond={respond} onAcceptAll={acceptAllRequests} />
              </div>
            )}

            {/* 그룹 필터 & 관리 영역 */}
            <section className="flex items-center gap-2">
              <div className="flex-1 overflow-hidden">
                <GroupFilter groups={groups} selectedId={selectedGroupId} onSelect={setSelectedGroupId} />
              </div>
              <button
                onClick={() => setModals((prev) => ({ ...prev, group: true }))}
                className="shrink-0 w-11 h-11 rounded-full bg-white border border-brand-lavender-100 text-brand-lavender-400 flex items-center justify-center shadow-sm active:scale-90 transition-all"
              >
                <Settings2 size={18} />
              </button>
            </section>

            {/* 친구 목록 리스트 */}
            <section className="space-y-4 pb-10">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[11px] font-bold text-brand-lavender-400 uppercase tracking-[0.2em]">
                  My Connections ({filteredFriends.length})
                </h3>
                <div className="h-[1px] flex-1 bg-brand-lavender-100 ml-4" />
              </div>

              <div className="space-y-2.5">
                {filteredFriends.length > 0 ? (
                  filteredFriends.map((f: any) => (
                    <FriendItem key={f.id} friend={f} onUnfriend={unfriend} onBlock={block} />
                  ))
                ) : (
                  /* 검색 결과 없음 */
                  <div className="bg-brand-surface rounded-[32px] border border-dashed border-brand-lavender-100 py-16 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-3 border border-brand-lavender-100">
                      <SearchX size={24} className="text-brand-lavender-200" />
                    </div>
                    <p className="text-[14px] font-bold text-brand-text">검색 결과가 없어요</p>
                    <p className="text-[12px] text-brand-subtext mt-1">다른 이름으로 고이 찾아보세요.</p>
                  </div>
                )}
              </div>
            </section>
          </motion.div>
        ) : (
          /* 차단 목록 탭 */
          <motion.div 
            key="blocked" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            className="px-6 mt-4"
          >
            <div className="bg-white rounded-[32px] border border-brand-lavender-100 p-2 shadow-sm">
              <BlockedList users={blockedUsers} onUnblock={unblock} />
            </div>
            <p className="mt-4 px-4 text-[11px] text-brand-subtext leading-relaxed">
              차단된 인연은 회원님께 메시지를 보내거나<br />캡슐에 초대할 수 없습니다.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 모달 및 시트 */}
      <FriendRequestModal isOpen={modals.add} onClose={() => setModals((prev) => ({ ...prev, add: false }))} />
      <GroupManageSheet isOpen={modals.group} onClose={() => setModals((prev) => ({ ...prev, group: false }))} friends={friends} />
    </div>
  );
}