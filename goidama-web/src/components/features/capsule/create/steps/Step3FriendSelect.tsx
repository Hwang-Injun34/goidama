'use client';

import { useFriend } from '@/hooks/useFriend';
import { useCapsuleStore } from '@/store/capsuleStore';
import { CheckCircle2, Info, UserRound, Search, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useState } from 'react';

interface Props { onNext: () => void; }

export default function Step3FriendSelect({ onNext }: Props) {
  const { friends, loading } = useFriend();
  const { tempData, setTempData } = useCapsuleStore();
  const [searchTerm, setSearchTerm] = useState('');

  // 1. 친구 선택/해제 토글 로직
  const toggleFriend = (id: string) => {
    const currentIds = tempData.friendIds;
    if (currentIds.includes(id)) {
      setTempData({ friendIds: currentIds.filter(fid => fid !== id) });
    } else {
      setTempData({ friendIds: [...currentIds, id] });
    }
  };

  // 2. 검색 필터링
  const filteredFriends = friends.filter(f => 
    f.nickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 py-4">
      {/* ── 1. 상단 안내 영역 ── */}
      <div className="space-y-4">
        <h2 className="text-[28px] font-bold leading-[1.3] text-brand-text tracking-tighter">
          함께 추억을<br />
          <span className="text-brand-lavender-600">고이 채울 친구를 선택해주세요</span>
        </h2>
        <div className="flex gap-2.5 p-4 bg-brand-lavender-50 rounded-2xl border border-brand-lavender-100 text-brand-lavender-600">
          <Info size={18} className="shrink-0 mt-0.5 opacity-80" />
          <p className="text-[12px] font-bold leading-relaxed">
            공동 캡슐은 초대한 모든 친구가 수락해야<br />
            추억을 봉인하고 함께 기다릴 수 있습니다.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* ── 2. 친구 검색 바 ── */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-light group-focus-within:text-brand-lavender-600 transition-colors" size={18} />
          <input 
            className="w-full pl-12 pr-4 py-4 bg-brand-surface rounded-2xl outline-none font-bold text-[14px] text-brand-text placeholder:text-brand-light focus:bg-white focus:ring-2 focus:ring-brand-lavender-100 transition-all border border-brand-lavender-100 focus:border-brand-lavender-400"
            placeholder="인연의 이름을 검색해보세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* ── 3. 친구 리스트 영역 ── */}
        <div className="space-y-2.5 max-h-[340px] overflow-y-auto no-scrollbar pr-1 pb-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-brand-lavender-300" size={32} />
              <p className="text-[11px] font-bold text-brand-lavender-300 uppercase tracking-widest">Syncing friends...</p>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <p className="text-[15px] font-bold text-brand-light italic">인연을 찾을 수 없어요</p>
              <p className="text-[12px] text-brand-subtext font-medium">검색어를 확인하거나 친구를 추가해보세요.</p>
            </div>
          ) : (
            filteredFriends.map((f: any) => {
              const isSelected = tempData.friendIds.includes(f.id);
              return (
                <button 
                  key={f.id}
                  onClick={() => toggleFriend(f.id)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group active:scale-[0.98] ${
                    isSelected 
                      ? 'border-brand-lavender-600 bg-brand-lavender-50 shadow-sm' 
                      : 'border-brand-surface bg-white hover:border-brand-lavender-100'
                  }`}
                >
                  <div className="flex items-center gap-4 text-left">
                    {/* 아바타 영역 */}
                    <div className={`w-12 h-12 rounded-[18px] overflow-hidden border-2 transition-colors ${
                      isSelected ? 'border-white' : 'border-brand-surface'
                    }`}>
                      {f.profile_image_url ? (
                        <img src={f.profile_image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-brand-surface flex items-center justify-center text-brand-lavender-200">
                          <UserRound size={24} />
                        </div>
                      )}
                    </div>
                    {/* 정보 영역 */}
                    <div>
                      <p className={`text-[15px] font-bold transition-colors ${isSelected ? 'text-brand-text' : 'text-brand-subtext'}`}>
                        {f.nickname}
                      </p>
                      <p className="text-[11px] text-brand-light font-bold tracking-tight">#{f.friend_code}</p>
                    </div>
                  </div>
                  {/* 선택 표시 */}
                  <div className={`transition-all duration-300 ${isSelected ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                    <CheckCircle2 size={24} className="text-brand-lavender-600 fill-white" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── 4. 하단 버튼 ── */}
      <div className="pt-4 pb-10">
        <Button 
          variant="primary"
          onClick={onNext} 
          disabled={tempData.friendIds.length === 0}
        >
          {tempData.friendIds.length > 0 
            ? `${tempData.friendIds.length}명의 인연과 함께하기` 
            : '함께할 친구를 선택해주세요'}
        </Button>
      </div>
    </div>
  );
}