/**
 * PortOne(아임포트) V2 결제 서비스
 *
 * 연동 흐름:
 *  1. 프론트: PortOne SDK로 결제창 호출 (requestPayment)
 *  2. 결제 완료 → paymentId 수신
 *  3. 서버: /api/payment  에서 PortOne API로 결제 검증
 *  4. 검증 통과 → 주문 확정
 *
 * 환경변수 (Vercel):
 *   PORTONE_STORE_ID       — PortOne 상점 ID
 *   PORTONE_CHANNEL_KEY    — 결제 채널 키 (PG사별)
 *   PORTONE_API_SECRET     — V2 API Secret (서버용)
 *
 * 테스트 모드:
 *   PortOne 콘솔에서 테스트 채널을 생성하면 실제 결제 없이 테스트 가능
 */

import * as PortOne from '@portone/browser-sdk/v2';

// ── 환경변수 ────────────────────────────────────────────────
const STORE_ID    = import.meta.env.VITE_PORTONE_STORE_ID    || '';
const CHANNEL_KEY = import.meta.env.VITE_PORTONE_CHANNEL_KEY || '';

// ── 결제 요청 파라미터 ──────────────────────────────────────
export interface PaymentRequest {
  orderId: string;         // 고유 주문번호
  orderName: string;       // "소금빵 외 2건"
  totalAmount: number;     // 최종 결제 금액
  payMethod: 'CARD' | 'EASY_PAY';
  easyPayProvider?: 'KAKAOPAY' | 'NAVERPAY' | 'TOSSPAY';
  buyerName?: string;
  buyerTel?: string;
  buyerEmail?: string;
}

// ── 결제 결과 ───────────────────────────────────────────────
export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  error?: string;
}

// ── 결제 요청 (PortOne SDK 호출) ───────────────────────────
export async function requestPayment(req: PaymentRequest): Promise<PaymentResult> {
  // PortOne 설정이 안 되어 있으면 데모 모드
  if (!STORE_ID || !CHANNEL_KEY) {
    console.warn('[Payment] PortOne 설정 없음 → 데모 결제 모드');
    return demoPayment(req);
  }

  try {
    const response = await PortOne.requestPayment({
      storeId: STORE_ID,
      channelKey: CHANNEL_KEY,
      paymentId: `payment-${req.orderId}`,
      orderName: req.orderName,
      totalAmount: req.totalAmount,
      currency: 'CURRENCY_KRW',
      payMethod: req.payMethod,
      ...(req.easyPayProvider ? { easyPay: { easyPayProvider: req.easyPayProvider } } : {}),
      customer: {
        fullName: req.buyerName,
        phoneNumber: req.buyerTel,
        email: req.buyerEmail,
      },
      redirectUrl: window.location.origin + '/payment/complete',
    });

    if (!response || response.code != null) {
      // 사용자 취소 또는 에러
      return {
        success: false,
        error: response?.message || '결제가 취소되었습니다.',
      };
    }

    // 서버에서 결제 검증
    const verified = await verifyPayment(response.paymentId!, req.orderId, req.totalAmount);
    if (!verified.success) {
      return { success: false, error: verified.error || '결제 검증에 실패했습니다.' };
    }

    return {
      success: true,
      paymentId: response.paymentId,
      orderId: req.orderId,
    };
  } catch (err) {
    console.error('[Payment] requestPayment error:', err);
    return { success: false, error: String(err) };
  }
}

// ── 서버 결제 검증 ─────────────────────────────────────────
async function verifyPayment(
  paymentId: string,
  orderId: string,
  expectedAmount: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, orderId, expectedAmount }),
    });
    const data = await res.json();
    return data;
  } catch {
    return { success: false, error: '결제 검증 서버 연결 실패' };
  }
}

// ── 데모 결제 (PortOne 미설정 시) ──────────────────────────
async function demoPayment(req: PaymentRequest): Promise<PaymentResult> {
  // 1.5초 시뮬레이션
  await new Promise(r => setTimeout(r, 1500));
  return {
    success: true,
    paymentId: `demo-${Date.now()}`,
    orderId: req.orderId,
  };
}

// ── 결제수단 매핑 ──────────────────────────────────────────
export function mapPaymentMethod(selected: string): Pick<PaymentRequest, 'payMethod' | 'easyPayProvider'> {
  switch (selected) {
    case 'kakao': return { payMethod: 'EASY_PAY', easyPayProvider: 'KAKAOPAY' };
    case 'naver': return { payMethod: 'EASY_PAY', easyPayProvider: 'NAVERPAY' };
    case 'toss':  return { payMethod: 'EASY_PAY', easyPayProvider: 'TOSSPAY' };
    case 'card':
    default:      return { payMethod: 'CARD' };
  }
}

// ── 주문번호 생성 ──────────────────────────────────────────
export function generateOrderId(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `BB${dateStr}-${rand}`;
}

// ── PortOne 연결 상태 확인 ─────────────────────────────────
export function isPortOneConfigured(): boolean {
  return !!STORE_ID && !!CHANNEL_KEY;
}
