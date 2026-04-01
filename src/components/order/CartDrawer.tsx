import { useState } from 'react';
import { useCartContext } from '../../context/CartContext';
import { formatPrice } from '../../utils/format';
import { mockBakeries } from '../../mock/bakeries';
import CheckoutPage from './CheckoutPage';
import './CartDrawer.css';

export default function CartDrawer() {
  const {
    items, bakeryId, isCartOpen, setCartOpen,
    removeItem, updateQuantity, clearCart,
    total,
    orderPlaced, resetOrder,
  } = useCartContext();
  const [showCheckout, setShowCheckout] = useState(false);

  if (!isCartOpen) return null;

  // 결제 페이지 표시
  if (showCheckout) {
    return <CheckoutPage onClose={() => { setShowCheckout(false); setCartOpen(false); resetOrder(); }} />;
  }

  const bakery = mockBakeries.find(b => b.id === bakeryId);

  return (
    <div className="cart-overlay" onClick={() => setCartOpen(false)}>
      <div className="cart-drawer" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <h2 className="cart-title">🛒 포장주문</h2>
          <button className="cart-close" onClick={() => setCartOpen(false)}>✕</button>
        </div>

        {orderPlaced ? (
          <div className="cart-success">
            <span className="success-icon">✅</span>
            <h3>주문이 완료되었습니다!</h3>
            <p>{bakery?.name}에서 포장 준비 중입니다.</p>
            <p className="success-note">매장에 방문하여 수령해주세요.</p>
            <button className="cart-done-btn" onClick={resetOrder}>확인</button>
          </div>
        ) : items.length === 0 ? (
          <div className="cart-empty">
            <span className="empty-cart-icon">🧺</span>
            <p>장바구니가 비어있습니다.</p>
            <p className="empty-hint">입점 빵집의 메뉴를 담아보세요!</p>
          </div>
        ) : (
          <>
            {bakery && (
              <div className="cart-bakery-info">
                <span>{bakery.type === 'franchise' ? '🏪' : '🏠'}</span>
                <span className="cart-bakery-name">{bakery.name}</span>
              </div>
            )}

            <div className="cart-items">
              {items.map(item => (
                <div key={item.menuItemId} className="cart-item">
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.name}</span>
                    <span className="cart-item-price">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                  <div className="cart-item-controls">
                    <button className="qty-btn" onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}>-</button>
                    <span className="qty-value">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}>+</button>
                    <button className="remove-btn" onClick={() => removeItem(item.menuItemId)}>🗑</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-row total">
                <span>결제금액</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="cart-actions">
              <button className="cart-clear-btn" onClick={clearCart}>비우기</button>
              <button className="cart-order-btn" onClick={() => setShowCheckout(true)}>
                {formatPrice(total)} 결제하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
