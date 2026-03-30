import { useState } from 'react';
import './EventPage.css';

interface EventItem {
  id: string;
  type: 'coupon' | 'event' | 'stamp';
  title: string;
  description: string;
  period: string;
  badge: string;
  badgeColor: string;
  claimed: boolean;
}

const MOCK_EVENTS: EventItem[] = [
  {
    id: 'e1',
    type: 'coupon',
    title: '신규가입 첫 주문 2,000원 할인',
    description: '빵맵에 회원가입하고 첫 포장주문 시 2,000원 할인 쿠폰을 드려요!',
    period: '2026.03.01 ~ 2026.04.30',
    badge: '쿠폰',
    badgeColor: '#FF7043',
    claimed: false,
  },
  {
    id: 'e2',
    type: 'event',
    title: '봄맞이 빵집 투어 챌린지',
    description: '입점 빵집 5곳 방문 인증하면 스타벅스 아메리카노 기프티콘 증정! 빵맵에서 방문 체크하세요.',
    period: '2026.03.15 ~ 2026.04.15',
    badge: '챌린지',
    badgeColor: '#AB47BC',
    claimed: false,
  },
  {
    id: 'e3',
    type: 'stamp',
    title: '빵 도장 모으기',
    description: '입점 빵집에서 포장주문 3회 완료 시 3,000원 할인 쿠폰! 5회 완료 시 5,000원 쿠폰!',
    period: '상시 이벤트',
    badge: '스탬프',
    badgeColor: '#42A5F5',
    claimed: false,
  },
  {
    id: 'e4',
    type: 'coupon',
    title: '리뷰 작성 500원 적립',
    description: '포장주문 후 리뷰를 작성하면 500원 적립금을 드립니다. 사진 리뷰 작성 시 1,000원!',
    period: '상시 이벤트',
    badge: '적립',
    badgeColor: '#66BB6A',
    claimed: false,
  },
  {
    id: 'e5',
    type: 'event',
    title: '빵맵 X 성심당 콜라보',
    description: '빵맵 앱으로 성심당 포장주문 시 튀김소보로 1개 추가 증정 이벤트!',
    period: '2026.04.01 ~ 2026.04.07',
    badge: '콜라보',
    badgeColor: '#EF5350',
    claimed: false,
  },
  {
    id: 'e6',
    type: 'coupon',
    title: '친구 초대 이벤트',
    description: '친구를 초대하면 나도 친구도 1,000원 할인 쿠폰! 초대 횟수 무제한!',
    period: '상시 이벤트',
    badge: '초대',
    badgeColor: '#FFA726',
    claimed: false,
  },
];

export default function EventPage() {
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [filter, setFilter] = useState<'all' | 'coupon' | 'event' | 'stamp'>('all');

  const filtered = filter === 'all' ? events : events.filter(e => e.type === filter);

  const handleClaim = (id: string) => {
    setEvents(prev => prev.map(e =>
      e.id === id ? { ...e, claimed: true } : e
    ));
  };

  return (
    <div className="event-page">
      <div className="event-header">
        <h2 className="event-title">🎁 이벤트</h2>
        <p className="event-subtitle">쿠폰 받고, 이벤트 참여하고, 혜택 누리세요!</p>
      </div>

      <div className="event-filters">
        <button
          className={`event-filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >전체</button>
        <button
          className={`event-filter-btn ${filter === 'coupon' ? 'active' : ''}`}
          onClick={() => setFilter('coupon')}
        >🎟️ 쿠폰</button>
        <button
          className={`event-filter-btn ${filter === 'event' ? 'active' : ''}`}
          onClick={() => setFilter('event')}
        >🎉 이벤트</button>
        <button
          className={`event-filter-btn ${filter === 'stamp' ? 'active' : ''}`}
          onClick={() => setFilter('stamp')}
        >📌 스탬프</button>
      </div>

      <div className="event-list">
        {filtered.map(item => (
          <div key={item.id} className={`event-card ${item.claimed ? 'claimed' : ''}`}>
            <div className="event-card-top">
              <span className="event-badge" style={{ background: item.badgeColor }}>
                {item.badge}
              </span>
              <span className="event-period">{item.period}</span>
            </div>
            <h3 className="event-card-title">{item.title}</h3>
            <p className="event-card-desc">{item.description}</p>
            <button
              className={`event-claim-btn ${item.claimed ? 'claimed' : ''}`}
              onClick={() => handleClaim(item.id)}
              disabled={item.claimed}
            >
              {item.claimed ? '참여 완료 ✓' : item.type === 'coupon' ? '쿠폰 받기' : item.type === 'stamp' ? '도장 확인' : '참여하기'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
