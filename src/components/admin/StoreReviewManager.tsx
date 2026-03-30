import { useState } from 'react';
import './StoreReviewManager.css';

interface StoreApplication {
  id: string;
  storeName: string;
  address: string;
  phone: string;
  ownerName: string;
  businessNumber: string;
  category: string;
  description: string;
  openHours: string;
  photos: number;
  appliedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
}

const INITIAL_APPS: StoreApplication[] = [
  {
    id: 'app1', storeName: '베이크샵 연남', address: '서울 마포구 연남로 11길 23',
    phone: '02-333-4567', ownerName: '김빵순', businessNumber: '123-45-67890',
    category: '베이커리, 카페', description: '천연발효 빵과 수제 디저트를 판매하는 연남동 베이커리',
    openHours: '08:00 - 20:00', photos: 5, appliedAt: '2026-03-29', status: 'pending',
  },
  {
    id: 'app2', storeName: '소금빵 공장', address: '서울 성동구 성수이로 77',
    phone: '02-444-5678', ownerName: '이소금', businessNumber: '234-56-78901',
    category: '베이커리', description: '소금빵 전문점. 매일 아침 갓 구운 소금빵을 제공합니다.',
    openHours: '07:00 - 19:00', photos: 3, appliedAt: '2026-03-28', status: 'pending',
  },
  {
    id: 'app3', storeName: '크로와상 메종', address: '서울 강남구 압구정로 42길 15',
    phone: '02-555-6789', ownerName: '박크루', businessNumber: '345-67-89012',
    category: '베이커리, 디저트', description: '프랑스식 크로와상과 비엔누아즈리 전문점',
    openHours: '09:00 - 21:00', photos: 8, appliedAt: '2026-03-27', status: 'pending',
  },
  {
    id: 'app4', storeName: '밀도 종로점', address: '서울 종로구 삼일대로 28길 10',
    phone: '02-111-2345', ownerName: '최밀가', businessNumber: '456-78-90123',
    category: '베이커리, 식빵', description: '우유식빵과 크림빵으로 유명한 밀도의 새 지점',
    openHours: '08:00 - 20:00', photos: 6, appliedAt: '2026-03-25', status: 'approved',
  },
  {
    id: 'app5', storeName: '무허가 빵집', address: '서울 중구 명동길 99',
    phone: '010-9999-0000', ownerName: '미상', businessNumber: '000-00-00000',
    category: '기타', description: '',
    openHours: '', photos: 0, appliedAt: '2026-03-24', status: 'rejected',
    rejectReason: '사업자등록번호 확인 불가, 매장 정보 미비',
  },
];

export default function StoreReviewManager() {
  const [apps, setApps] = useState(INITIAL_APPS);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedApp, setSelectedApp] = useState<StoreApplication | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);
  const pendingCount = apps.filter(a => a.status === 'pending').length;

  function handleApprove(id: string) {
    setApps(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' as const } : a));
    setSelectedApp(null);
  }

  function handleReject(id: string) {
    if (!rejectReason.trim()) return;
    setApps(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' as const, rejectReason } : a));
    setRejectReason('');
    setSelectedApp(null);
  }

  const STATUS_LABELS = { pending: '심사 대기', approved: '승인', rejected: '반려' };
  const STATUS_COLORS = { pending: '#FFA726', approved: '#66BB6A', rejected: '#EF5350' };

  return (
    <div className="store-review">
      <div className="store-review-top">
        <div className="review-filters">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button key={f} className={`review-filter ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? '전체' : STATUS_LABELS[f]}
              {f === 'pending' && pendingCount > 0 && <span className="pending-count">{pendingCount}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="review-list">
        {filtered.map(app => (
          <div key={app.id} className="review-item" onClick={() => setSelectedApp(app)}>
            <div className="review-item-top">
              <h4 className="review-store-name">{app.storeName}</h4>
              <span className="review-status" style={{ background: STATUS_COLORS[app.status] }}>
                {STATUS_LABELS[app.status]}
              </span>
            </div>
            <div className="review-item-meta">
              <span>📍 {app.address}</span>
              <span>👤 {app.ownerName}</span>
              <span>📅 {app.appliedAt}</span>
            </div>
            <div className="review-item-info">
              <span>📞 {app.phone}</span>
              <span>🏷️ {app.category}</span>
              <span>📸 사진 {app.photos}장</span>
            </div>
            {app.rejectReason && (
              <div className="review-reject-reason">반려 사유: {app.rejectReason}</div>
            )}
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedApp && (
        <div className="review-detail-overlay" onClick={() => setSelectedApp(null)}>
          <div className="review-detail" onClick={e => e.stopPropagation()}>
            <button className="review-detail-close" onClick={() => setSelectedApp(null)}>✕</button>
            <h3>입점 심사 상세</h3>

            <div className="review-detail-grid">
              <div className="rd-field"><span className="rd-label">매장명</span><span className="rd-value">{selectedApp.storeName}</span></div>
              <div className="rd-field"><span className="rd-label">대표자</span><span className="rd-value">{selectedApp.ownerName}</span></div>
              <div className="rd-field"><span className="rd-label">주소</span><span className="rd-value">{selectedApp.address}</span></div>
              <div className="rd-field"><span className="rd-label">연락처</span><span className="rd-value">{selectedApp.phone}</span></div>
              <div className="rd-field"><span className="rd-label">사업자번호</span><span className="rd-value">{selectedApp.businessNumber}</span></div>
              <div className="rd-field"><span className="rd-label">업종</span><span className="rd-value">{selectedApp.category}</span></div>
              <div className="rd-field"><span className="rd-label">영업시간</span><span className="rd-value">{selectedApp.openHours || '미입력'}</span></div>
              <div className="rd-field"><span className="rd-label">사진</span><span className="rd-value">{selectedApp.photos}장 첨부</span></div>
              <div className="rd-field full"><span className="rd-label">매장 소개</span><span className="rd-value">{selectedApp.description || '미입력'}</span></div>
              <div className="rd-field"><span className="rd-label">신청일</span><span className="rd-value">{selectedApp.appliedAt}</span></div>
              <div className="rd-field"><span className="rd-label">상태</span><span className="rd-value" style={{ color: STATUS_COLORS[selectedApp.status] }}>{STATUS_LABELS[selectedApp.status]}</span></div>
            </div>

            {selectedApp.status === 'pending' && (
              <div className="review-actions">
                <button className="review-approve-btn" onClick={() => handleApprove(selectedApp.id)}>
                  ✅ 입점 승인
                </button>
                <div className="review-reject-form">
                  <input
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="반려 사유를 입력하세요"
                  />
                  <button className="review-reject-btn" onClick={() => handleReject(selectedApp.id)}>
                    ❌ 반려
                  </button>
                </div>
              </div>
            )}

            {selectedApp.rejectReason && (
              <div className="review-reject-notice">
                반려 사유: {selectedApp.rejectReason}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
