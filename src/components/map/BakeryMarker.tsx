import { Bakery, BakeryType } from '../../types/bakery';
import { isFreshlyBaked } from '../../utils/time';
import SteamAnimation from './SteamAnimation';
import './BakeryMarker.css';

interface Props {
  bakery: Bakery;
  isSelected: boolean;
  onClick: () => void;
}

export default function BakeryMarker({ bakery, isSelected, onClick }: Props) {
  const hasFreshBread = bakery.bakingSchedule.some(s => isFreshlyBaked(s.bakedAt));
  const isFranchise = bakery.type === BakeryType.FRANCHISE;

  return (
    <button
      className={`bakery-marker ${isSelected ? 'selected' : ''} ${isFranchise ? 'franchise' : 'independent'}`}
      onClick={onClick}
      title={bakery.name}
    >
      {hasFreshBread && <SteamAnimation />}
      <div className="marker-icon">
        <div className="marker-building">
          <div className="marker-roof" />
          <div className="marker-body">
            <span className="marker-emoji">{isFranchise ? '🏪' : '🏠'}</span>
          </div>
        </div>
        {bakery.isPremium && <span className="marker-premium">AD</span>}
      </div>
      <div className="marker-label">{bakery.name.length > 6 ? bakery.name.slice(0, 6) + '…' : bakery.name}</div>
      <div className="marker-pointer" />
    </button>
  );
}
