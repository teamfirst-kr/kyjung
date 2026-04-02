import type { VercelRequest, VercelResponse } from '@vercel/node';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require('@supabase/supabase-js');

/**
 * GET /api/settlements?bakeryId=xxx&period=month  — 정산 내역 조회
 * GET /api/settlements?bakeryId=xxx&period=week
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabaseAdmin(): any {
  return createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { bakeryId, period = 'month', limit = '50' } = req.query as Record<string, string>;
  if (!bakeryId) return res.status(400).json({ error: 'bakeryId 필요' });

  const supabase = getSupabaseAdmin();

  // 기간 필터 계산
  const now = new Date();
  let fromDate: string;
  if (period === 'week') {
    const d = new Date(now); d.setDate(d.getDate() - 7);
    fromDate = d.toISOString();
  } else if (period === 'month') {
    const d = new Date(now); d.setMonth(d.getMonth() - 1);
    fromDate = d.toISOString();
  } else if (period === 'all') {
    fromDate = '2000-01-01T00:00:00Z';
  } else {
    // year
    const d = new Date(now); d.setFullYear(d.getFullYear() - 1);
    fromDate = d.toISOString();
  }

  const { data, error } = await supabase
    .from('settlements')
    .select(`
      id, gross_amount, commission, net_amount, status, created_at,
      orders(id, items, pickup_time, created_at)
    `)
    .eq('bakery_id', bakeryId)
    .gte('created_at', fromDate)
    .order('created_at', { ascending: false })
    .limit(parseInt(limit));

  if (error) {
    console.error('[Settlements] 조회 오류:', error.message);
    return res.status(500).json({ error: error.message });
  }

  // 요약 계산
  const settlements = data || [];
  const summary = {
    totalGross:   settlements.reduce((s: number, r: {gross_amount: number}) => s + (r.gross_amount || 0), 0),
    totalComm:    settlements.reduce((s: number, r: {commission: number})    => s + (r.commission   || 0), 0),
    totalNet:     settlements.reduce((s: number, r: {net_amount: number})    => s + (r.net_amount   || 0), 0),
    count:        settlements.length,
    pending:      settlements.filter((r: {status: string}) => r.status === 'pending').length,
    completed:    settlements.filter((r: {status: string}) => r.status === 'completed').length,
  };

  return res.status(200).json({ settlements, summary, period });
}
