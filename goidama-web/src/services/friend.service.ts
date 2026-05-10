import api from '@/lib/axios';
import { 
  Friend, 
  FriendRequest, 
  FriendGroup, 
  InviteLinkResponse,
  BlockedUserResponse 
} from '@/types/friend';
import { FriendTimelineResponse, MessageResponse } from '@/types/capsule';

export const friendService = {
  /**
   * 전체 친구 목록 조회
   */
  getList: async (): Promise<Friend[]> => {
    const res = await api.get('/friend/list');
    return res.data;
  },

  /**
   * 친구 코드로 친구 요청 보내기
   */
  sendRequest: async (friendCode: string): Promise<MessageResponse> => {
    const res = await api.post('/friend/request/send', { friend_code: friendCode });
    return res.data;
  },

  /**
   * 받은 친구 요청 목록 조회
   */
  getReceivedRequests: async (): Promise<FriendRequest[]> => {
    const res = await api.get('/friend/request/received');
    return res.data;
  },

  /**
   * 친구 요청 수락 또는 거절
   * 쿼리 파라미터를 통해 처리합니다.
   */
  respondRequest: async (requestId: number, accept: boolean): Promise<MessageResponse> => {
    const res = await api.post('/friend/request/respond', null, {
      params: { request_id: requestId, accept }
    });
    return res.data;
  },

  /**
   * 친구 삭제
   */
  unfriend: async (friendId: string): Promise<MessageResponse> => {
    const res = await api.delete(`/friend/delete/${friendId}`);
    return res.data;
  },

  /**
   * 특정 친구의 공개된 타임라인 조회
   * 이 엔드포인트는 캡슐 서비스 도메인에 속해 있습니다.
   */
  getFriendTimeline: async (friendId: string): Promise<FriendTimelineResponse> => {
    const res = await api.get(`/capsule/friend/${friendId}/timeline`);
    return res.data;
  },

  /**
   * 내 초대 링크 및 친구 코드 조회
   */
  getInviteLink: async (): Promise<InviteLinkResponse> => {
    const res = await api.get('/friend/invite/link');
    return res.data;
  },

  /**
   * 사용자 차단
   */
  blockUser: async (targetId: string): Promise<MessageResponse> => {
    const res = await api.post(`/friend/block/${targetId}`);
    return res.data;
  },

  /**
   * 차단 해제
   */
  unblockUser: async (targetId: string): Promise<MessageResponse> => {
    const res = await api.delete(`/friend/unblock/${targetId}`);
    return res.data;
  },

  /**
   * 차단한 사용자 목록 조회
   */
  getBlockList: async (): Promise<BlockedUserResponse[]> => {
    const res = await api.get('/friend/block/list');
    return res.data;
  },

  /**
   * 내 모든 친구 그룹 조회
   */
  getGroups: async (): Promise<FriendGroup[]> => {
    const res = await api.get('/friend/groups');
    return res.data;
  },

  /**
   * 새 친구 그룹 생성
   */
  createGroup: async (data: { name: string; friend_ids: string[] }): Promise<FriendGroup> => {
    const res = await api.post('/friend/groups', data);
    return res.data;
  },

  /**
   * 그룹 정보 수정 (이름 변경 또는 멤버 교체)
   */
  updateGroup: async (groupId: string, data: { name: string; friend_ids: string[] }): Promise<FriendGroup> => {
    const res = await api.patch(`/friend/groups/${groupId}`, data);
    return res.data;
  },

  /**
   * 그룹 삭제 (그룹만 해체되고 친구 관계는 유지됨)
   */
  deleteGroup: async (groupId: string): Promise<void> => {
    await api.delete(`/friend/groups/${groupId}`);
  },
};