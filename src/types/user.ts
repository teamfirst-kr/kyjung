export type UserRole = 'consumer' | 'seller' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  bakery_id?: string;       // 판매자인 경우 연결된 매장 ID
  created_at: string;
  provider?: 'kakao' | 'google' | 'naver' | 'email';
}
