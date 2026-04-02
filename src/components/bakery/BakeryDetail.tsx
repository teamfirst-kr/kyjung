import { useState, useEffect } from 'react';
import { Bakery, BakeryType } from '../../types/bakery';
import { formatRating } from '../../utils/format';
import { searchBakeryImages } from '../../services/naverImages';
import { isNaverApiConfigured } from '../../services/naverPlaces';
import BakingSchedule from './BakingSchedule';
import MenuList from './MenuList';
import ReviewList from '../review/ReviewList';
import ProductAdCard from '../ads/ProductAdCard';
import './BakeryDetail.css';

interface Props {
  bakery: Bakery;
  onClose: () => void;
}

function getNaverMapUrl(bakery: Bakery) {
  return `https://map.naver.com/v5/search/${encodeURIComponent(bakery.name + ' ' + bakery.address)}`;
}

function getKakaoMapUrl(bakery: Bakery) {
  return `https://map.kakao.com/?q=${encodeURIComponent(bakery.name + ' ' + bakery.address)}`;
}

const PHOTO_LABELS = ['매장 외관', '빵 진열대', '매장 내부', '시그니처 메뉴'];
const PHOTO_FALLBACKS = [
  { emoji: '🥐', bg: 'linear-gradient(135deg, #FFE0B2, #FFCC80)' },
  { emoji: '🍞', bg: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)' },
  { emoji: '☕', bg: 'linear-gradient(135deg, #D7CCC8, #BCAAA4)' },
  { emoji: '🎂', bg: 'linear-gradient(135deg, #F8BBD0, #F48FB1)' },
];

export default function BakeryDetail({ bakery, onClose }: Props) {
  const isFranchise = bakery.type === BakeryType.FRANCHISE;
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (isNaverApiConfigured()) {
      searchBakeryImages(bakery.name, bakery.address, 4).then(setPhotos);
    }
  }, [bakery.name, bakery.address]);

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={e => e.stopPropagation()}>
        <button className="detail-close" onClick={onClose}>✕</button>

        {/* Store Photos */}
        <div className="detail-photos">
          {PHOTO_LABELS.map((label, i) => (
            <div key={i} className="detail-photo" style={photos[i] ? undefined : { background: PHOTO_FALLBACKS[i].bg }}>
              {photos[i] ? (
                <img
                  src={photos[i]}
                  alt={label}
                  className="photo-real"
                />
              ) : (
                <span className="photo-emoji">{PHOTO_FALLBACKS[i].emoji}</span>
              )}
              <span className="photo-label">{label}</span>
            </div>
          ))}
        </div>

        {/* Hero */}
        <div className={`detail-hero ${isFranchise ? 'franchise' : 'independent'}`}>
          <span className="detail-hero-icon">{isFranchise ? '🏪' : '🏠'}</span>
          <div className="detail-hero-info">
            <div className="detail-name-row">
              <h2 className="detail-name">{bakery.name}</h2>
              {bakery.isPremium && <span className="detail-premium">프리미엄</span>}
              {bakery.isRegistered && <span className="detail-registered">입점</span>}
            </div>
            <span className={`detail-type ${isFranchise ? 'franchise' : 'independent'}`}>
              {isFranchise ? '프랜차이즈' : '개인 빵집'}
            </span>
            <div className="detail-rating">
              ⭐ {formatRating(bakery.rating)} ({bakery.reviewCount}개 리뷰)
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="detail-info-grid">
          <div className="info-item">
            <span className="info-icon">📍</span>
            <span>{bakery.address}</span>
          </div>
          <div className="info-item">
            <span className="info-icon">📞</span>
            <span>{bakery.phone}</span>
          </div>
          <div className="info-item">
            <span className="info-icon">🕐</span>
            <span>{bakery.hours.open} - {bakery.hours.close}</span>
          </div>
        </div>

        {/* Directions */}
        <div className="detail-directions">
          <span className="directions-label">길찾기</span>
          <a href={getNaverMapUrl(bakery)} target="_blank" rel="noopener noreferrer" className="direction-btn naver">
            <span>N</span> 네이버지도
          </a>
          <a href={getKakaoMapUrl(bakery)} target="_blank" rel="noopener noreferrer" className="direction-btn kakao">
            <span>K</span> 카카오지도
          </a>
        </div>

        <p className="detail-description">{bakery.description}</p>

        {/* Tags */}
        <div className="detail-tags">
          {bakery.tags.map(tag => (
            <span key={tag} className="detail-tag">#{tag}</span>
          ))}
        </div>

        {/* Baking Schedule */}
        <BakingSchedule bakery={bakery} />

        {/* Menu - only show order if registered */}
        <MenuList bakeryId={bakery.id} isRegistered={bakery.isRegistered} />

        {/* Product Ad */}
        <ProductAdCard />

        {/* Reviews */}
        <ReviewList bakeryId={bakery.id} />
      </div>
    </div>
  );
}
