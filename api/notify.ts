import type { VercelRequest, VercelResponse } from '@vercel/node';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require('@supabase/supabase-js');

/**
 * POST /api/notify — 이메일/앱 알림 발송
 * Body: { userId?, email?, subject, message, type? }
 *
 * 환경변수: RESEND_API_KEY (https://resend.com 에서 발급)
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, email: directEmail, subject, message, type = 'general' } = req.body || {};

  if (!subject || !message) {
    return res.status(400).json({ error: 'subject, message 필수' });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const supabase  = getSupabaseAdmin();
  const results: Record<string, unknown> = {};

  // 1) 앱 내 알림 저장 (notifications 테이블)
  if (userId) {
    try {
      await supabase.from('notifications').insert({
        user_id: userId,
        type,
        title:   subject,
        message,
        is_read: false,
      });
      results.inApp = 'saved';
    } catch {
      results.inApp = 'skipped';
    }
  }

  // 2) 이메일 발송 (Resend)
  let toEmail = directEmail;
  if (!toEmail && userId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();
    toEmail = profile?.email;
  }

  if (toEmail && resendKey) {
    try {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization:  `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from:    '빵맵 <noreply@bbangmap.co.kr>',
          to:      [toEmail],
          subject,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
              <div style="background:#C47D52;color:white;padding:16px 24px;border-radius:12px 12px 0 0">
                <h2 style="margin:0;font-size:20px">🍞 빵맵</h2>
              </div>
              <div style="background:white;padding:24px;border:1px solid #f0ece8;border-radius:0 0 12px 12px">
                <h3 style="color:#333;margin-top:0">${subject}</h3>
                <p style="color:#555;line-height:1.6">${message}</p>
                <hr style="border:none;border-top:1px solid #f0ece8;margin:20px 0">
                <p style="color:#aaa;font-size:12px">빵맵 — 전국 빵집 탐방 앱</p>
              </div>
            </div>
          `,
        }),
      });
      results.email = emailRes.ok ? 'sent' : `failed(${emailRes.status})`;
    } catch (e) {
      results.email = `error: ${e}`;
    }
  } else if (!resendKey) {
    results.email = 'skipped (RESEND_API_KEY 미설정)';
  } else {
    results.email = 'skipped (이메일 주소 없음)';
  }

  return res.status(200).json({ success: true, results });
}
