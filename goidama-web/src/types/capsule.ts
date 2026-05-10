import { UserSummary } from "./auth";

export type CapsuleStatus = 'PENDING' | 'LOCKED' | 'AVAILABLE' | 'OPENED' | 'ARCHIVED';
export type ParticipantStatus = 'INVITED' | 'ACCEPTED' | 'REJECTED';
export type ParticipantRole = 'OWNER' | 'MEMBER';

export interface CapsuleBase {
  id: string; 
  title: string;
  status: CapsuleStatus;
  open_at: string; 
  is_group: boolean;
  address?: string | null;
  thumbnail_url?: string | null;
  skin_id: number;
  d_day: number;
}

export interface CapsuleImage {
  id: number;
  image_url: string;
  order: number;
}

export interface CapsuleContent {
  id: number;
  user: UserSummary;
  text: string;
  images: CapsuleImage[];
  created_at: string;
}

export interface CheckInMemberStatus {
  participant_id: number;
  nickname: string;
  profile_image_url?: string | null;
  is_checked_in: boolean;
  checked_in_at?: string | null;
  status: ParticipantStatus;
  role: ParticipantRole;
}

export interface CapsuleDetail extends CapsuleBase {
  owner: UserSummary;
  participants: CheckInMemberStatus[];
  created_at: string;
  latitude: number;
  longitude: number;
  contents?: CapsuleContent[] | null;
}

/** MonthlyTimelineResponse 정의 */
export interface MonthlyTimelineResponse {
  month: string; 
  capsules: CapsuleBase[];
}

/** 에러 해결: FriendTimelineResponse 추가 */
export interface FriendTimelineResponse {
  friend_nickname: string;
  groups: MonthlyTimelineResponse[];
}

export interface InvitationResponse {
  participant_id: number;
  capsule_id: string;
  capsule_title: string;
  owner_nickname: string;
  created_at: string;
}

export interface CapsuleCalendarResponse {
  id: string;
  title: string;
  open_at: string;
  status: CapsuleStatus;
}

export interface MessageResponse {
  status: string;
  message: string;
}

export interface CheckInResponse extends MessageResponse {
  all_ready: boolean;
  checked_in_count: number;
  total_count: number;
}

/** 💡 추가: 체크인 현황 상세 응답 */
export interface CapsuleCheckInStatusResponse {
  capsule_id: string;
  title: string;
  status: string;
  total_count: number;
  checked_in_count: number;
  is_all_checked_in: boolean;
  members: CheckInMemberStatus[];
}