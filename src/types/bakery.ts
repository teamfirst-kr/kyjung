export const BakeryType = {
  FRANCHISE: 'franchise',
  INDEPENDENT: 'independent',
} as const;

export type BakeryType = (typeof BakeryType)[keyof typeof BakeryType];

export interface BakingScheduleEntry {
  breadType: string;
  bakedAt: string;
  nextBakeAt: string;
}

export interface Bakery {
  id: string;
  name: string;
  type: BakeryType;
  isPremium: boolean;
  address: string;
  coordinates: { lat: number; lng: number };
  phone: string;
  hours: { open: string; close: string };
  rating: number;
  reviewCount: number;
  imageUrl: string;
  description: string;
  bakingSchedule: BakingScheduleEntry[];
  tags: string[];
  isRegistered: boolean; // 입점 여부 - true면 포장주문 가능
}
