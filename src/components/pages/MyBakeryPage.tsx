import { useState } from 'react';
import './MyBakeryPage.css';

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
  const [saved, setSaved] = useState(MOCK_SAVED);

  const handleRemove = (id: string) => {
    setSaved(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="my-bakery-page">
      <div className="my-bakery-header">
        <h2 className="my-bakery-title">💛 마이빵집</h2>
        <p className="my-bakery-subtitle">스크랩한 빵집 {saved.length}곳</p>
      </div>

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
    </div>
  );
}
