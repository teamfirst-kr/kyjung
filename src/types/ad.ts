export interface AdBanner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  type: 'top' | 'sidebar' | 'product' | 'popup' | 'bottom';
  // 관리자 필드
  startDate?: string;
  endDate?: string;
  frequency?: 'always' | 'daily' | 'weekly';
  isActive?: boolean;
  advertiser?: string;
  cost?: number;
  impressions?: number;
  clicks?: number;
}
