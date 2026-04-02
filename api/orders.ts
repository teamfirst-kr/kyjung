import type { VercelRequest, VercelResponse } from '@vercel/node';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require('@supabase/supabase-js');

/**
 * GET  /api/orders?userId=xxx          — 소비자 주문 내역
 * GET  /api/orders?bakeryId=xxx        — 판매자 주문 수신 목록
 * PATCH /api/orders                    — 주문 상태 변경 { orderId, status }
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabaseAdmin(): any {
  return createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const supabase = getSupabaseAdmin();

  // ── GET: 주문 목록 조회 ──────────────────────────────────
  if (req.method === 'GET') {
    const { userId, bakeryId, status, limit = '30', offset = '0' } = req.query as Record<string, string>;

    if (!userId && !bakeryId) {
      return res.status(400).json({ error: 'userId 또는 bakeryId 필요' });
    }

    let query = supabase
      .from('orders')
      .select(`
        id, status, items, subtotal, total, commission,
        pickup_time, memo, created_at, updated_at,
        user_id, bakery_id,
        payments(portone_payment_id, pay_method, amount, status, is_demo, paid_at)
      `)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (userId)   query = query.eq('user_id', userId);
    if (bakeryId) query = query.eq('bakery_id', bakeryId);
    if (status)   query = query.eq('status', status);

    const { data, error } = await query;
    if (error) {
      console.error('[Orders] 조회 오류:', error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ orders: data || [] });
  }

  // ── PATCH: 주문 상태 변경 ────────────────────────────────
  if (req.method === 'PATCH') {
    const { orderId, status } = req.body || {};

    if (!orderId || !ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: `잘못된 요청. 상태값: ${ORDER_STATUSES.join(', ')}` });
    }

    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      console.error('[Orders] 상태변경 오류:', error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, orderId, status });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
