import type { VercelRequest, VercelResponse } from '@vercel/node';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require('@supabase/supabase-js');

/**
 * POST /api/portone-webhook — PortOne V2 웹훅 수신
 * PortOne 콘솔에서 웹훅 URL을 https://bakery-app-wheat.vercel.app/api/portone-webhook 으로 설정
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  const { type, data } = req.body || {};
  console.log('[Webhook] 수신:', type, data?.paymentId);

  try {
    if (type === 'Transaction.Paid') {
      const paymentId = data?.paymentId;
      if (!paymentId) return res.status(200).json({ received: true });

      // 결제 상태 업데이트
      await supabase
        .from('payments')
        .update({ status: 'paid' })
        .eq('portone_payment_id', paymentId);

      // 연결된 주문 확인 후 confirmed 처리
      const { data: payment } = await supabase
        .from('payments')
        .select('order_id')
        .eq('portone_payment_id', paymentId)
        .single();

      if (payment?.order_id) {
        await supabase
          .from('orders')
          .update({ status: 'confirmed' })
          .eq('id', payment.order_id);
      }

    } else if (type === 'Transaction.Cancelled') {
      const paymentId = data?.paymentId;
      if (!paymentId) return res.status(200).json({ received: true });

      await supabase
        .from('payments')
        .update({ status: 'cancelled' })
        .eq('portone_payment_id', paymentId);

      const { data: payment } = await supabase
        .from('payments')
        .select('order_id')
        .eq('portone_payment_id', paymentId)
        .single();

      if (payment?.order_id) {
        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', payment.order_id);

        // 정산도 취소 처리
        await supabase
          .from('settlements')
          .update({ status: 'cancelled' })
          .eq('order_id', payment.order_id);
      }

    } else if (type === 'Transaction.Failed') {
      const paymentId = data?.paymentId;
      if (paymentId) {
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('portone_payment_id', paymentId);
      }
    }

  } catch (err) {
    console.error('[Webhook] 처리 오류:', err);
    // 웹훅은 200 응답해야 재전송 방지
    return res.status(200).json({ received: true, error: String(err) });
  }

  return res.status(200).json({ received: true });
}
