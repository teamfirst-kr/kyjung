import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { CartItem } from '../types/order';

export interface OrderPayload {
  user_id: string;
  bakery_id: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  pickup_time?: string;
  memo?: string;
}

export interface Order {
  id: string;
  user_id: string;
  bakery_id: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  created_at: string;
  pickup_time?: string;
  memo?: string;
}

/**
 * 주문 생성
 */
export async function createOrder(payload: OrderPayload): Promise<{ id: string | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const demoId = `demo-${Date.now()}`;
    console.log('[데모] 주문 생성:', { ...payload, id: demoId });
    return { id: demoId, error: null };
  }

  const { data, error } = await supabase
    .from('orders')
    .insert([{ ...payload, status: 'pending', created_at: new Date().toISOString() }])
    .select('id')
    .single();

  return { id: data?.id || null, error: error?.message || null };
}

/**
 * 내 주문 목록 조회
 */
export async function fetchMyOrders(userId: string): Promise<Order[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data as Order[];
}

/**
 * 매장 주문 목록 조회 (판매자용)
 */
export async function fetchStoreOrders(bakeryId: string): Promise<Order[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('bakery_id', bakeryId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data as Order[];
}

/**
 * 주문 상태 업데이트 (판매자용)
 */
export async function updateOrderStatus(orderId: string, status: Order['status']) {
  if (!isSupabaseConfigured()) return { error: null };

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  return { error: error?.message || null };
}
