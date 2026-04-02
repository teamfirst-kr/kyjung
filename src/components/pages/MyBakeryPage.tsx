import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './MyBakeryPage.css';

type MyTab = 'saved' | 'orders';

interface SavedBakery {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  memo: string;
  savedAt: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  pickup_time: string | null;
  memo: string;
  created_at: string;
  bakery_id: string;
  payments?: { pay_method: string; is_demo: boolean }[];
}

const STATUS_LABEL: Record<string, string> = {
  pending:    '결제완료',
  confirmed:  '주문확인',
  preparing:  '준비중',
  ready:      '수령준비완료',
  completed:  '수령완료',
  cancelled:  '취소됨',
};

const STATUS_COLOR: Record<string, string> = {
  pending:   '#FF9800',
  confirmed: '#2196F3',
  preparing: '#9C27B0',
  ready:     '#4CAF50',
  completed: '#777',
  cancelled: '#f44336',
};

const MOCK_SAVED: SavedBakery[] = [
  {
    id: 's1',
    name: '성심당 서울팝업',
    address: '용산구 한강대로 23길 55',
    rating: 4.9,
    reviewCount: 892,
    tags: ['튀김소보로', '부추빵'],
    memo: '주말에 꼭 가보기!',
    savedAt: '2026-03-28',
  },
  {
    id: 's2',
    name: '밀도',
    address: '종로구 북촌로 4길 18',
    rating: 4.8,
    reviewCount: 342,
    tags: ['우유식빵', '크림빵'],
    memo: '식빵 예약 필수',
    savedAt: '2026-03-25',
  },
  {
    id: 's3',
    name: '런던베이글뮤지엄',
    address: '종로구 북촌로 46',
    rating: 4.6,
    reviewCount: 1203,
    tags: ['플레인베이글', '어니언베이글'],
    memo: '',
    savedAt: '2026-03-20',
  },
];

export default function MyBakeryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<MyTab>('saved');
  const [saved, setSaved] = useState(MOCK_SAVED);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab !== 'orders') return;
    if (!user?.id) return;
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user?.id]);

  const fetchOrders = async () => {
    if (!user?.id) return;
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const res = await fetch(`/api/orders?userId=${encodeURIComponent(user.id)}&limit=30`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '주문 내역을 불러올 수 없습니다');
      setOrders(json.orders || []);
    } catch (e) {
      setOrdersError(e instanceof Error ? e.message : '오류가 발생했습니다');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleRemove = (id: string) => {
    setSaved(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="my-bakery-page">
      <div className="my-bakery-header">
        <h2 className="my-bakery-title">💛 마이빵집</h2>

        {/* 탭 */}
        <div className="my-bakery-tabs">
          <button
            className={`my-bakery-tab ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            🏠 저장한 빵집
          </button>
          <button
            className={`my-bakery-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 주문내역
          </button>
        </div>
      </div>

      {/* ── 저장한 빵집 탭 ── */}
      {activeTab === 'saved' && (
        <>
          <p className="my-bakery-subtitle">스크랩한 빵집 {saved.length}곳</p>
          {saved.length === 0 ? (
            <div className="my-bakery-empty">
              <span className="empty-icon">🍞</span>
              <p className="empty-text">스크랩한 빵집이 없어요</p>
              <p className="empty-hint">빵맵에서 마음에 드는 빵집을 저장해보세요!</p>
            </div>
          ) : (
            <div className="my-bakery-list">
              {saved.map(bakery => (
                <div key={bakery.id} className="my-bakery-card">
                  <div className="my-bakery-card-top">
                    <div className="my-bakery-info">
                      <h3 className="my-bakery-name">🏠 {bakery.name}</h3>
                      <div className="my-bakery-rating">
                        ⭐ {bakery.rating} ({bakery.reviewCount})
                      </div>
                      <p className="my-bakery-address">{bakery.address}</p>
                    </div>
                    <button
                      className="my-bakery-remove"
                      onClick={() => handleRemove(bakery.id)}
                      title="스크랩 해제"
                    >
                      💛
                    </button>
                  </div>
                  <div className="my-bakery-tags">
                    {bakery.tags.map(tag => (
                      <span key={tag} className="my-bakery-tag">{tag}</span>
                    ))}
                  </div>
                  {bakery.memo && (
                    <div className="my-bakery-memo">
                      📌 {bakery.memo}
                    </div>
                  )}
                  <div className="my-bakery-card-footer">
                    <span className="my-bakery-saved-date">저장일: {bakery.savedAt}</span>
                    <button className="my-bakery-visit-btn">빵맵에서 보기</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── 주문내역 탭 ── */}
      {activeTab === 'orders' && (
        <div className="my-orders-section">
          {!user ? (
            <div className="my-bakery-empty">
              <span className="empty-icon">🔐</span>
              <p className="empty-text">로그인이 필요합니다</p>
            </div>
          ) : ordersLoading ? (
            <div className="my-bakery-empty">
              <span className="empty-icon" style={{ fontSize: 32 }}>⏳</span>
              <p className="empty-text">주문 내역을 불러오는 중...</p>
            </div>
          ) : ordersError ? (
            <div className="my-bakery-empty">
              <span className="empty-icon">⚠️</span>
              <p className="empty-text">{ordersError}</p>
              <button className="my-bakery-visit-btn" style={{ marginTop: 12 }} onClick={fetchOrders}>
                다시 시도
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="my-bakery-empty">
              <span className="empty-icon">📦</span>
              <p className="empty-text">주문 내역이 없어요</p>
              <p className="empty-hint">빵집에서 빵을 주문해보세요!</p>
            </div>
          ) : (
            <div className="my-orders-list">
              {orders.map(order => {
                const itemList = Array.isArray(order.items) ? order.items : [];
                const payMethod = order.payments?.[0]?.pay_method || '';
                const isDemo = order.payments?.[0]?.is_demo;
                const dateStr = new Date(order.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                });
                return (
                  <div key={order.id} className="my-order-card">
                    <div className="my-order-header">
                      <span
                        className="my-order-status"
                        style={{ color: STATUS_COLOR[order.status] || '#333' }}
                      >
                        ● {STATUS_LABEL[order.status] || order.status}
                      </span>
                      <span className="my-order-date">{dateStr}</span>
                    </div>

                    <div className="my-order-items">
                      {itemList.map((item, i) => (
                        <div key={i} className="my-order-item-row">
                          <span>{item.name}</span>
                          <span>{item.quantity}개 · ₩{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="my-order-footer">
                      <div className="my-order-total">
                        총 <strong>₩{order.total.toLocaleString()}</strong>
                        {payMethod && <span className="my-order-pay-method"> · {payMethod}</span>}
                        {isDemo && <span className="my-order-demo-badge">데모</span>}
                      </div>
                      {order.pickup_time && (
                        <div className="my-order-pickup">🕐 수령: {order.pickup_time}</div>
                      )}
                      {order.memo && (
                        <div className="my-order-memo">📌 {order.memo}</div>
                      )}
                    </div>

                    <div className="my-order-id">주문번호: {order.id.slice(0, 16)}...</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
