import { mockAds } from '../../mock/ads';
import './ProductAdCard.css';

export default function ProductAdCard() {
  const productAds = mockAds.filter(a => a.type === 'product');
  const ad = productAds[Math.floor(Math.random() * productAds.length)];
  if (!ad) return null;

  return (
    <div className="product-ad">
      <span className="product-ad-label">광고</span>
      <div className="product-ad-content">
        <span className="product-ad-icon">🎁</span>
        <div className="product-ad-info">
          <strong className="product-ad-title">{ad.title}</strong>
          <span className="product-ad-desc">{ad.description}</span>
        </div>
        <button className="product-ad-btn">자세히</button>
      </div>
    </div>
  );
}
