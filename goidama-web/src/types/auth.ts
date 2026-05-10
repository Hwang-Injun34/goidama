export interface UserSummary {
  id: string; // uuid
  nickname: string;
  profile_image_url?: string | null;
}

export interface UserMeResponse extends UserSummary {
  friend_code: string;
  created_at: string; // ISO string
}

// 💡 백엔드 LoginResponse 모델과 일치화
export interface LoginResponse {
  access_token: string;
  user_id: string;
  token_type: string;
}

export interface MessageResponse {
  status: string;
  message: string;
}