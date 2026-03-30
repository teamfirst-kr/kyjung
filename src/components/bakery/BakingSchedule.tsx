import { Bakery } from '../../types/bakery';
import { isFreshlyBaked, formatTimeAgo, formatTime } from '../../utils/time';
import './BakingSchedule.css';

interface Props {
  bakery: Bakery;
}

export default function BakingSchedule({ bakery }: Props) {
  return (
    <div className="baking-schedule">
      <h3 className="section-title">🕐 빵 굽는 시간</h3>
      <div className="schedule-list">
        {bakery.bakingSchedule.map((entry, i) => {
          const fresh = isFreshlyBaked(entry.bakedAt);
          return (
            <div key={i} className={`schedule-item ${fresh ? 'fresh' : ''}`}>
              <div className="schedule-bread">
                <span className="bread-name">{entry.breadType}</span>
                {fresh && <span className="fresh-tag">🔥 갓 구움!</span>}
              </div>
              <div className="schedule-times">
                <div className="time-row">
                  <span className="time-label">마지막 제빵</span>
                  <span className="time-value">{formatTimeAgo(entry.bakedAt)}</span>
                </div>
                <div className="time-row">
                  <span className="time-label">다음 제빵</span>
                  <span className="time-value next">{formatTime(entry.nextBakeAt)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
