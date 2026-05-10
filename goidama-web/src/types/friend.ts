import { UserSummary } from "./auth";

/**
 * 1. 상태 및 상수 타입
 * 백엔드 Enum과 일치시키기 위해 대문자로 정의합니다.
 */
export type ParticipantStatus = 'INVITED' | 'ACCEPTED' | 'REJECTED';

/**
 * 2. 친구 정보 (FriendResponse 기반)
 * 내 친구 목록을 불러올 때 사용합니다.
 */
export interface Friend extends UserSummary {
  friend_code: string;
  friend_since: string; // 친구가 된 날짜 (ISO String)
  is_blocked?: boolean; // 차단 여부
}

/**
 * 3. 받은 친구 요청 (PendingRequestResponse 기반)
 */
export interface FriendRequest {
  request_id: number;   // 요청 고유 번호 (수락/거절 시 사용)
  requester: UserSummary; // 백엔드 구조에 맞춰 수정 (UserSummary 객체)
  created_at: string;
}

/**
 * 4. 친구 그룹 정보 (FriendGroupResponse 기반)
 */
export interface FriendGroup {
  id: string; // uuid
  name: string;
  member_count: number;
  members: UserSummary[];
  created_at: string;
}

/**
 * 5. API 요청용 타입들 (Request Body)
 */

// 그룹 생성 요청
export interface CreateGroupRequest {
  name: string;
  friend_ids: string[]; // UUID 문자열 배열
}

// 친구 요청 응답 (수락/거절)
export interface FriendRequestRespondRequest {
  accept: boolean;
}

// 친구 추가 요청 (친구 코드로 찾기)
export interface FriendAddRequest {
  friend_code: string;
}

/**
 * 6. 기타 응답 타입
 */
export interface InviteLinkResponse {
  friend_code: string;
  invite_url: string;
}

export interface BlockedUserResponse extends UserSummary {
  blocked_at: string;
}