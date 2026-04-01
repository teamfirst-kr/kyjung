import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/payment — PortOne 결제 검증
 *
 * Body: { paymentId, orderId, expectedAmount }
 *
 * 1. PortOne V2 API로 결제 상태 조회
 * 2. 금액 일치 + status === 'PAID' 확인
 * 3. 검증 통과 → { success: true }
 *
 * 환경변수: PORTONE_API_SECRET (PortOne V2 API Secret)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiSecret = process.env.PORTONE_API_SECRET || '';

  // ── 데모 모드 (API Secret 미설정) ──
  if (!apiSecret) {
    console.log('[Payment] 데모 모드 — API Secret 미설정, 자동 승인');
    return res.status(200).json({
      success: true,
      demo: true,
      message: '데모 모드: 결제 자동 승인됨',
    });
  }

  const { paymentId, orderId, expectedAmount } = req.body || {};

  if (!paymentId || !orderId || !expectedAmount) {
    return res.status(400).json({
      success: false,
      error: '필수 파라미터 누락: paymentId, orderId, expectedAmount',
    });
  }

  try {
    // PortOne V2 API — 결제 조회
    const paymentRes = await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
      {
        headers: {
          'Authorization': `PortOne ${apiSecret}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!paymentRes.ok) {
      const errData = await paymentRes.json().catch(() => ({}));
      return res.status(400).json({
        success: false,
        error: `PortOne API 오류: ${paymentRes.status}`,
        detail: errData,
      });
    }

    const payment = await paymentRes.json();

    // ── 결제 상태 확인 ──
    if (payment.status !== 'PAID') {
      return res.status(400).json({
        success: false,
        error: `결제 상태 불일치: ${payment.status} (expected: PAID)`,
      });
    }

    // ── 금액 검증 ──
    const paidAmount = payment.amount?.total;
    if (paidAmount !== expectedAmount) {
      // 위변조 감지 → 결제 취소 처리
      console.error(`[Payment] 금액 위변조 감지: paid=${paidAmount}, expected=${expectedAmount}`);
      await cancelPayment(apiSecret, paymentId, '금액 위변조 감지');
      return res.status(400).json({
        success: false,
        error: `결제 금액 불일치 (${paidAmount} ≠ ${expectedAmount}). 결제가 자동 취소되었습니다.`,
      });
    }

    // ── 검증 통과 ──
    // 실제 운영에서는 여기서 DB에 주문 기록 저장
    console.log(`[Payment] 검증 성공: order=${orderId}, amount=${paidAmount}`);

    return res.status(200).json({
      success: true,
      paymentId,
      orderId,
      amount: paidAmount,
      // 매장 정산 정보 (10% 수수료)
      settlement: {
        commission: Math.round(paidAmount * 0.10),
        storeAmount: paidAmount - Math.round(paidAmount * 0.10),
      },
    });
  } catch (error) {
    console.error('[Payment] 결제 검증 실패:', error);
    return res.status(500).json({
      success: false,
      error: '결제 검증 서버 오류',
      detail: String(error),
    });
  }
}

// ── 결제 취소 (위변조 감지 시) ─────────────────────────────
async function cancelPayment(apiSecret: string, paymentId: string, reason: string) {
  try {
    await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(paymentId)}/cancel`,
      {
        method: 'POST',
        headers: {
          'Authorization': `PortOne ${apiSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      }
    );
  } catch (err) {
    console.error('[Payment] 취소 실패:', err);
  }
}
