import { useState } from 'react';
import './StoreManagePage.css';

type ManageTab = 'dashboard' | 'menu' | 'baking' | 'reviews' | 'stats';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
}

interface BakingItem {
  id: string;
  breadType: string;
  scheduledTime: string;
  status: '준비중' | '굽는중' | '완료' | '품절';
}

const MOCK_MENUS: MenuItem[] = [
  { id: 'm1', name: '크로와상', price: 3500, category: '페이스트리', isAvailable: true },
  { id: 'm2', name: '소금빵', price: 3000, category: '식사빵', isAvailable: true },
  { id: 'm3', name: '바게트', price: 4000, category: '식사빵', isAvailable: true },
  { id: 'm4', name: '식빵', price: 5000, category: '식사빵', isAvailable: false },
  { id: 'm5', name: '딸기케이크', price: 6500, category: '케이크', isAvailable: true },
  { id: 'm6', name: '앙버터', price: 3800, category: '페이스트리', isAvailable: true },
];

const MOCK_BAKING: BakingItem[] = [
  { id: 'b1', breadType: '크로와상', scheduledTime: '07:00', status: '완료' },
  { id: 'b2', breadType: '소금빵', scheduledTime: '08:30', status: '완료' },
  { id: 'b3', breadType: '바게트', scheduledTime: '10:00', status: '굽는중' },
  { id: 'b4', breadType: '식빵', scheduledTime: '11:00', status: '준비중' },
  { id: 'b5', breadType: '앙버터', scheduledTime: '14:00', status: '준비중' },
];

const STATUS_COLORS: Record<string, string> = {
  '준비중': '#2196F3',
  '굽는중': '#FF9800',
  '완료': '#4CAF50',
  '품절': '#999',
};

export default function StoreManagePage() {
  const [tab, setTab] = useState<ManageTab>('dashboard');
  const [menus, setMenus] = useState(MOCK_MENUS);
  const [bakingList] = useState(MOCK_BAKING);

  const toggleAvailable = (id: string) => {
    setMenus(prev => prev.map(m => m.id === id ? { ...m, isAvailable: !m.isAvailable } : m));
  };

  return (
    <div className="store-manage-page">
      <div className="manage-header">
        <h2 className="manage-title">🏠 매장관리</h2>
        <p className="manage-store-name">빵맵 베이커리 강남점</p>
      </div>

      {/* 탭 메뉴 */}
      <div className="manage-tabs">
        {([
          { key: 'dashboard', label: '대시보드', icon: '📊' },
          { key: 'menu', label: '메뉴관리', icon: '📋' },
          { key: 'baking', label: '굽기현황', icon: '🔥' },
          { key: 'reviews', label: '리뷰관리', icon: '⭐' },
          { key: 'stats', label: '통계', icon: '📈' },
        ] as { key: ManageTab; label: string; icon: string }[]).map(t => (
          <button
            key={t.key}
            className={`manage-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* 대시보드 */}
      {tab === 'dashboard' && (
        <div className="manage-dashboard">
          <div className="manage-stat-grid">
            <div className="manage-stat-card">
              <span className="stat-value-lg">127</span>
              <span className="stat-label">오늘 방문자</span>
            </div>
            <div className="manage-stat-card">
              <span className="stat-value-lg">₩485,000</span>
              <span className="stat-label">오늘 매출</span>
            </div>
            <div className="manage-stat-card">
              <span className="stat-value-lg">23</span>
              <span className="stat-label">오늘 주문</span>
            </div>
            <div className="manage-stat-card">
              <span className="stat-value-lg">4.7</span>
              <span className="stat-label">평균 평점</span>
            </div>
          </div>
          <div className="manage-section">
            <h3 className="section-title">오늘의 알림</h3>
            <div className="manage-alert-list">
              <div className="manage-alert info">📦 새 주문 3건이 접수되었습니다</div>
              <div className="manage-alert warning">⚠️ 식빵 재료가 부족합니다 (밀가루 2kg 남음)</div>
              <div className="manage-alert success">✅ 크로와상 굽기가 완료되었습니다</div>
              <div className="manage-alert info">💬 새 리뷰 2건이 등록되었습니다</div>
            </div>
          </div>
        </div>
      )}

      {/* 메뉴관리 */}
      {tab === 'menu' && (
        <div className="manage-menu-section">
          <div className="manage-section-header">
            <h3 className="section-title">메뉴 목록</h3>
            <button className="manage-add-btn">+ 메뉴 추가</button>
          </div>
          <div className="manage-menu-list">
            {menus.map(menu => (
              <div key={menu.id} className={`manage-menu-item ${!menu.isAvailable ? 'unavailable' : ''}`}>
                <div className="menu-item-info">
                  <span className="menu-item-name">{menu.name}</span>
                  <span className="menu-item-category">{menu.category}</span>
                  <span className="menu-item-price">₩{menu.price.toLocaleString()}</span>
                </div>
                <div className="menu-item-actions">
                  <button
                    className={`menu-toggle ${menu.isAvailable ? 'on' : 'off'}`}
                    onClick={() => toggleAvailable(menu.id)}
                  >
                    {menu.isAvailable ? '판매중' : '품절'}
                  </button>
                  <button className="menu-edit-btn">수정</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 굽기현황 */}
      {tab === 'baking' && (
        <div className="manage-baking-section">
          <div className="manage-section-header">
            <h3 className="section-title">오늘의 베이킹 스케줄</h3>
            <button className="manage-add-btn">+ 스케줄 추가</button>
          </div>
          <div className="baking-timeline">
            {bakingList.map(item => (
              <div key={item.id} className="baking-timeline-item">
                <div className="baking-time">{item.scheduledTime}</div>
                <div className="baking-dot" style={{ background: STATUS_COLORS[item.status] }} />
                <div className="baking-info">
                  <span className="baking-bread">{item.breadType}</span>
                  <span className="baking-status" style={{ color: STATUS_COLORS[item.status] }}>{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 리뷰관리 */}
      {tab === 'reviews' && (
        <div className="manage-reviews-section">
          <h3 className="section-title">최근 리뷰</h3>
          <div className="manage-review-list">
            {[
              { author: '빵순이', rating: 5, text: '크로와상이 정말 맛있어요! 매일 오고 싶네요 ❤️', date: '2026-03-30' },
              { author: '맛집헌터', rating: 4, text: '소금빵 괜찮았지만 가격이 좀 있네요', date: '2026-03-29' },
              { author: '빵덕후', rating: 5, text: '바게트 진짜 미쳤습니다... 겉바속촉의 정석', date: '2026-03-28' },
            ].map((review, i) => (
              <div key={i} className="manage-review-item">
                <div className="review-item-header">
                  <span className="review-author">{review.author}</span>
                  <span className="review-rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  <span className="review-date">{review.date}</span>
                </div>
                <p className="review-text">{review.text}</p>
                <div className="review-actions">
                  <button className="review-reply-btn">답글 달기</button>
                  <button className="review-report-btn">신고</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 통계 */}
      {tab === 'stats' && (
        <div className="manage-stats-section">
          <h3 className="section-title">이번 주 매출 현황</h3>
          <div className="stats-chart">
            {['월', '화', '수', '목', '금', '토', '일'].map((day, i) => {
              const values = [320, 280, 410, 350, 520, 680, 450];
              const height = (values[i] / 700) * 100;
              return (
                <div key={day} className="stats-bar-col">
                  <div className="stats-bar" style={{ height: `${height}%` }}>
                    <span className="stats-bar-value">{values[i]}k</span>
                  </div>
                  <span className="stats-bar-label">{day}</span>
                </div>
              );
            })}
          </div>
          <div className="stats-summary">
            <div className="stats-summary-item">
              <span className="stats-summary-label">이번 주 총매출</span>
              <span className="stats-summary-value">₩3,010,000</span>
            </div>
            <div className="stats-summary-item">
              <span className="stats-summary-label">지난 주 대비</span>
              <span className="stats-summary-value positive">+12.5%</span>
            </div>
            <div className="stats-summary-item">
              <span className="stats-summary-label">인기 메뉴 1위</span>
              <span className="stats-summary-value">크로와상 (142개)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
