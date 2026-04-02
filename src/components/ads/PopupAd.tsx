import { useState, useEffect } from 'react';
import GoogleAdSense from './GoogleAdSense';
import './PopupAd.css';

export default function PopupAd() {
  const [isVisible, setIsVisible] = useState(false);
  const [todayHide, setTodayHide] = useState(false);

  useEffect(() => {
    const hideUntil = localStorage.getItem('popup_ad_hide_until');
    if (hideUntil && Date.now() < parseInt(hideUntil, 10)) return;
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
      <div className="popup-ad" onClick={e => e.stopPropagation()}>
        <button className="popup-ad-close" onClick={handleClose}>✕</button>
        <span className="popup-ad-tag">AD</span>
        <div className="popup-ad-adsense">
          <GoogleAdSense
            slot="7987343445"
            format="auto"
            style={{ display: 'block', minHeight: 250, width: '100%' }}
          />
        </div>
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
