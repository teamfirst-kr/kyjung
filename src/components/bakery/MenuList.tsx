import { mockMenus } from '../../mock/menus';
import { formatPrice } from '../../utils/format';
import { useCartContext } from '../../context/CartContext';
import { useState } from 'react';
import Toast from '../common/Toast';
import './MenuList.css';

interface Props {
  bakeryId: string;
  isRegistered: boolean;
}

export default function MenuList({ bakeryId, isRegistered }: Props) {
  const menus = mockMenus.filter(m => m.bakeryId === bakeryId);
  const { addItem, clearCart } = useCartContext();
  const [showConflict, setShowConflict] = useState(false);
  const [pendingItem, setPendingItem] = useState<typeof menus[0] | null>(null);
  const [showToast, setShowToast] = useState(false);

  if (menus.length === 0) return null;

  function handleAdd(item: typeof menus[0]) {
    const success = addItem({
      menuItemId: item.id,
      bakeryId: item.bakeryId,
      name: item.name,
      price: item.price,
      quantity: 1,
    });
    if (!success) {
      setPendingItem(item);
      setShowConflict(true);
    } else {
      setShowToast(true);
    }
  }

  function handleClearAndAdd() {
    clearCart();
    if (pendingItem) {
      addItem({
        menuItemId: pendingItem.id,
        bakeryId: pendingItem.bakeryId,
        name: pendingItem.name,
        price: pendingItem.price,
        quantity: 1,
      });
    }
    setShowConflict(false);
    setPendingItem(null);
  }

  const categories = [...new Set(menus.map(m => m.category))];

  return (
    <div className="menu-list">
      <h3 className="section-title">🍰 메뉴</h3>

      {!isRegistered && (
        <div className="menu-not-registered">
          <p>📋 이 매장은 아직 입점 전이라 포장주문이 불가합니다.</p>
          <p className="not-registered-hint">매장에 직접 방문해주세요!</p>
        </div>
      )}

      {showConflict && (
        <div className="menu-conflict">
          <p>다른 빵집의 장바구니가 있습니다. 비우고 추가할까요?</p>
          <div className="conflict-actions">
            <button className="conflict-btn yes" onClick={handleClearAndAdd}>비우고 추가</button>
            <button className="conflict-btn no" onClick={() => setShowConflict(false)}>취소</button>
          </div>
        </div>
      )}

      {categories.map(cat => (
        <div key={cat} className="menu-category">
          <h4 className="category-name">{cat}</h4>
          <div className="menu-items">
            {menus.filter(m => m.category === cat).map(item => (
              <div key={item.id} className={`menu-item ${item.isPopular ? 'popular' : ''}`}>
                <span className="menu-emoji">{item.imageEmoji}</span>
                <div className="menu-info">
                  <div className="menu-name-row">
                    <span className="menu-name">{item.name}</span>
                    {item.isPopular && <span className="popular-badge">인기</span>}
                  </div>
                  <span className="menu-desc">{item.description}</span>
                  <span className="menu-price">{formatPrice(item.price)}</span>
                </div>
                {isRegistered && (
                  <button className="menu-add-btn" onClick={() => handleAdd(item)}>
                    담기
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      {showToast && <Toast message="장바구니에 담겼어요" onClose={() => setShowToast(false)} />}
    </div>
  );
}
