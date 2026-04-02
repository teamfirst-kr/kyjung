import type { VercelRequest, VercelResponse } from '@vercel/node';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require('@supabase/supabase-js');

/**
 * GET    /api/admin-approve?status=pending  — 입점 신청 목록
 * POST   /api/admin-approve                 — 승인/거절 { registrationId, action: 'approve'|'reject', rejectReason? }
 *
 * 승인 흐름:
 *   1. bakery_registrations.status = 'approved'
 *   2. bakeries 테이블에 매장 insert
 *   3. profiles.role = 'seller', profiles.bakery_id = new bakery id
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const supabase = getSupabaseAdmin();

  // ── GET: 신청 목록 ────────────────────────────────────────────
  if (req.method === 'GET') {
    const { status = 'all', limit = '50' } = req.query as Record<string, string>;

    let query = supabase
      .from('bakery_registrations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (status !== 'all') query = query.eq('status', status);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ registrations: data || [] });
  }

  // ── POST: 승인 / 거절 ─────────────────────────────────────────
  if (req.method === 'POST') {
    const { registrationId, action, rejectReason } = req.body || {};

    if (!registrationId || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: '잘못된 요청' });
    }

    // 신청 정보 조회
    const { data: reg, error: regErr } = await supabase
      .from('bakery_registrations')
      .select('*')
      .eq('id', registrationId)
      .single();

    if (regErr || !reg) return res.status(404).json({ error: '신청 정보를 찾을 수 없습니다' });
    if (reg.status !== 'pending') return res.status(400).json({ error: '이미 처리된 신청입니다' });

    if (action === 'reject') {
      // ── 거절 처리 ──────────────────────────────────────────
      const { error } = await supabase
        .from('bakery_registrations')
        .update({ status: 'rejected', reject_reason: rejectReason || '', reviewed_at: new Date().toISOString() })
        .eq('id', registrationId);

      if (error) return res.status(500).json({ error: error.message });

      // 알림 발송
      await sendNotification(supabase, reg.user_id, {
        type: 'registration_rejected',
        title: '입점 심사 결과',
        message: `${reg.store_name} 입점 신청이 반려되었습니다. 사유: ${rejectReason || '미입력'}`,
      });

      return res.status(200).json({ success: true, action: 'rejected' });
    }

    if (action === 'approve') {
      // ── 승인 처리 ──────────────────────────────────────────
      // 1) bakeries 테이블에 매장 생성
      const { data: newBakery, error: bakeryErr } = await supabase
        .from('bakeries')
        .insert({
          name:          reg.store_name,
          address:       reg.address || '',
          phone:         reg.phone || '',
          description:   reg.description || '',
          open_hours:    reg.open_hours || '',
          category:      reg.category || '',
          owner_id:      reg.user_id,
          status:        'active',
          lat:           reg.lat || null,
          lng:           reg.lng || null,
        })
        .select('id')
        .single();

      if (bakeryErr || !newBakery) {
        console.error('[AdminApprove] 매장 생성 실패:', bakeryErr?.message);
        return res.status(500).json({ error: '매장 생성 실패: ' + bakeryErr?.message });
      }

      // 2) registration 상태 업데이트
      await supabase
        .from('bakery_registrations')
        .update({
          status:      'approved',
          bakery_id:   newBakery.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', registrationId);

      // 3) profiles role → seller, bakery_id 설정
      await supabase
        .from('profiles')
        .update({ role: 'seller', bakery_id: newBakery.id })
        .eq('id', reg.user_id);

      // 4) 알림 발송
      await sendNotification(supabase, reg.user_id, {
        type: 'registration_approved',
        title: '🎉 입점 승인',
        message: `${reg.store_name} 입점이 승인되었습니다! 이제 빵맵에서 매장을 관리할 수 있습니다.`,
      });

      return res.status(200).json({ success: true, action: 'approved', bakeryId: newBakery.id });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// ── 내부: 간단한 알림 기록 ─────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendNotification(supabase: any, userId: string, payload: {
  type: string; title: string; message: string;
}) {
  try {
    // notifications 테이블이 있으면 저장, 없으면 무시
    await supabase.from('notifications').insert({
      user_id: userId,
      type:    payload.type,
      title:   payload.title,
      message: payload.message,
      is_read: false,
    });
  } catch {
    // 테이블 없어도 무시 (알림은 부가기능)
  }

  // 이메일 알림 (Resend API — 선택)
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, name')
      .eq('id', userId)
      .single();

    if (!profile?.email) return;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    'noreply@bbangmap.co.kr',
        to:      [profile.email],
        subject: payload.title,
        html:    `<p>${payload.message}</p>`,
      }),
    });
  } catch (e) {
    console.warn('[Notify] 이메일 발송 실패:', e);
  }
}
