export type NotificationType = 
  | 'friend_request' 
  | 'friend_accepted' 
  | 'capsule_invite' 
  | 'capsule_available' 
  | 'member_checkin' 
  | 'capsule_opened';

export interface NotificationResponse {
  id: string;          // 알림 UUID
  type: string;        // 알림 유형 (INVITATION, OPENED 등)
  title: string;       // 알림 제목
  content: string;     // 알림 본문 내용
  related_id?: string; // 관련 리소스 ID (예: 캡슐 ID)
  is_read: boolean;    // 읽음 여부
  created_at: string;  // 생성 일시
}