import { AdBanner as AdBannerType } from '../../types/ad';
import './AdBanner.css';

interface Props {
  ad: AdBannerType;
  variant: 'top' | 'sidebar';
}

export default function AdBanner({ ad, variant }: Props) {
  return (
    <div className={`ad-banner ${variant}`}>
      <span className="ad-label">AD</span>
      <div className="ad-content">
        <span className="ad-icon">📢</span>
        <div className="ad-text">
          <strong className="ad-title">{ad.title}</strong>
          <span className="ad-desc">{ad.description}</span>
        </div>
      </div>
    </div>
  );
}
