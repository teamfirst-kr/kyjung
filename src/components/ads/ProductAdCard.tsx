import { useEffect, useState } from 'react';
import { getTopBakeries, type TopBakery } from '../../utils/bakeryStats';
import './ProductAdCard.css';

// ── 유료 광고 (계약된 광고가 있을 때만 추가) ──
interface PaidProductAd {
  title: string;
  description: string;
  link: string;
}
const PAID_PRODUCT_ADS: PaidProductAd[] = [];

// ── 빵 관련 추천 콘텐츠 ──
const BREAD_RECOMMENDATIONS = [
  { emoji: '🥐', title: '크로와상 맛집 TOP 5', desc: '겉바속촉 크로와상 명소 추천' },
  { emoji: '🍞', title: '소금빵 인기 빵집 모음', desc: '전국 소금빵 맛집 리스트' },
  { emoji: '🥖', title: '천연발효빵 가이드', desc: '사워도우 입문자를 위한 추천' },
  { emoji: '🧁', title: '디저트 카페 추천', desc: '케이크·타르트 전문점 모음' },
  { emoji: '🥯', title: '베이글 맛집 투어', desc: '서울·수도권 베이글 명소' },
];

export default function ProductAdCard() {
  const [topBakery, setTopBakery] = useState<TopBakery | null>(null);

  useEffect(() => {
    const top = getTopBakeries(1);
    if (top.length > 0) setTopBakery(top[0]);
  }, []);

  // 유료 광고 우선
  if (PAID_PRODUCT_ADS.length > 0) {
    const ad = PAID_PRODUCT_ADS[Math.floor(Math.random() * PAID_PRODUCT_ADS.length)];
    return (
      <div className="product-ad">
        <span className="product-ad-label">광고</span>
        <div className="product-ad-content">
          <span className="product-ad-icon">🎁</span>
          <div className="product-ad-info">
            <strong className="product-ad-title">{ad.title}</strong>
            <span className="product-ad-desc">{ad.description}</span>
          </div>
          <a href={ad.link} className="product-ad-btn" target="_blank" rel="noopener noreferrer">자세히</a>
        </div>
      </div>
    );
  }

  // 인기 빵집이 있으면 인기 빵집 추천
  if (topBakery) {
    return (
      <div className="product-ad product-ad-recommend">
        <span className="product-ad-label recommend">🏅 인기</span>
        <div className="product-ad-content">
          <span className="product-ad-icon">🏅</span>
          <div className="product-ad-info">
            <strong className="product-ad-title">{topBakery.name}</strong>
            <span className="product-ad-desc">최근 7일 인기 빵집 · {topBakery.clicks}회 조회</span>
          </div>
        </div>
      </div>
    );
  }

  // 빵 추천 콘텐츠 랜덤
  const rec = BREAD_RECOMMENDATIONS[Math.floor(Date.now() / 60000) % BREAD_RECOMMENDATIONS.length];
  return (
    <div className="product-ad product-ad-recommend">
      <span className="product-ad-label recommend">추천</span>
      <div className="product-ad-content">
        <span className="product-ad-icon">{rec.emoji}</span>
        <div className="product-ad-info">
          <strong className="product-ad-title">{rec.title}</strong>
          <span className="product-ad-desc">{rec.desc}</span>
        </div>
      </div>
    </div>
  );
}
