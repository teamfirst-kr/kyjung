import GoogleAdSense from './GoogleAdSense';
import './BottomAdBanner.css';

const SLOT_BOTTOM = import.meta.env.VITE_ADSENSE_SLOT_BOTTOM as string | undefined;

export default function BottomAdBanner() {
  return (
    <div className="bottom-ad-banner">
      <div className="bottom-ad-content">
        <span className="bottom-ad-label">AD</span>
        <div className="bottom-ad-slot">
          <GoogleAdSense
            slot={SLOT_BOTTOM || ''}
            format="horizontal"
            style={{ width: '100%', maxWidth: 728, minHeight: 50 }}
          />
        </div>
      </div>
    </div>
  );
}
