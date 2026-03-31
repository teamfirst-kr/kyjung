import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useFilterContext } from '../../context/FilterContext';
import { isFreshlyBaked } from '../../utils/time';
import { getBakeryMarkerSvg } from './bakeryIcons';
import './MapView.css';

const SEOUL_CENTER: [number, number] = [37.5505, 126.9780];

// 전국 주요 지역 좌표 매핑 (역지오코딩)
const ALL_AREAS: { name: string; lat: number; lng: number }[] = [
  // 서울
  { name: '강남구', lat: 37.4979, lng: 127.0276 },
  { name: '서초구', lat: 37.4837, lng: 127.0324 },
  { name: '종로구', lat: 37.5735, lng: 126.9790 },
  { name: '중구', lat: 37.5641, lng: 126.9979 },
  { name: '마포구', lat: 37.5663, lng: 126.9019 },
  { name: '용산구', lat: 37.5326, lng: 126.9900 },
  { name: '송파구', lat: 37.5145, lng: 127.1060 },
  { name: '영등포구', lat: 37.5264, lng: 126.8963 },
  { name: '강서구', lat: 37.5510, lng: 126.8495 },
  { name: '성동구', lat: 37.5634, lng: 127.0368 },
  { name: '동대문구', lat: 37.5744, lng: 127.0400 },
  { name: '광진구', lat: 37.5384, lng: 127.0822 },
  { name: '성북구', lat: 37.5894, lng: 127.0164 },
  { name: '노원구', lat: 37.6542, lng: 127.0568 },
  { name: '관악구', lat: 37.4784, lng: 126.9516 },
  { name: '동작구', lat: 37.5124, lng: 126.9393 },
  // 경기도
  { name: '수원', lat: 37.2636, lng: 127.0286 },
  { name: '성남', lat: 37.4201, lng: 127.1265 },
  { name: '고양', lat: 37.6584, lng: 126.8320 },
  { name: '용인', lat: 37.2411, lng: 127.1776 },
  { name: '부천', lat: 37.5035, lng: 126.7660 },
  { name: '안산', lat: 37.3220, lng: 126.8318 },
  { name: '안양', lat: 37.3943, lng: 126.9568 },
  { name: '화성', lat: 37.1994, lng: 126.8312 },
  { name: '평택', lat: 36.9921, lng: 127.1129 },
  { name: '파주', lat: 37.7599, lng: 126.7800 },
  { name: '김포', lat: 37.6153, lng: 126.7156 },
  { name: '광명', lat: 37.4786, lng: 126.8664 },
  { name: '하남', lat: 37.5393, lng: 127.2148 },
  { name: '의정부', lat: 37.7381, lng: 127.0338 },
  { name: '남양주', lat: 37.6360, lng: 127.2163 },
  // 인천
  { name: '인천 부평구', lat: 37.5075, lng: 126.7218 },
  { name: '인천 남동구', lat: 37.4488, lng: 126.7307 },
  { name: '인천 연수구', lat: 37.4101, lng: 126.6783 },
  // 광역시 + 주요도시
  { name: '부산 서면', lat: 35.1580, lng: 129.0596 },
  { name: '부산 해운대', lat: 35.1631, lng: 129.1636 },
  { name: '부산 광안리', lat: 35.1533, lng: 129.1187 },
  { name: '대구 중구', lat: 35.8714, lng: 128.6014 },
  { name: '대구 수성구', lat: 35.8583, lng: 128.6308 },
  { name: '대전 서구', lat: 36.3553, lng: 127.3834 },
  { name: '대전 유성구', lat: 36.3622, lng: 127.3561 },
  { name: '광주 동구', lat: 35.1460, lng: 126.9231 },
  { name: '울산 남구', lat: 35.5384, lng: 129.3114 },
  { name: '제주시', lat: 33.4996, lng: 126.5312 },
  { name: '서귀포시', lat: 33.2541, lng: 126.5601 },
  { name: '춘천', lat: 37.8813, lng: 127.7299 },
  { name: '원주', lat: 37.3422, lng: 127.9202 },
  { name: '천안', lat: 36.8151, lng: 127.1139 },
  { name: '전주', lat: 35.8242, lng: 127.1480 },
  { name: '포항', lat: 36.0190, lng: 129.3435 },
  { name: '창원', lat: 35.2280, lng: 128.6811 },
  { name: '김해', lat: 35.2285, lng: 128.8894 },
];

function getAreaName(lat: number, lng: number): string {
  let closest = ALL_AREAS[0];
  let minDist = Infinity;
  for (const area of ALL_AREAS) {
    const d = Math.pow(lat - area.lat, 2) + Math.pow(lng - area.lng, 2);
    if (d < minDist) { minDist = d; closest = area; }
  }
  return closest.name;
}

// 초기 로드 시 검색할 주요 지역
const INITIAL_SEARCH_AREAS = [
  // 서울 권역
  '서울 강남', '서울 종로', '서울 마포', '서울 송파', '서울 영등포',
  // 경기·인천
  '수원', '성남 분당', '고양 일산', '인천 부평', '용인',
  '부천', '안양', '김포', '하남', '파주',
  // 부산
  '부산 서면', '부산 해운대',
  // 주요 광역시
  '대구', '대전', '광주', '울산',
  // 기타 주요 도시
  '제주', '전주', '춘천', '천안', '창원',
];

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const { filteredBakeries, selectedBakery, setSelectedBakery, searchArea, isLoadingNaver, isApiConnected } = useFilterContext();
  const [showSearchBtn, setShowSearchBtn] = useState(false);
  const searchedAreasRef = useRef<Set<string>>(new Set());

  // Init map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const map = L.map(mapRef.current, {
      center: SEOUL_CENTER,
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    // 지도 이동 시 "이 지역 검색" 버튼 표시
    map.on('moveend', () => {
      if (isApiConnected) {
        setShowSearchBtn(true);
      }
    });

    mapInstance.current = map;

    // 초기 전국 주요 지역 빵집 검색 (배치 실행)
    if (isApiConnected) {
      (async () => {
        // 3개씩 배치로 병렬 검색 (API 부하 분산)
        for (let i = 0; i < INITIAL_SEARCH_AREAS.length; i += 3) {
          const batch = INITIAL_SEARCH_AREAS.slice(i, i + 3);
          await Promise.all(batch.map(area => searchArea(area)));
        }
      })();
    }

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // 이 지역 검색
  const handleSearchThisArea = useCallback(() => {
    if (!mapInstance.current) return;
    const center = mapInstance.current.getCenter();
    const area = getAreaName(center.lat, center.lng);
    const key = `${area}-${Math.round(center.lat * 100)}-${Math.round(center.lng * 100)}`;

    if (!searchedAreasRef.current.has(key)) {
      searchedAreasRef.current.add(key);
      searchArea(area);
    }
    setShowSearchBtn(false);
  }, [searchArea]);

  // Update markers
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    filteredBakeries.forEach((bakery) => {
      if (!bakery.coordinates.lat || !bakery.coordinates.lng) return;

      const hasFresh = bakery.bakingSchedule.some(s => isFreshlyBaked(s.bakedAt));
      const isSelected = selectedBakery?.id === bakery.id;
      const svgHtml = getBakeryMarkerSvg(bakery, hasFresh, isSelected);

      const icon = L.divIcon({
        html: svgHtml,
        className: 'bakery-map-marker',
        iconSize: [56, 72],
        iconAnchor: [28, 72],
        popupAnchor: [0, -72],
      });

      const marker = L.marker([bakery.coordinates.lat, bakery.coordinates.lng], { icon })
        .addTo(map)
        .on('click', () => {
          setSelectedBakery(selectedBakery?.id === bakery.id ? null : bakery);
        });

      const tooltipContent = bakery.isRegistered
        ? `<b>${bakery.name}</b> <span style="color:#4CAF50">✓입점</span>`
        : bakery.name;

      marker.bindTooltip(tooltipContent, {
        direction: 'top',
        offset: [0, -72],
        className: 'bakery-tooltip',
      });

      markersRef.current.push(marker);
    });
  }, [filteredBakeries, selectedBakery, setSelectedBakery]);

  // Pan to selected
  useEffect(() => {
    if (selectedBakery && mapInstance.current) {
      mapInstance.current.flyTo(
        [selectedBakery.coordinates.lat, selectedBakery.coordinates.lng],
        15,
        { duration: 0.8 }
      );
    }
  }, [selectedBakery]);

  // User location
  function handleLocateMe() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        if (mapInstance.current) {
          mapInstance.current.flyTo(loc, 15, { duration: 1 });
          if (userMarkerRef.current) userMarkerRef.current.remove();
          const userIcon = L.divIcon({
            html: '<div class="user-location-dot"><div class="user-dot-pulse"></div></div>',
            className: 'user-location-marker',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });
          userMarkerRef.current = L.marker(loc, { icon: userIcon })
            .addTo(mapInstance.current)
            .bindTooltip('내 위치', { direction: 'top', offset: [0, -16] });

          // 현재 위치 근처 빵집 자동 검색
          if (isApiConnected) {
            const area = getAreaName(pos.coords.latitude, pos.coords.longitude);
            searchArea(area);
          }
        }
      },
      () => alert('위치 정보를 가져올 수 없습니다.'),
      { enableHighAccuracy: true }
    );
  }

  return (
    <div className="map-view">
      <div ref={mapRef} className="map-container" />

      {/* Search this area button */}
      {showSearchBtn && isApiConnected && (
        <button className="search-area-btn" onClick={handleSearchThisArea} disabled={isLoadingNaver}>
          {isLoadingNaver ? '검색 중...' : '🔍 이 지역에서 빵집 검색'}
        </button>
      )}

      {/* Loading indicator */}
      {isLoadingNaver && (
        <div className="map-loading">검색 중...</div>
      )}

      {/* API status */}
      {!isApiConnected && (
        <div className="api-notice">
          <span>📋 데모 모드</span> · .env에 네이버 API 키를 설정하면 전국 빵집이 표시됩니다
        </div>
      )}

      <button className="locate-btn" onClick={handleLocateMe} title="내 위치">
        📍
      </button>
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-dot independent-dot" />
          <span>개인 빵집</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot franchise-dot" />
          <span>프랜차이즈</span>
        </div>
        <div className="legend-item">
          <span className="legend-steam-icon">~</span>
          <span>갓 구운 빵</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot registered-dot" />
          <span>입점 매장</span>
        </div>
      </div>
    </div>
  );
}
