// 빵맵 판매 수수료: 10%
// 소비자 결제 금액에서 PG 수수료 + 빵맵 수수료를 차감한 금액이 매장에 정산됩니다.
export const COMMISSION_RATE = 0.10;

/** 수수료 금액 (매장 정산 시 차감) */
export function calculateCommission(subtotal: number): number {
  return Math.round(subtotal * COMMISSION_RATE);
}

/** 매장 정산 금액 = 결제금액 - 수수료 */
export function calculateSettlement(subtotal: number): number {
  return subtotal - calculateCommission(subtotal);
}
