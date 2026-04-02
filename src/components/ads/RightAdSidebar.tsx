import { useState, useEffect, useMemo } from 'react';
import GoogleAdSense from './GoogleAdSense';
import { getTopBakeries, type TopBakery } from '../../utils/bakeryStats';
import './RightAdSidebar.css';

// ── 유료 광고 (계약된 광고가 있을 때만 이 배열에 추가) ──────────────────────
interface PaidAd {
  id: string;
  title: string;
  advertiser: string;
  imageEmoji: string;
  bgColor: string;
  ctaText: string;
  link: string;
}

const PAID_ADS: PaidAd[] = [
  // 유료 광고가 계약되면 여기에 추가
  // {
  //   id: 'paid1', title: '파리바게뜨 봄 한정', advertiser: 'Paris Baguette',
  //   imageEmoji: '🌸', bgColor: '#FFF0F5', ctaText: '자세히 보기', link: 'https://...',
  // },
];

// ── 빵소식 콘텐츠 카드 ──────────────────────────────────────────────────
interface ContentCard {
  id: string;
  type: 'news' | 'community' | 'bakery';
  emoji: string;
  label: string;
  title: string;
  subtitle: string;
  bgColor: string;
}

const BREAD_NEWS: ContentCard[] = [
  { id: 'bn1', type: 'news', emoji: '📝', label: '빵소식', title: '전국 소금빵 맛집 BEST 10', subtitle: '블로그 인기 포스팅', bgColor: '#E8F5E9' },
  { id: 'bn2', type: 'news', emoji: '▶️', label: '빵소식', title: '집에서 바게트 만들기 도전', subtitle: '유튜브 인기 영상', bgColor: '#FFF3E0' },
  { id: 'bn3', type: 'news', emoji: '📝', label: '빵소식', title: '서울 천연발효빵 탐방 가이드', subtitle: '블로그 추천 포스팅', bgColor: '#E3F2FD' },
  { id: 'bn4', type: 'news', emoji: '▶️', label: '빵소식', title: '성심당 대전 빵투어 VLOG', subtitle: '유튜브 인기 영상', bgColor: '#FFF8E1' },
];

const COMMUNITY_HIGHLIGHTS: ContentCard[] = [
  { id: 'ch1', type: 'community', emoji: '💬', label: '인기 빵수다', title: '소금빵 레시피 공유합니다', subtitle: '❤️ 89 · 💬 23', bgColor: '#FCE4EC' },
  { id: 'ch2', type: 'community', emoji: '💬', label: '인기 빵수다', title: '바게트 클래프 터뜨리는 비결', subtitle: '❤️ 201 · 💬 45', bgColor: '#F3E5F5' },
  { id: 'ch3', type: 'community', emoji: '🔥', label: '인기 빵수다', title: '이번 주말 빵투어 같이 갈 분~', subtitle: '❤️ 34 · 💬 27', bgColor: '#E8EAF6' },
];

function bakeryToCard(b: TopBakery, index: number): ContentCard {
  const bgColors = ['#FFF9C4', '#FFECB3', '#FFE0B2', '#D7CCC8', '#DCEDC8'];
  return {
    id: `top-${b.id}`,
    type: 'bakery',
    emoji: '🏅',
    label: `인기 빵집 #${index + 1}`,
    title: b.name,
    subtitle: `최근 7일 ${b.clicks}회 조회`,
    bgColor: bgColors[index % bgColors.length],
  };
}

export default function RightAdSidebar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [topBakeries, setTopBakeries] = useState<TopBakery[]>([]);

  // 인기 빵집 주기적 갱신
  useEffect(() => {
    setTopBakeries(getTopBakeries(5));
    const timer = setInterval(() => setTopBakeries(getTopBakeries(5)), 30000);
    return () => clearInterval(timer);
  }, []);

  // 유료 광고가 있으면 유료 광고만, 없으면 콘텐츠 카드
  const hasPaidAds = PAID_ADS.length > 0;

  // 콘텐츠 슬롯: 인기빵집 + 빵소식 + 빵수다 혼합
  const contentCards: ContentCard[] = useMemo(() => {
    const cards: ContentCard[] = [];
    // 인기 빵집 추가
    topBakeries.forEach((b, i) => cards.push(bakeryToCard(b, i)));
    // 인기 빵집이 부족하면 기본 추천 빵집 추가
    if (cards.length === 0) {
      cards.push({ id: 'rec1', type: 'bakery', emoji: '🍞', label: '추천 빵집', title: '주변 빵집을 탐색해보세요', subtitle: '클릭하면 인기 빵집에 반영돼요', bgColor: '#FFF9C4' });
    }
    // 빵소식 2개
    cards.push(...BREAD_NEWS.slice(0, 2));
    // 빵수다 1개
    cards.push(COMMUNITY_HIGHLIGHTS[Math.floor(Date.now() / 86400000) % COMMUNITY_HIGHLIGHTS.length]);
    // 나머지 빵소식
    cards.push(...BREAD_NEWS.slice(2));

    return cards;
  }, [topBakeries]);

  // 자동 순환
  const slideItems = hasPaidAds ? PAID_ADS : contentCards;

  useEffect(() => {
    if (slideItems.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % slideItems.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slideItems.length]);

  const current = slideItems[currentIndex] || slideItems[0];
  if (!current) return null;

  return (
    <aside className="right-ad-sidebar">
      <div className="ad-sidebar-label">
        <span>{hasPaidAds ? 'AD' : '추천'}</span>
        <span className="ad-label-text">{hasPaidAds ? '광고' : '빵맵 추천'}</span>
      </div>

      {/* 메인 슬롯 */}
      <div className="ad-slot-main">
        {hasPaidAds ? (
          <a href={(current as PaidAd).link} target="_blank" rel="noopener noreferrer" className="ad-slot-placeholder" style={{ background: (current as PaidAd).bgColor, textDecoration: 'none' }}>
            <span className="ad-slot-emoji">{(current as PaidAd).imageEmoji}</span>
            <span className="ad-slot-title">{(current as PaidAd).title}</span>
            <span className="ad-slot-advertiser">{(current as PaidAd).advertiser}</span>
            <button className="ad-slot-cta">{(current as PaidAd).ctaText}</button>
          </a>
        ) : (
          <div className="ad-slot-placeholder content-card" style={{ background: (current as ContentCard).bgColor }}>
            <span className="content-card-badge">{(current as ContentCard).label}</span>
            <span className="ad-slot-emoji">{(current as ContentCard).emoji}</span>
            <span className="ad-slot-title">{(current as ContentCard).title}</span>
            <span className="ad-slot-subtitle">{(current as ContentCard).subtitle}</span>
          </div>
        )}
        {slideItems.length > 1 && (
          <div className="ad-slot-dots">
            {slideItems.slice(0, 6).map((_, i) => (
              <span key={i} className={`ad-dot ${i === currentIndex % slideItems.length ? 'active' : ''}`} onClick={() => setCurrentIndex(i)} />
            ))}
          </div>
        )}
      </div>

      {/* Google AdSense 광고 */}
      <div className="adsense-slot">
        <GoogleAdSense
          slot="7983474018"
          format="rectangle"
          style={{ minHeight: 200, width: '100%' }}
        />
      </div>

      {/* 하단 미니 배너: 나머지 콘텐츠 카드 */}
      <div className="ad-sidebar-banners">
        {(hasPaidAds ? [] : contentCards)
          .filter((_, i) => i !== currentIndex)
          .slice(0, 2)
          .map(card => (
            <div key={card.id} className="ad-mini-banner" style={{ background: card.bgColor }}>
              <span className="mini-emoji">{card.emoji}</span>
              <div className="mini-info">
                <span className="mini-title">{card.title}</span>
                <span className="mini-advertiser">{card.label}</span>
              </div>
            </div>
          ))}
      </div>

      <div className="ad-sidebar-footer">
        <span>Powered by 빵맵</span>
      </div>
    </aside>
  );
}
