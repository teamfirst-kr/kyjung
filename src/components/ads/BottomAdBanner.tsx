import GoogleAdSense from './GoogleAdSense';
import './BottomAdBanner.css';

export default function BottomAdBanner() {
  return (
    <div className="bottom-ad-banner">
      <div className="bottom-ad-content">
        <span className="bottom-ad-label">AD</span>
        <div className="bottom-ad-slot">
          <GoogleAdSense
            slot="7074985940"
            format="horizontal"
            style={{ width: '100%', maxWidth: 728, minHeight: 50 }}
          />
        </div>
      </div>
    </div>
  );
}
