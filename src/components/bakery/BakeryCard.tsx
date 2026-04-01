import { Bakery, BakeryType } from '../../types/bakery';
import { isFreshlyBaked } from '../../utils/time';
import './BakeryCard.css';

interface Props {
  bakery: Bakery;
  isSelected: boolean;
  onClick: () => void;
}

// 빵집 유형별 썸네일 배경 컬러
const THUMB_COLORS = {
  franchise: { bg: '#FFF3E0', emoji: '🏪' },
  independent: { bg: '#E8F5E9', emoji: '🏠' },
};

// 이름 해시로 빵 이모지 선택
const BREAD_EMOJIS = ['🥐', '🍞', '🥖', '🧁', '🥯', '🍰'];
function getBreadEmoji(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i);
  return BREAD_EMOJIS[Math.abs(hash) % BREAD_EMOJIS.length];
}

export default function BakeryCard({ bakery, isSelected, onClick }: Props) {
  const hasFreshBread = bakery.bakingSchedule.some(s => isFreshlyBaked(s.bakedAt));
  const isFranchise = bakery.type === BakeryType.FRANCHISE;
  const freshBreads = bakery.bakingSchedule.filter(s => isFreshlyBaked(s.bakedAt));
  const thumb = isFranchise ? THUMB_COLORS.franchise : THUMB_COLORS.independent;

  return (
    <button className={`bakery-card ${isSelected ? 'selected' : ''} ${bakery.isPremium ? 'premium' : ''}`} onClick={onClick}>
      {/* ② 좌측 정사각 썸네일 */}
      <div className="card-thumb" style={{ background: thumb.bg }}>
        <span className="card-thumb-emoji">{getBreadEmoji(bakery.name)}</span>
        {bakery.isRegistered && <span className="card-thumb-registered" />}
      </div>

      <div className="card-content">
        {/* 제목 행 */}
        <div className="card-name-row">
          <span className="card-name">{bakery.name}</span>
          {bakery.isPremium && <span className="card-ad-tag">AD</span>}
          <span className={`card-type-badge ${isFranchise ? 'franchise' : 'independent'}`}>
            {isFranchise ? '프랜차이즈' : '개인'}
          </span>
        </div>

        {/* 주소 */}
        <div className="card-address-row">
          <span className="card-address">{bakery.address.replace('서울 ', '')}</span>
        </div>

        {/* 갓구운빵 */}
        {hasFreshBread && (
          <div className="card-fresh-row">
            <span className="fresh-icon">🔥</span>
            {freshBreads.slice(0, 3).map((s, i) => (
              <span key={i} className="fresh-bread">{s.breadType}</span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}
