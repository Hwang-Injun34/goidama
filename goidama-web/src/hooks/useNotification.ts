import { useState, useEffect, useCallback, useMemo } from 'react';
import { notificationService } from '@/services/notification.service';
import { NotificationResponse } from '@/types/notification';

/**
 * 사용자 알림 목록 조회 및 읽음 처리를 관리하는 훅
 */
export const useNotification = () => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * 서버로부터 최신 알림 목록을 가져옵니다.
   */
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationService.getList();
      setNotifications(data || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 특정 알림을 읽음 상태로 변경합니다.
   * @param id 알림 UUID
   */
  const readNotification = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      
      // 로컬 상태를 즉시 업데이트하여 UI 반응성 확보
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  /**
   * 읽지 않은 알림의 총 개수를 계산합니다. (헤더 배지용)
   */
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.is_read).length;
  }, [notifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return { 
    notifications, 
    unreadCount,
    loading, 
    readNotification, 
    refresh: fetchNotifications 
  };
};