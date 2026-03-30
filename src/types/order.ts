export interface CartItem {
  menuItemId: string;
  bakeryId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderSummary {
  subtotal: number;
  commission: number;
  total: number;
  bakeryId: string;
  items: CartItem[];
}
