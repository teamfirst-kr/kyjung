import { useState } from 'react';
import { useFilterContext } from '../../context/FilterContext';
import FilterPanel from '../search/FilterPanel';
import BakeryCard from '../bakery/BakeryCard';
import AdBanner from '../ads/AdBanner';
import { mockAds } from '../../mock/ads';
import './Sidebar.css';

export default function Sidebar() {
  const { filteredBakeries, selectedBakery, setSelectedBakery, isLoadingNaver } = useFilterContext();
  const sidebarAds = mockAds.filter(a => a.type === 'sidebar');
  const [expanded, setExpanded] = useState(false);

  const registeredCount = filteredBakeries.filter(b => b.isRegistered).length;

  // 기본: 5개만 보여줌, 확장 시 전체
  const visibleBakeries = expanded ? filteredBakeries : filteredBakeries.slice(0, 5);

  return (
    <aside className={`sidebar ${expanded ? 'expanded' : ''}`}>
      <FilterPanel />
      <div className="sidebar-results">
        <span className="results-count">
          {filteredBakeries.length}개 빵집
          {registeredCount > 0 && <span className="results-registered"> · 입점 {registeredCount}</span>}
          {isLoadingNaver && <span className="results-loading"> · 검색 중...</span>}
        </span>
      </div>
      <div className="sidebar-list">
        {visibleBakeries.map((bakery, idx) => (
          <div key={bakery.id}>
            <BakeryCard
              bakery={bakery}
              isSelected={selectedBakery?.id === bakery.id}
              onClick={() => setSelectedBakery(selectedBakery?.id === bakery.id ? null : bakery)}
            />
            {(idx + 1) % 5 === 0 && sidebarAds[Math.floor(idx / 5) % sidebarAds.length] && (
              <AdBanner ad={sidebarAds[Math.floor(idx / 5) % sidebarAds.length]} variant="sidebar" />
            )}
          </div>
        ))}
        {filteredBakeries.length === 0 && (
          <div className="sidebar-empty">
            <span className="empty-icon">🔍</span>
            <p>검색 결과가 없습니다.</p>
            <p className="empty-hint">다른 키워드로 검색해보세요!</p>
          </div>
        )}
      </div>
      {/* 확장/축소 버튼 */}
      {filteredBakeries.length > 5 && (
        <button className="sidebar-toggle-btn" onClick={() => setExpanded(!expanded)}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {expanded
              ? <polyline points="18 15 12 9 6 15" />
              : <polyline points="6 9 12 15 18 9" />
            }
          </svg>
          <span>{expanded ? '리스트 접기' : `${filteredBakeries.length - 5}개 더보기`}</span>
        </button>
      )}
    </aside>
  );
}
