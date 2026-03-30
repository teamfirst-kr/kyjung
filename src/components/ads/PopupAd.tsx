import { useState, useEffect } from 'react';
import './PopupAd.css';

const POPUP_ADS = [
  {
    title: '홈베이킹 밀키트 출시!',
    subtitle: '집에서 쉽게 만드는 프리미엄 크로와상',
    description: '프랑스산 버터 100% 사용, 전문 셰프 레시피 포함',
    badge: '20% 할인',
    emoji: '🥐',
    bg: 'linear-gradient(135deg, #FFF8E1, #FFE0B2)',
  },
  {
    title: '프리미엄 오븐 토스터',
    subtitle: '빵집처럼 굽는 발뮤다 더 토스터',
    description: '스팀 기술로 겉바속촉, 갓 구운 빵맛 그대로',
    badge: '무료배송',
    emoji: '🍞',
    bg: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)',
  },
  {
    title: '빵맵 프리미엄 입점',
    subtitle: '상위노출로 매출을 올려보세요',
    description: '첫 달 광고비 무료! 지금 입점하면 프리미엄 혜택',
    badge: '첫 달 무료',
    emoji: '📈',
    bg: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
  },
];

export default function PopupAd() {
  const [isVisible, setIsVisible] = useState(false);
  const [todayHide, setTodayHide] = useState(false);

  const ad = POPUP_ADS[Math.floor(Date.now() / 86400000) % POPUP_ADS.length];

  useEffect(() => {
    // 오늘 하루 안보기 체크
    const hideUntil = localStorage.getItem('popup_ad_hide_until');
    if (hideUntil && Date.now() < parseInt(hideUntil, 10)) {
      return;
    }
    // 1.5초 후 팝업 표시
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  function handleClose() {
    setIsVisible(false);
    if (todayHide) {
      localStorage.setItem('popup_ad_hide_until', String(Date.now() + 86400000));
    }
  }

  if (!isVisible) return null;

  return (
    <div className="popup-ad-overlay" onClick={handleClose}>
      <div className="popup-ad" onClick={e => e.stopPropagation()} style={{ background: ad.bg }}>
        <button className="popup-ad-close" onClick={handleClose}>✕</button>
        <span className="popup-ad-tag">AD</span>

        <div className="popup-ad-hero">
          <span className="popup-ad-emoji">{ad.emoji}</span>
          {ad.badge && <span className="popup-ad-badge">{ad.badge}</span>}
        </div>

        <h2 className="popup-ad-title">{ad.title}</h2>
        <p className="popup-ad-subtitle">{ad.subtitle}</p>
        <p className="popup-ad-desc">{ad.description}</p>

        <button className="popup-ad-cta">자세히 보기</button>

        <label className="popup-ad-today">
          <input
            type="checkbox"
            checked={todayHide}
            onChange={e => setTodayHide(e.target.checked)}
          />
          오늘 하루 안보기
        </label>
      </div>
    </div>
  );
}
