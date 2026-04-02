import type { VercelRequest, VercelResponse } from '@vercel/node';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require('@supabase/supabase-js');

/**
 * GET   /api/bakery?bakeryId=xxx   — 매장 정보 조회
 * PATCH /api/bakery                — 매장 정보 수정 { bakeryId, ...fields }
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const supabase = getSupabaseAdmin();

  // ── GET ─────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { bakeryId } = req.query as Record<string, string>;
    if (!bakeryId) return res.status(400).json({ error: 'bakeryId 필요' });

    const { data, error } = await supabase
      .from('bakeries')
      .select('*')
      .eq('id', bakeryId)
      .single();

    if (error) return res.status(404).json({ error: '매장을 찾을 수 없습니다' });
    return res.status(200).json({ bakery: data });
  }

  // ── PATCH ────────────────────────────────────────────────────────
  if (req.method === 'PATCH') {
    const { bakeryId, ...fields } = req.body || {};
    if (!bakeryId) return res.status(400).json({ error: 'bakeryId 필요' });

    // 허용 필드만 업데이트
    const allowed = ['name', 'description', 'phone', 'address', 'open_hours',
                     'category', 'sns_instagram', 'sns_blog', 'image_url'];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (fields[key] !== undefined) updates[key] = fields[key];
    }
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('bakeries')
      .update(updates)
      .eq('id', bakeryId)
      .select()
      .single();

    if (error) {
      console.error('[Bakery] 수정 오류:', error.message);
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ success: true, bakery: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
