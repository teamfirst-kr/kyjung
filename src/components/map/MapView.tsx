import { useEffect, useRef, useState, useCallback } from 'react';
import { useFilterContext } from '../../context/FilterContext';
import { isFreshlyBaked } from '../../utils/time';
import { getBakeryMarkerSvg } from './bakeryIcons';
import './MapView.css';

// Naver Maps SDK 동적 로딩
const NAVER_MAP_KEY = import.meta.env.VITE_NAVER_MAP_CLIENT_ID as string | undefined;
let naverScriptLoaded = false;
let naverScriptLoading = false;
const naverLoadCallbacks: (() => void)[] = [];

function loadNaverMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // 이미 로드됨
    if (naverScriptLoaded || (typeof naver !== 'undefined' && naver.maps)) {
      naverScriptLoaded = true;
      return resolve();
    }
    if (!NAVER_MAP_KEY) return reject(new Error('VITE_NAVER_MAP_CLIENT_ID 미설정'));

    naverLoadCallbacks.push(resolve);
    if (naverScriptLoading) return; // 이미 로딩 중이면 콜백만 등록
    naverScriptLoading = true;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_MAP_KEY}`;
    script.async = true;
    script.onload = () => {
      naverScriptLoaded = true;
      naverScriptLoading = false;
      naverLoadCallbacks.forEach(cb => cb());
      naverLoadCallbacks.length = 0;
    };
    script.onerror = () => {
      naverScriptLoading = false;
      reject(new Error('Naver Maps 스크립트 로딩 실패'));
    };
    document.head.appendChild(script);
  });
}

const SEOUL_CENTER: [number, number] = [37.5505, 126.9780];

const ALL_AREAS: { name: string; lat: number; lng: number }[] = [
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
  // ── 기존 누락된 서울 구 ──────────────────────
  { name: '금천구', lat: 37.4564, lng: 126.8955 },        // 가산디지털단지 포함
  { name: '구로구', lat: 37.4954, lng: 126.8874 },
  { name: '양천구', lat: 37.5170, lng: 126.8666 },
  { name: '은평구', lat: 37.6176, lng: 126.9227 },
  { name: '서대문구', lat: 37.5791, lng: 126.9368 },
  { name: '강북구', lat: 37.6396, lng: 127.0255 },
  { name: '도봉구', lat: 37.6688, lng: 127.0471 },
  { name: '중랑구', lat: 37.6066, lng: 127.0927 },
  { name: '강동구', lat: 37.5301, lng: 127.1238 },
  // ── 가산디지털단지역 (정밀 좌표) ────────────
  { name: '가산디지털단지역', lat: 37.4812, lng: 126.8828 },
  { name: '구로디지털단지역', lat: 37.4851, lng: 126.9014 },
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
  { name: '인천 부평구', lat: 37.5075, lng: 126.7218 },
  { name: '인천 남동구', lat: 37.4488, lng: 126.7307 },
  { name: '인천 연수구', lat: 37.4101, lng: 126.6783 },
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
  // ── 강원도 ──────────────────────────────────
  { name: '강릉', lat: 37.7519, lng: 128.8761 },
  { name: '속초', lat: 38.2070, lng: 128.5919 },
  { name: '동해', lat: 37.5247, lng: 129.1143 },
  { name: '삼척', lat: 37.4502, lng: 129.1658 },
  { name: '태백', lat: 37.1652, lng: 128.9857 },
  { name: '양양', lat: 38.0756, lng: 128.6189 },
  { name: '고성군', lat: 38.3806, lng: 128.4679 },
  { name: '인제', lat: 38.0691, lng: 128.1703 },
  { name: '양구', lat: 38.1046, lng: 127.9896 },
  { name: '화천', lat: 38.1065, lng: 127.7083 },
  { name: '철원', lat: 38.1461, lng: 127.3139 },
  { name: '홍천', lat: 37.6972, lng: 127.8889 },
  { name: '횡성', lat: 37.4917, lng: 127.9847 },
  { name: '평창', lat: 37.3706, lng: 128.3898 },
  { name: '영월', lat: 37.1836, lng: 128.4617 },
  { name: '정선', lat: 37.3802, lng: 128.6603 },
  { name: '강릉 경포', lat: 37.8009, lng: 128.9094 },
  // ── 충청북도 ────────────────────────────────
  { name: '청주', lat: 36.6424, lng: 127.4890 },
  { name: '충주', lat: 36.9910, lng: 127.9259 },
  { name: '제천', lat: 37.1326, lng: 128.1911 },
  { name: '음성', lat: 36.9400, lng: 127.6901 },
  { name: '진천', lat: 36.8555, lng: 127.4353 },
  { name: '보은', lat: 36.4897, lng: 127.7297 },
  { name: '영동', lat: 36.1751, lng: 127.7755 },
  { name: '옥천', lat: 36.3063, lng: 127.5710 },
  { name: '증평', lat: 36.7853, lng: 127.5817 },
  { name: '괴산', lat: 36.8148, lng: 127.7873 },
  { name: '단양', lat: 36.9847, lng: 128.3673 },
  // ── 충청남도 ────────────────────────────────
  { name: '아산', lat: 36.7898, lng: 127.0018 },
  { name: '공주', lat: 36.4467, lng: 127.1190 },
  { name: '보령', lat: 36.3331, lng: 126.6130 },
  { name: '서산', lat: 36.7849, lng: 126.4503 },
  { name: '논산', lat: 36.1870, lng: 127.0990 },
  { name: '계룡', lat: 36.2740, lng: 127.2490 },
  { name: '당진', lat: 36.8930, lng: 126.6282 },
  { name: '홍성', lat: 36.6013, lng: 126.6608 },
  { name: '예산', lat: 36.6804, lng: 126.8495 },
  { name: '태안', lat: 36.7451, lng: 126.2975 },
  { name: '서천', lat: 36.0778, lng: 126.6915 },
  { name: '청양', lat: 36.4594, lng: 126.8026 },
  { name: '부여', lat: 36.2756, lng: 126.9097 },
  { name: '금산', lat: 36.1086, lng: 127.4881 },
  // ── 전라북도 ────────────────────────────────
  { name: '익산', lat: 35.9483, lng: 126.9577 },
  { name: '군산', lat: 35.9676, lng: 126.7368 },
  { name: '정읍', lat: 35.5699, lng: 126.8558 },
  { name: '김제', lat: 35.8038, lng: 126.8831 },
  { name: '남원', lat: 35.4163, lng: 127.3902 },
  { name: '고창', lat: 35.4352, lng: 126.7016 },
  { name: '부안', lat: 35.7318, lng: 126.7332 },
  { name: '무주', lat: 36.0076, lng: 127.6599 },
  { name: '진안', lat: 35.7908, lng: 127.4246 },
  { name: '장수', lat: 35.6474, lng: 127.5213 },
  { name: '순창', lat: 35.3745, lng: 127.1380 },
  { name: '임실', lat: 35.6175, lng: 127.2891 },
  { name: '완주', lat: 35.9062, lng: 127.1618 },
  // ── 전라남도 ────────────────────────────────
  { name: '여수', lat: 34.7604, lng: 127.6622 },
  { name: '순천', lat: 34.9507, lng: 127.4872 },
  { name: '목포', lat: 34.8118, lng: 126.3922 },
  { name: '나주', lat: 35.0160, lng: 126.7106 },
  { name: '광양', lat: 34.9406, lng: 127.6956 },
  { name: '담양', lat: 35.3213, lng: 126.9880 },
  { name: '구례', lat: 35.2027, lng: 127.4634 },
  { name: '고흥', lat: 34.6072, lng: 127.2789 },
  { name: '보성', lat: 34.7718, lng: 127.0800 },
  { name: '화순', lat: 35.0649, lng: 126.9862 },
  { name: '장흥', lat: 34.6814, lng: 126.9079 },
  { name: '강진', lat: 34.6419, lng: 126.7679 },
  { name: '해남', lat: 34.5737, lng: 126.5993 },
  { name: '영암', lat: 34.8001, lng: 126.6963 },
  { name: '무안', lat: 34.9902, lng: 126.4820 },
  { name: '함평', lat: 35.0665, lng: 126.5173 },
  { name: '영광', lat: 35.2771, lng: 126.5119 },
  { name: '장성', lat: 35.3019, lng: 126.7898 },
  { name: '완도', lat: 34.3097, lng: 126.7551 },
  { name: '진도', lat: 34.4869, lng: 126.2630 },
  { name: '신안', lat: 34.8298, lng: 126.1073 },
  { name: '곡성', lat: 35.2817, lng: 127.2918 },
  { name: '서울역', lat: 37.5547, lng: 126.9707 },
  { name: '명동', lat: 37.5635, lng: 126.9827 },
  { name: '을지로', lat: 37.5658, lng: 126.9971 },
  { name: '충정로', lat: 37.5594, lng: 126.9640 },
  { name: '홍대입구역', lat: 37.5573, lng: 126.9244 },
  { name: '합정역', lat: 37.5497, lng: 126.9149 },
  { name: '신촌역', lat: 37.5551, lng: 126.9368 },
  { name: '이태원역', lat: 37.5345, lng: 126.9946 },
  { name: '강남역', lat: 37.4979, lng: 127.0276 },
  { name: '선릉역', lat: 37.5045, lng: 127.0490 },
  { name: '건대입구역', lat: 37.5403, lng: 127.0699 },
  { name: '성수역', lat: 37.5445, lng: 127.0558 },
  { name: '압구정역', lat: 37.5272, lng: 127.0281 },
  { name: '여의도역', lat: 37.5217, lng: 126.9243 },
  { name: '부평역', lat: 37.4895, lng: 126.7228 },
  { name: '인천역', lat: 37.4754, lng: 126.6164 },
  { name: '수원역', lat: 37.2666, lng: 127.0001 },
  { name: '판교역', lat: 37.3948, lng: 127.1111 },
  { name: '부산역', lat: 35.1149, lng: 129.0422 },
  { name: '서면역', lat: 35.1580, lng: 129.0596 },
  { name: '대구역', lat: 35.8773, lng: 128.6027 },
  { name: '동성로', lat: 35.8692, lng: 128.6027 },
];

export function getStationCoords(keyword: string): { lat: number; lng: number } | null {
  const stationAreas = ALL_AREAS.filter(a => a.name.includes('역') || a.name.includes('로'));
  const match = stationAreas.find(a =>
    keyword.includes(a.name) || keyword.includes(a.name.replace('역', ''))
  );
  return match ? { lat: match.lat, lng: match.lng } : null;
}

function getAreaName(lat: number, lng: number): string {
  let closest = ALL_AREAS[0];
  let minDist = Infinity;
  for (const area of ALL_AREAS) {
    const d = Math.pow(lat - area.lat, 2) + Math.pow(lng - area.lng, 2);
    if (d < minDist) { minDist = d; closest = area; }
  }
  return closest.name;
}

function clusterBakeries(bakeries: { coordinates: { lat: number; lng: number } }[], zoom: number) {
  const gridSize = zoom <= 10 ? 0.15 : zoom <= 11 ? 0.08 : zoom <= 12 ? 0.04 : 0.02;
  const clusters: { lat: number; lng: number; count: number }[] = [];
  for (const b of bakeries) {
    if (!b.coordinates.lat || !b.coordinates.lng) continue;
    let merged = false;
    for (const c of clusters) {
      if (Math.abs(c.lat - b.coordinates.lat) < gridSize && Math.abs(c.lng - b.coordinates.lng) < gridSize) {
        c.lat = (c.lat * c.count + b.coordinates.lat) / (c.count + 1);
        c.lng = (c.lng * c.count + b.coordinates.lng) / (c.count + 1);
        c.count++;
        merged = true;
        break;
      }
    }
    if (!merged) clusters.push({ lat: b.coordinates.lat, lng: b.coordinates.lng, count: 1 });
  }
  return clusters;
}

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const userMarkerRef = useRef<naver.maps.Marker | null>(null);
  const clusterMarkersRef = useRef<naver.maps.Marker[]>([]);
  const infoWindowRef = useRef<naver.maps.InfoWindow | null>(null);
  const isProgrammaticMoveRef = useRef(false);

  const {
    filteredBakeries, selectedBakery, setSelectedBakery,
    searchArea, loadCachedBakeries, isLoadingNaver, isApiConnected,
    mapFlyTarget, setMapFlyTarget, setMapBounds, setMapZoom, clearSearchResult,
  } = useFilterContext();

  const [showSearchBtn, setShowSearchBtn] = useState(false);
  const [zoomTooLow, setZoomTooLow] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(15);
  const [hideBakeryMarkers, setHideBakeryMarkers] = useState(false);
  const searchedAreasRef = useRef<Set<string>>(new Set());
  const searchAreaRef = useRef(searchArea);
  const isApiConnectedRef = useRef(isApiConnected);
  useEffect(() => { searchAreaRef.current = searchArea; }, [searchArea]);
  useEffect(() => { isApiConnectedRef.current = isApiConnected; }, [isApiConnected]);

  // Init map — Naver Maps SDK 동적 로딩 후 초기화
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    loadNaverMapsScript()
      .then(() => initMap())
      .catch(err => console.warn('[MapView] Naver Maps 로딩 실패:', err));

    function initMap() {
      if (!mapRef.current || mapInstance.current) return;

      const map = new naver.maps.Map(mapRef.current, {
        center: new naver.maps.LatLng(SEOUL_CENTER[0], SEOUL_CENTER[1]),
        zoom: 15,
        mapTypeId: naver.maps.MapTypeId.NORMAL,
        minZoom: 7,
        maxZoom: 21,
        zoomControl: false,
        mapDataControl: false,
        scaleControl: false,
      });

      infoWindowRef.current = new naver.maps.InfoWindow({
        disableAnchor: true,
        backgroundColor: 'transparent',
        borderWidth: 0,
        anchorSize: new naver.maps.Size(0, 0),
        anchorColor: 'transparent',
        zIndex: 1200,
        pixelOffset: new naver.maps.Point(0, -8),
      });

      const initZoom = map.getZoom();
      setCurrentZoom(initZoom);
      setHideBakeryMarkers(initZoom <= 13);
      setMapZoom(initZoom);

      naver.maps.Event.addListener(map, 'zoom_changed', () => {
        const z = map.getZoom();
        setMapZoom(z);
        setCurrentZoom(z);
        setHideBakeryMarkers(z <= 13);
      });

      const initBounds = map.getBounds();
      setMapBounds({
        north: initBounds.getNE().lat(), south: initBounds.getSW().lat(),
        east: initBounds.getNE().lng(), west: initBounds.getSW().lng(),
      });

      naver.maps.Event.addListener(map, 'idle', () => {
        const b = map.getBounds();
        setMapBounds({
          north: b.getNE().lat(), south: b.getSW().lat(),
          east: b.getNE().lng(), west: b.getSW().lng(),
        });

        if (isProgrammaticMoveRef.current) {
          isProgrammaticMoveRef.current = false;
          return;
        }
        clearSearchResult();

        if (!isApiConnectedRef.current) return;
        const center = map.getCenter();
        const zoom = map.getZoom();
        if (zoom < 11) {
          setZoomTooLow(true);
          setShowSearchBtn(false);
          return;
        }
        setZoomTooLow(false);
        const area = getAreaName(center.lat(), center.lng());
        const key = `${area}-${Math.round(center.lat() * 10)}-${Math.round(center.lng() * 10)}`;
        if (!searchedAreasRef.current.has(key)) {
          searchedAreasRef.current.add(key);
          searchAreaRef.current(area);
        }
        setShowSearchBtn(false);
      });

      mapInstance.current = map;

      if (isApiConnected) {
        loadCachedBakeries();
      }

      // GPS: 앱 시작 시 자동으로 내 위치로 이동
      if (navigator.geolocation) {
        const gpsAsked = localStorage.getItem('gps_permission_asked');
        navigator.geolocation.getCurrentPosition(
          pos => {
            localStorage.setItem('gps_permission_asked', 'granted');
            const { latitude: lat, longitude: lng } = pos.coords;
            isProgrammaticMoveRef.current = true;
            map.morph(new naver.maps.LatLng(lat, lng), 15);
            userMarkerRef.current?.setMap(null);
            userMarkerRef.current = new naver.maps.Marker({
              position: new naver.maps.LatLng(lat, lng),
              map,
              icon: {
                content: '<div class="user-location-dot"><div class="user-dot-pulse"></div></div>',
                size: new naver.maps.Size(24, 24),
                anchor: new naver.maps.Point(12, 12),
              },
              zIndex: 1000,
            });
            if (isApiConnectedRef.current) searchAreaRef.current(getAreaName(lat, lng));
          },
          () => {
            // 권한 거부 또는 실패 — 서울 중심 유지
            if (!gpsAsked) localStorage.setItem('gps_permission_asked', 'denied');
          },
          { enableHighAccuracy: true, timeout: 8000 },
        );
      }
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
    };
  }, []);

  const handleSearchThisArea = useCallback(() => {
    if (!mapInstance.current) return;
    const center = mapInstance.current.getCenter();
    const area = getAreaName(center.lat(), center.lng());
    searchedAreasRef.current.add(`${area}-force-${Date.now()}`);
    searchArea(area);
    setShowSearchBtn(false);
  }, [searchArea]);

  // mapFlyTarget → Naver morph
  useEffect(() => {
    if (!mapFlyTarget || !mapInstance.current) return;
    isProgrammaticMoveRef.current = true;
    mapInstance.current.morph(
      new naver.maps.LatLng(mapFlyTarget.lat, mapFlyTarget.lng),
      mapFlyTarget.zoom ?? 15,
    );
    setMapFlyTarget(null);
  }, [mapFlyTarget, setMapFlyTarget]);

  // Bakery markers
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    clusterMarkersRef.current.forEach(m => m.setMap(null));
    clusterMarkersRef.current = [];

    if (hideBakeryMarkers) {
      clusterBakeries(filteredBakeries, currentZoom).forEach(cl => {
        const r = Math.min(12 + Math.sqrt(cl.count) * 5, 36);
        const size = r * 2;
        const html = `<div style="width:${size}px;height:${size}px;background:#D4956A;border-radius:50%;border:2.5px solid #fff;display:flex;align-items:center;justify-content:center;font-size:${r > 20 ? 13 : 10}px;font-weight:800;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.2);cursor:pointer;">${cl.count}</div>`;
        const m = new naver.maps.Marker({
          position: new naver.maps.LatLng(cl.lat, cl.lng),
          map,
          icon: { content: html, size: new naver.maps.Size(size, size), anchor: new naver.maps.Point(r, r) },
          zIndex: 100,
        });
        m.addListener('click', () => { mapInstance.current?.morph(new naver.maps.LatLng(cl.lat, cl.lng), 15); });
        clusterMarkersRef.current.push(m);
      });
      return;
    }

    filteredBakeries.forEach(bakery => {
      if (!bakery.coordinates.lat || !bakery.coordinates.lng) return;
      const hasFresh = bakery.bakingSchedule.some(s => isFreshlyBaked(s.bakedAt));
      const isSelected = selectedBakery?.id === bakery.id;
      const svgHtml = getBakeryMarkerSvg(bakery, hasFresh, isSelected);

      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(bakery.coordinates.lat, bakery.coordinates.lng),
        map,
        icon: {
          content: `<div class="bakery-map-marker">${svgHtml}</div>`,
          size: new naver.maps.Size(66, 82),
          anchor: new naver.maps.Point(33, 77),
        },
        zIndex: isSelected ? 300 : 200,
        clickable: true,
      });

      marker.addListener('click', () => {
        setSelectedBakery(selectedBakery?.id === bakery.id ? null : bakery);
      });

      const tooltipContent = bakery.isRegistered
        ? `<div class="bakery-tooltip"><b>${bakery.name}</b> <span style="color:#81C784">✓입점</span></div>`
        : `<div class="bakery-tooltip">${bakery.name}</div>`;

      marker.addListener('mouseover', () => {
        infoWindowRef.current?.setContent(tooltipContent);
        infoWindowRef.current?.open(map, marker);
        marker.setZIndex(500);
      });
      marker.addListener('mouseout', () => {
        infoWindowRef.current?.close();
        marker.setZIndex(isSelected ? 300 : 200);
      });

      markersRef.current.push(marker);
    });
  }, [filteredBakeries, selectedBakery, setSelectedBakery, hideBakeryMarkers, currentZoom]);

  // Pan to selected
  useEffect(() => {
    if (selectedBakery && mapInstance.current) {
      mapInstance.current.morph(
        new naver.maps.LatLng(selectedBakery.coordinates.lat, selectedBakery.coordinates.lng),
        16,
      );
    }
  }, [selectedBakery]);

  function handleLocateMe() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (mapInstance.current) {
          mapInstance.current.morph(new naver.maps.LatLng(lat, lng), 15);
          userMarkerRef.current?.setMap(null);
          userMarkerRef.current = new naver.maps.Marker({
            position: new naver.maps.LatLng(lat, lng),
            map: mapInstance.current,
            icon: {
              content: '<div class="user-location-dot"><div class="user-dot-pulse"></div></div>',
              size: new naver.maps.Size(24, 24),
              anchor: new naver.maps.Point(12, 12),
            },
            zIndex: 1000,
          });
          if (isApiConnected) searchArea(getAreaName(lat, lng));
        }
      },
      () => alert('위치 정보를 가져올 수 없습니다.'),
      { enableHighAccuracy: true },
    );
  }

  return (
    <div className="map-view">
      <div ref={mapRef} className="map-container" />

      {showSearchBtn && isApiConnected && (
        <button className="search-area-btn" onClick={handleSearchThisArea} disabled={isLoadingNaver}>
          {isLoadingNaver ? '검색 중...' : '🔍 이 지역에서 빵집 검색'}
        </button>
      )}

      {zoomTooLow && isApiConnected && !hideBakeryMarkers && (
        <div className="zoom-notice">
          <div className="zoom-notice-text">
            <span className="zoom-notice-icon">🔍</span>
            <div className="zoom-notice-msg">지도를 확대하면<br/>빵집이 검색됩니다</div>
          </div>
        </div>
      )}

      {isLoadingNaver && <div className="map-loading">검색 중...</div>}

      {!isApiConnected && (
        <div className="api-notice">
          <span>📋 데모 모드</span> · .env에 네이버 API 키를 설정하면 전국 빵집이 표시됩니다
        </div>
      )}

      <div className="zoom-indicator">Zoom {currentZoom}</div>

      <button className="locate-btn" onClick={handleLocateMe} title="내 위치">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="2" y1="12" x2="6" y2="12" />
          <line x1="18" y1="12" x2="22" y2="12" />
        </svg>
      </button>
      {!selectedBakery && (
        <div className="map-legend">
          <div className="legend-item"><span className="legend-dot registered-dot" /><span>추천 매장</span></div>
          <div className="legend-item"><span className="legend-dot independent-dot" /><span>개인 빵집</span></div>
          <div className="legend-item"><span className="legend-dot franchise-dot" /><span>프랜차이즈</span></div>
          <div className="legend-item"><span className="legend-steam-icon">~</span><span>갓 구운 빵</span></div>
        </div>
      )}
    </div>
  );
}
