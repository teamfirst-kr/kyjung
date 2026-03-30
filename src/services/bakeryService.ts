import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockBakeries } from '../mock/bakeries';
import type { Bakery } from '../types/bakery';

/**
 * 빵집 데이터 조회 — Supabase 설정 시 DB, 미설정 시 목업 데이터 사용
 */
export async function fetchBakeries(): Promise<Bakery[]> {
  if (!isSupabaseConfigured()) {
    return mockBakeries;
  }

  const { data, error } = await supabase
    .from('bakeries')
    .select('*')
    .order('is_premium', { ascending: false })
    .order('rating', { ascending: false });

  if (error) {
    console.error('[bakeryService] DB 조회 실패, 목업 데이터 사용:', error.message);
    return mockBakeries;
  }

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    type: row.type,
    isPremium: row.is_premium,
    address: row.address,
    coordinates: { lat: row.lat, lng: row.lng },
    phone: row.phone,
    hours: { open: row.open_time, close: row.close_time },
    rating: row.rating,
    reviewCount: row.review_count,
    imageUrl: row.image_url || '',
    description: row.description || '',
    bakingSchedule: row.baking_schedule || [],
    tags: row.tags || [],
    isRegistered: row.is_registered,
  }));
}

/**
 * 빵집 등록 (판매자 입점신청)
 */
export async function registerBakery(data: {
  name: string;
  address: string;
  phone: string;
  owner_name: string;
  business_number: string;
  category: string;
  description: string;
}) {
  if (!isSupabaseConfigured()) {
    console.log('[데모] 입점신청:', data);
    return { error: null };
  }

  const { error } = await supabase
    .from('bakery_registrations')
    .insert([{ ...data, status: 'pending', created_at: new Date().toISOString() }]);

  return { error: error?.message || null };
}

/**
 * 빵집 리뷰 조회
 */
export async function fetchReviews(bakeryId: string) {
  if (!isSupabaseConfigured()) {
    const { mockReviews } = await import('../mock/reviews');
    return mockReviews.filter(r => r.bakeryId === bakeryId);
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('bakery_id', bakeryId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

/**
 * 리뷰 작성
 */
export async function submitReview(review: {
  bakery_id: string;
  user_id: string;
  rating: number;
  content: string;
}) {
  if (!isSupabaseConfigured()) {
    console.log('[데모] 리뷰 작성:', review);
    return { error: null };
  }

  const { error } = await supabase.from('reviews').insert([{
    ...review,
    created_at: new Date().toISOString(),
  }]);

  return { error: error?.message || null };
}
