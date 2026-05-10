import { useState, useEffect, useCallback } from 'react';
import { friendService } from '@/services/friend.service';
import { Friend, FriendRequest, FriendGroup, BlockedUserResponse } from '@/types/friend';

/**
 * 친구 목록, 요청, 그룹 및 차단 관리를 담당하는 커스텀 훅
 */
export const useFriend = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [groups, setGroups] = useState<FriendGroup[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUserResponse[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * 모든 친구 관련 데이터를 서버로부터 다시 불러옵니다.
   */
  const refresh = useCallback(async () => {
    try {
      const [f, r, g, b] = await Promise.all([
        friendService.getList(),
        friendService.getReceivedRequests(),
        friendService.getGroups(),
        friendService.getBlockList()
      ]);
      setFriends(f || []);
      setRequests(r || []);
      setGroups(g || []);
      setBlockedUsers(b || []);
    } catch (e) {
      console.error("Failed to refresh friend data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * 친구 요청에 대해 수락 또는 거절 응답을 보냅니다.
   */
  const respond = async (requestId: number, accept: boolean) => { 
    try {
      await friendService.respondRequest(requestId, accept); 
      await refresh();
    } catch (e) {
      alert("요청 처리에 실패했습니다.");
    }
  };

  /**
   * 모든 대기 중인 친구 요청을 일괄 수락합니다.
   */
  const acceptAllRequests = async () => {
    if (requests.length === 0) return;
    try {
      await Promise.all(
        requests.map((req) => friendService.respondRequest(req.request_id, true))
      );
      await refresh();
      alert("모든 친구 요청을 수락했습니다.");
    } catch (err) {
      alert("일부 요청을 처리하는 중 오류가 발생했습니다.");
    }
  };

  /**
   * 기존 친구 관계를 해제합니다.
   */
  const unfriend = async (id: string) => { 
    if (confirm("정말로 친구 관계를 해제하시겠습니까?")) { 
      try {
        await friendService.unfriend(id); 
        await refresh(); 
      } catch (e) {
        alert("친구 삭제에 실패했습니다.");
      }
    } 
  };

  /**
   * 사용자를 차단합니다.
   */
  const block = async (id: string) => { 
    try {
      await friendService.blockUser(id); 
      await refresh(); 
    } catch (e) {
      alert("사용자 차단에 실패했습니다.");
    }
  };

  /**
   * 사용자 차단을 해제합니다.
   */
  const unblock = async (id: string) => { 
    try {
      await friendService.unblockUser(id); 
      await refresh(); 
    } catch (e) {
      alert("차단 해제에 실패했습니다.");
    }
  };

  /**
   * 새로운 친구 그룹을 생성합니다.
   */
  const createGroup = async (name: string, friendIds: string[]) => { 
    try {
      await friendService.createGroup({ name, friend_ids: friendIds }); 
      await refresh(); 
    } catch (e) {
      alert("그룹 생성에 실패했습니다.");
    }
  };
  
  /**
   * 기존 그룹 정보를 수정합니다 (이름 및 멤버 구성).
   */
  const updateGroup = async (id: string, name: string, friendIds: string[]) => { 
    try {
      await friendService.updateGroup(id, { name, friend_ids: friendIds }); 
      await refresh(); 
    } catch (e) {
      alert("그룹 수정에 실패했습니다.");
    }
  };

  /**
   * 친구 그룹을 삭제(해체)합니다.
   */
  const deleteGroup = async (id: string) => { 
    if (confirm("정말로 이 그룹을 해체하시겠습니까?")) {
      try {
        await friendService.deleteGroup(id); 
        await refresh(); 
      } catch (e) {
        alert("그룹 삭제에 실패했습니다.");
      }
    }
  };

  return {
    friends, 
    requests, 
    groups, 
    blockedUsers, 
    loading, 
    refresh,
    respond, 
    acceptAllRequests, 
    unfriend, 
    block, 
    unblock, 
    createGroup, 
    updateGroup, 
    deleteGroup 
  };
};