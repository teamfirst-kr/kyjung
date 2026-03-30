import { useState, useEffect } from 'react';
import './RightAdSidebar.css';

interface AdSlot {
  id: string;
  title: string;
  advertiser: string;
  imageEmoji: string;
  bgColor: string;
  ctaText: string;
  link: string;
}

const MOCK_ADS: AdSlot[] = [
  {
    id: 'gad1', title: '파리바게뜨 봄 한정 메뉴', advertiser: 'Paris Baguette',
    imageEmoji: '🌸', bgColor: '#FFF0F5', ctaText: '자세히 보기', link: '#',
  },
  {
    id: 'gad2', title: '뚜레쥬르 딸기케이크 30%', advertiser: 'Tous Les Jours',
    imageEmoji: '🍰', bgColor: '#FFF8E1', ctaText: '쿠폰 받기', link: '#',
  },
  {
    id: 'gad3', title: '빵맵 프리미엄 입점 안내', advertiser: '빵맵',
    imageEmoji: '🏪', bgColor: '#F3E8FF', ctaText: '입점 신청', link: '#',
  },
  {
    id: 'gad4', title: '홈베이킹 클래스 오픈', advertiser: 'Baking Studio',
    imageEmoji: '👩‍🍳', bgColor: '#E8F5E9', ctaText: '수강 신청', link: '#',
  },
];

export default function RightAdSidebar() {
  const [currentAd, setCurrentAd] = useState(0);

  // 광고 자동 로테이션 (8초 간격)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAd(prev => (prev + 1) % MOCK_ADS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <aside className="right-ad-sidebar">
      <div className="ad-sidebar-label">
        <span>AD</span>
        <span className="ad-label-text">광고</span>
      </div>

      {/* 메인 광고 슬롯 (Google AdSense 영역) */}
      <div className="ad-slot-main">
        <div className="ad-slot-placeholder" style={{ background: MOCK_ADS[currentAd].bgColor }}>
          <span className="ad-slot-emoji">{MOCK_ADS[currentAd].imageEmoji}</span>
          <span className="ad-slot-title">{MOCK_ADS[currentAd].title}</span>
          <span className="ad-slot-advertiser">{MOCK_ADS[currentAd].advertiser}</span>
          <button className="ad-slot-cta">{MOCK_ADS[currentAd].ctaText}</button>
        </div>
        <div className="ad-slot-dots">
          {MOCK_ADS.map((_, i) => (
            <span key={i} className={`ad-dot ${i === currentAd ? 'active' : ''}`} onClick={() => setCurrentAd(i)} />
          ))}
        </div>
      </div>

      {/* Google AdSense 배너 영역 */}
      <div className="adsense-slot">
        <div className="adsense-placeholder">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#bbb" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 9l3 3-3 3" />
            <line x1="15" y1="9" x2="15" y2="15" />
          </svg>
          <span>Google AdSense</span>
          <span className="adsense-size">160×600</span>
        </div>
      </div>

      {/* 추가 배너 광고 */}
      <div className="ad-sidebar-banners">
        {MOCK_ADS.filter((_, i) => i !== currentAd).slice(0, 2).map(ad => (
          <div key={ad.id} className="ad-mini-banner" style={{ background: ad.bgColor }}>
            <span className="mini-emoji">{ad.imageEmoji}</span>
            <div className="mini-info">
              <span className="mini-title">{ad.title}</span>
              <span className="mini-advertiser">{ad.advertiser}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="ad-sidebar-footer">
        <span>Powered by 빵맵 Ads</span>
      </div>
    </aside>
  );
}
