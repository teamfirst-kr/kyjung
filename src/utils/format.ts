export function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원';
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}
