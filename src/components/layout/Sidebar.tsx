import { useState } from 'react';
import { useFilterContext } from '../../context/FilterContext';
import FilterPanel from '../search/FilterPanel';
import BakeryCard from '../bakery/BakeryCard';
import GoogleAdSense from '../ads/GoogleAdSense';
import { trackBakeryClick } from '../../utils/bakeryStats';
import './Sidebar.css';

function distKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// 줌 레벨별 최대 표시 개수
function maxByZoom(zoom: number) {
  if (zoom <= 11) return 0;   // zoom 11 이하: 리스트 완전히 숨김
  if (zoom >= 15) return 50;
  if (zoom >= 14) return 30;
  if (zoom >= 13) return 20;
  if (zoom >= 12) return 10;
  return 5;
}

export default function Sidebar() {
  const { filteredBakeries, selectedBakery, setSelectedBakery, isLoadingNaver, lastSearchResult, clearSearchResult, mapBounds, mapZoom } = useFilterContext();
  const [expanded, setExpanded] = useState(false);

  const registeredCount = filteredBakeries.filter(b => b.isRegistered).length;
  const isSearchMode = !!(lastSearchResult && lastSearchResult.bakeries.length > 0);

  // 검색 모드가 아닐 때: 지도 중심에서 가까운 순 + 줌별 개수 제한
  const displayBakeries = (() => {
    if (isSearchMode) return filteredBakeries;
    const center = mapBounds
      ? { lat: (mapBounds.north + mapBounds.south) / 2, lng: (mapBounds.east + mapBounds.west) / 2 }
      : null;
    const sorted = center
      ? [...filteredBakeries].sort((a, b) =>
          distKm(center.lat, center.lng, a.coordinates.lat, a.coordinates.lng) -
          distKm(center.lat, center.lng, b.coordinates.lat, b.coordinates.lng)
        )
      : filteredBakeries;
    return sorted.slice(0, maxByZoom(mapZoom));
  })();

  // 더보기: displayBakeries 중 5개씩
  const visibleBakeries = expanded ? displayBakeries : displayBakeries.slice(0, 5);

  // zoom 14 이상에서 리스트 영역 축소
  const isCompact = mapZoom >= 14 && !isSearchMode;
  // zoom 12 이하: 리스트 숨기되 필터는 항상 유지
  const listHidden = mapZoom <= 12 && !isSearchMode;

  return (
    <aside className={`sidebar ${expanded ? 'expanded' : ''} ${isCompact ? 'zoom-compact' : ''}`}>
      {!selectedBakery && <FilterPanel />}
      <div className="sidebar-results">
        <span className="results-count">
          {isSearchMode
            ? <><span className="results-search-mode">🔍 검색결과</span> {displayBakeries.length}개</>
            : <>{displayBakeries.length}개 빵집</>
          }
          {registeredCount > 0 && <span className="results-registered"> · 입점 {registeredCount}</span>}
          {isLoadingNaver && <span className="results-loading"> · 검색 중...</span>}
          {isSearchMode && (
            <button className="results-clear-search" onClick={clearSearchResult} title="검색 초기화">✕</button>
          )}
        </span>
      </div>
      {listHidden && (
        <div className="sidebar-zoom-hint">
          🔍 지도를 확대하면 주변 빵집이 보여요
        </div>
      )}
      <div className="sidebar-list" style={listHidden ? { display: 'none' } : {}}>
        {visibleBakeries.map((bakery, idx) => (
          <div key={bakery.id}>
            <BakeryCard
              bakery={bakery}
              isSelected={selectedBakery?.id === bakery.id}
              onClick={() => {
                trackBakeryClick(bakery.id, bakery.name);
                setSelectedBakery(selectedBakery?.id === bakery.id ? null : bakery);
              }}
            />
            {idx === 2 && (
              <div style={{ padding: '6px 8px' }}>
                <GoogleAdSense
                  slot="5552751796"
                  format="fluid"
                  style={{ display: 'block', minHeight: 120 }}
                />
              </div>
            )}
          </div>
        ))}
        {displayBakeries.length === 0 && (
          <div className="sidebar-empty">
            <span className="empty-icon">🔍</span>
            <p>검색 결과가 없습니다.</p>
            <p className="empty-hint">다른 키워드로 검색해보세요!</p>
          </div>
        )}
      </div>
      {/* 확장/축소 버튼 */}
      {!listHidden && displayBakeries.length > 5 && (
        <button className="sidebar-toggle-btn" onClick={() => setExpanded(!expanded)}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {expanded
              ? <polyline points="18 15 12 9 6 15" />
              : <polyline points="6 9 12 15 18 9" />
            }
          </svg>
          <span>{expanded ? '리스트 접기' : `${displayBakeries.length - 5}개 더보기`}</span>
        </button>
      )}
    </aside>
  );
}
