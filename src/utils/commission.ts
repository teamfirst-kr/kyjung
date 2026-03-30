const COMMISSION_RATE = 0.05;

export function calculateCommission(subtotal: number): number {
  return Math.round(subtotal * COMMISSION_RATE);
}

export function calculateTotal(subtotal: number): number {
  return subtotal + calculateCommission(subtotal);
}
