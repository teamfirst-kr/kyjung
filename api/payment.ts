import type { VercelRequest, VercelResponse } from '@vercel/node';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require('@supabase/supabase-js');

/**
 * POST /api/payment — PortOne 결제 검증 + DB 저장
 *
 * Body: { paymentId, orderId, expectedAmount, userId?, bakeryId?, items?, pickupTime?, memo? }
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabaseAdmin(): any | null {
  const url = process.env.VITE_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) return null;
  return createClient(url, key);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiSecret = process.env.PORTONE_API_SECRET || '';
  const supabase  = getSupabaseAdmin();

  const {
    paymentId,
    orderId,
    expectedAmount,
    userId,
    bakeryId,
    items,
    subtotal,
    pickupTime,
    memo,
    payMethod,
    easyPayProvider,
  } = req.body || {};

  // ── 데모 모드 ──────────────────────────────────────────────
  if (!apiSecret) {
    if (supabase && userId && bakeryId) {
      await saveOrderAndPayment(supabase, {
        orderId,
        userId,
        bakeryId,
        items: items || [],
        subtotal: subtotal || expectedAmount || 0,
        total:    expectedAmount || 0,
        paymentId: paymentId || `demo-${Date.now()}`,
        amount:   expectedAmount || 0,
        payMethod: payMethod || '',
        easyPayProvider: easyPayProvider || '',
        isDemo: true,
        pickupTime,
        memo,
      });
    }
    return res.status(200).json({ success: true, demo: true, message: '데모 모드: 결제 자동 승인됨' });
  }

  if (!paymentId || !orderId || !expectedAmount) {
    return res.status(400).json({ success: false, error: '필수 파라미터 누락' });
  }

  try {
    // ── PortOne V2 결제 조회 ────────────────────────────────
    const paymentRes = await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
      { headers: { Authorization: `PortOne ${apiSecret}`, 'Content-Type': 'application/json' } }
    );

    if (!paymentRes.ok) {
      const errData = await paymentRes.json().catch(() => ({}));
      return res.status(400).json({ success: false, error: `PortOne API 오류: ${paymentRes.status}`, detail: errData });
    }

    const payment = await paymentRes.json();

    if (payment.status !== 'PAID') {
      return res.status(400).json({ success: false, error: `결제 상태 불일치: ${payment.status}` });
    }

    const paidAmount = payment.amount?.total;
    if (paidAmount !== expectedAmount) {
      console.error(`[Payment] 금액 위변조: paid=${paidAmount}, expected=${expectedAmount}`);
      await cancelPayment(apiSecret, paymentId, '금액 위변조 감지');
      return res.status(400).json({ success: false, error: `결제 금액 불일치. 자동 취소됨.` });
    }

    // ── DB 저장 ────────────────────────────────────────────
    if (supabase && userId && bakeryId) {
      await saveOrderAndPayment(supabase, {
        orderId,
        userId,
        bakeryId,
        items: items || [],
        subtotal: subtotal || paidAmount,
        total:    paidAmount,
        paymentId,
        amount:   paidAmount,
        payMethod:        payment.method?.type || payMethod || '',
        easyPayProvider:  payment.method?.easyPay?.easyPayProvider || easyPayProvider || '',
        isDemo: false,
        pickupTime,
        memo,
      });
    }

    const commission  = Math.round(paidAmount * 0.10);
    const storeAmount = paidAmount - commission;

    return res.status(200).json({
      success: true,
      paymentId,
      orderId,
      amount: paidAmount,
      settlement: { commission, storeAmount },
    });

  } catch (error) {
    console.error('[Payment] 오류:', error);
    return res.status(500).json({ success: false, error: '결제 검증 서버 오류', detail: String(error) });
  }
}

// ── 주문 + 결제 + 정산 DB 저장 ───────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function saveOrderAndPayment(supabase: any, opts: {
  orderId: string;
  userId: string;
  bakeryId: string;
  items: unknown[];
  subtotal: number;
  total: number;
  paymentId: string;
  amount: number;
  payMethod: string;
  easyPayProvider: string;
  isDemo: boolean;
  pickupTime?: string;
  memo?: string;
}) {
  const commission = Math.round(opts.total * 0.10);

  // 주문 upsert (이미 있을 수 있으므로)
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .upsert({
      id:          opts.orderId,
      user_id:     opts.userId,
      bakery_id:   opts.bakeryId,
      items:       opts.items,
      subtotal:    opts.subtotal,
      commission,
      total:       opts.total,
      status:      'pending',
      pickup_time: opts.pickupTime || null,
      memo:        opts.memo || '',
    }, { onConflict: 'id' })
    .select('id')
    .single();

  if (orderErr) {
    console.error('[Payment] 주문 저장 실패:', orderErr.message);
    return;
  }

  const dbOrderId = order?.id || opts.orderId;

  // 결제 기록
  await supabase.from('payments').upsert({
    order_id:            dbOrderId,
    user_id:             opts.userId,
    portone_payment_id:  opts.paymentId,
    amount:              opts.amount,
    status:              'paid',
    pay_method:          opts.payMethod,
    easy_pay_provider:   opts.easyPayProvider,
    is_demo:             opts.isDemo,
    paid_at:             new Date().toISOString(),
  }, { onConflict: 'portone_payment_id' });

  // 정산 기록
  await supabase.from('settlements').insert({
    bakery_id:    opts.bakeryId,
    order_id:     dbOrderId,
    gross_amount: opts.total,
    commission,
    net_amount:   opts.total - commission,
    status:       'pending',
  }).match({ order_id: dbOrderId });
}

// ── 결제 취소 ─────────────────────────────────────────────────
async function cancelPayment(apiSecret: string, paymentId: string, reason: string) {
  try {
    await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}/cancel`, {
      method: 'POST',
      headers: { Authorization: `PortOne ${apiSecret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
  } catch (err) {
    console.error('[Payment] 취소 실패:', err);
  }
}
