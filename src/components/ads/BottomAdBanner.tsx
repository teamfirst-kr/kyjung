import './BottomAdBanner.css';

export default function BottomAdBanner() {
  return (
    <div className="bottom-ad-banner">
      <div className="bottom-ad-content">
        <span className="bottom-ad-label">AD</span>
        <div className="bottom-ad-slot">
          {/* 실제 서비스에서는 Google AdSense 코드 삽입 */}
          {/* <ins class="adsbygoogle" data-ad-client="ca-pub-XXXX" data-ad-slot="XXXX"></ins> */}
          <div className="bottom-ad-placeholder">
            <span className="ad-placeholder-icon">🍞</span>
            <div className="ad-placeholder-text">
              <strong>빵맵 제휴 광고</strong>
              <span>이 공간은 Google AdSense 배너 광고가 노출됩니다</span>
            </div>
            <span className="ad-placeholder-cta">광고문의</span>
          </div>
        </div>
      </div>
    </div>
  );
}
