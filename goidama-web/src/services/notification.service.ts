import api from '@/lib/axios';

export const notificationService = {
  // 알림 목록 조회
  getList: async () => {
    const res = await api.get('/notification/list');
    return res.data;
  },

  // 알림 읽음 처리
  markAsRead: async (id: string) => {
    const res = await api.post(`/notification/${id}/read`);
    return res.data;
  },
};