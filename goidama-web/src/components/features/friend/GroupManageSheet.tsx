'use client';

import { useState } from 'react';
import { useFriend } from '@/hooks/useFriend';
import { Friend, FriendGroup } from '@/types/friend';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Users, 
  UserCheck, 
  Heart, 
  Loader2, 
  Sparkles,
  ChevronLeft,
  Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/ui/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  friends: Friend[];
}

export default function GroupManageSheet({ isOpen, onClose, friends }: Props) {
  const { groups, createGroup, updateGroup, deleteGroup } = useFriend();
  
  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [editId, setEditId] = useState<string | null>(null); 
  const [name, setName] = useState('');
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return alert('모임의 이름을 지어주세요.');
    if (selectedFriendIds.length === 0) return alert('함께할 친구를 한 명 이상 선택해주세요.');

    setLoading(true);
    try {
      await createGroup(name, selectedFriendIds);
      setMode('list');
      setName('');
      setSelectedFriendIds([]);
    } catch (err) {
      alert('모임을 만드는 중 문제가 생겼어요.');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (group: FriendGroup) => {
    setEditId(group.id);
    setName(group.name);
  };

  const handleUpdate = async (id: string) => {
    if (!name.trim()) return;
    const targetGroup = groups.find(g => g.id === id);
    const currentMemberIds = targetGroup?.members?.map((m: any) => m.id) || [];

    try {
      setLoading(true);
      await updateGroup(id, name, currentMemberIds);
      setEditId(null);
      setName('');
    } catch (err) {
      alert('이름을 수정하지 못했어요.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFriend = (id: string) => {
    setSelectedFriendIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'list' ? "모임 관리" : "새로운 모임"}>
      <div className="min-h-[500px] flex flex-col">
        <AnimatePresence mode="wait">
          {mode === 'list' ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 pt-2 flex-1"
            >
              {/* ── 상단 만들기 버튼 ── */}
              <button 
                onClick={() => { setMode('create'); setName(''); setSelectedFriendIds([]); }}
                className="w-full py-5 border-2 border-dashed border-brand-lavender-100 rounded-[32px] text-brand-lavender-600 font-black text-[15px] flex items-center justify-center gap-2 hover:bg-brand-lavender-50 transition-all active:scale-[0.97]"
              >
                <Plus size={20} strokeWidth={3} /> 새로운 모임 만들기
              </button>

              {/* ── 리스트 영역 ── */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-1 pb-10">
                <div className="flex items-center justify-between px-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-brand-lavender-400" />
                    <span className="text-[11px] font-[900] text-gray-300 uppercase tracking-widest">My Groups</span>
                  </div>
                  <span className="text-[10px] font-black text-brand-lavender-400 uppercase">Total {groups.length}</span>
                </div>
                
                {groups.map((group: FriendGroup) => (
                  <motion.div 
                    layout
                    key={group.id} 
                    className="flex items-center justify-between p-4 bg-white rounded-[28px] border border-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.02)]"
                  >
                    {editId === group.id ? (
                      <div className="flex gap-2 w-full items-center">
                        <input 
                          autoFocus
                          className="flex-1 bg-brand-surface px-4 py-3 rounded-2xl text-[14px] font-bold border-2 border-brand-lavender-200 outline-none" 
                          value={name} 
                          onChange={e => setName(e.target.value)} 
                          onKeyDown={(e) => e.key === 'Enter' && handleUpdate(group.id)}
                        />
                        <button disabled={loading} onClick={() => handleUpdate(group.id)} className="w-10 h-10 flex items-center justify-center bg-brand-lavender-600 text-white rounded-xl shadow-lg shadow-brand-lavender-100">
                          {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={20} strokeWidth={3} />}
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-brand-lavender-50 rounded-[20px] flex items-center justify-center text-brand-lavender-600">
                            <Users size={22} strokeWidth={2.5} />
                          </div>
                          <div className="text-left">
                            <p className="font-[900] text-[16px] text-brand-text tracking-tight leading-tight">{group.name}</p>
                            <p className="text-[11px] font-bold text-gray-300 mt-0.5 uppercase tracking-tighter">
                              {group.member_count} Members
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => startEditing(group)} className="w-9 h-9 flex items-center justify-center text-gray-300 hover:text-brand-lavender-600 transition-colors">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => deleteGroup(group.id)} className="w-9 h-9 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
                
                {groups.length === 0 && (
                  <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
                     <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-200">
                        <Users size={32} strokeWidth={1} />
                     </div>
                     <p className="text-gray-300 text-[14px] font-bold">아직 만들어진 모임이 없어요</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="create"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 pt-2"
            >
              {/* ── 이름 입력 ── */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Hash size={14} className="text-brand-lavender-400" />
                  <label className="text-[11px] font-black text-gray-300 tracking-widest uppercase">Group Name</label>
                </div>
                <input 
                  autoFocus
                  className="w-full px-6 py-5 bg-brand-surface rounded-[28px] font-[900] text-[16px] text-brand-text outline-none border-2 border-transparent focus:bg-white focus:border-brand-lavender-200 transition-all placeholder:text-gray-200 shadow-inner" 
                  placeholder="예: 우리 가족, 동아리 친구들" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>

              {/* ── 인연 선택 ── */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-brand-lavender-400" />
                    <label className="text-[11px] font-black text-gray-300 tracking-widest uppercase">Select Friends</label>
                  </div>
                  <span className="text-[10px] font-black text-brand-lavender-600 bg-brand-lavender-50 px-3 py-1 rounded-full uppercase">
                    {selectedFriendIds.length} Selected
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 max-h-[260px] overflow-y-auto no-scrollbar pb-4 pr-1">
                  {friends.map((friend) => {
                    const isSelected = selectedFriendIds.includes(friend.id);
                    return (
                      <button 
                        key={friend.id} 
                        type="button"
                        onClick={() => toggleFriend(friend.id)}
                        className={`flex items-center gap-3 p-3.5 rounded-[24px] border-2 transition-all duration-300 ${
                          isSelected 
                            ? 'bg-[#1E233D] border-[#1E233D] text-white shadow-xl shadow-indigo-100' 
                            : 'bg-white border-gray-50 text-gray-400 hover:border-brand-lavender-100'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-[14px] overflow-hidden bg-gray-50 flex-shrink-0 border border-black/5 shadow-inner">
                           <img src={friend.profile_image_url || '/default-pfp.png'} className={`w-full h-full object-cover ${isSelected ? '' : 'grayscale opacity-60'}`} alt="" />
                        </div>
                        <span className={`text-[13px] font-[900] truncate flex-1 text-left tracking-tight ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                          {friend.nickname}
                        </span>
                        {isSelected && <UserCheck size={14} className="text-brand-lavender-400" strokeWidth={3} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── 하단 버튼 ── */}
              <div className="flex gap-3 pt-4 mb-2">
                <button 
                  type="button"
                  onClick={() => setMode('list')} 
                  className="flex-1 py-5 bg-brand-surface text-gray-400 font-bold rounded-[24px] hover:bg-gray-100 transition-colors text-[15px]"
                >
                  취소
                </button>
                <button 
                  type="button"
                  disabled={loading}
                  onClick={handleCreate} 
                  className="flex-[2] py-5 bg-[#1E233D] text-white font-black rounded-[24px] shadow-xl shadow-indigo-100 active:scale-[0.97] transition-all flex items-center justify-center gap-2 text-[15px]"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Heart size={18} fill="currentColor" />}
                  모임 만들기
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}