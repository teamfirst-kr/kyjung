import { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef, ReactNode } from 'react';
import { Bakery, BakeryType } from '../types/bakery';
import { mockBakeries } from '../mock/bakeries';
import { isFreshlyBaked } from '../utils/time';
import { searchBakeriesByArea, searchBakeries, isNaverApiConfigured } from '../services/naverPlaces';
import { setCachedBakeries, getAllCachedBakeries } from '../services/bakeryCache';
import { fetchBakeries } from '../services/bakeryService';

export const BREAD_CATEGORIES = [
  '소금빵', '케이크', '베이글', '식빵',
] as const;

export interface FilterState {
  includeFranchise: boolean;
  currentlyBaking: boolean;
  minRating: number;
  searchQuery: string;
  sortBy: 'rating' | 'name' | 'reviewCount';
  breadCategory: string | null;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface SearchResult {
  bakeries: Bakery[];
  center: { lat: number; lng: number } | null;
  suggestions: string[];
}

interface FilterContextType {
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  filteredBakeries: Bakery[];
  selectedBakery: Bakery | null;
  setSelectedBakery: (b: Bakery | null) => void;
  naverBakeries: Bakery[];
  isLoadingNaver: boolean;
  searchArea: (area: string) => Promise<void>;
  loadCachedBakeries: () => void;  // localStorage 캐시 → 상태 즉시 반영
  searchByKeyword: (keyword: string) => Promise<SearchResult>;
  lastSearchResult: SearchResult | null;
  clearSearchResult: () => void;
  isApiConnected: boolean;
  // Map navigation & viewport
  mapFlyTarget: { lat: number; lng: number; zoom?: number } | null;
  setMapFlyTarget: (target: { lat: number; lng: number; zoom?: number } | null) => void;
  mapBounds: MapBounds | null;
  setMapBounds: (bounds: MapBounds | null) => void;
  mapZoom: number;
  setMapZoom: (zoom: number) => void;
}

const FilterContext = createContext<FilterContextType | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>({
    includeFranchise: true,  // 프랜차이즈 기본 표시
    currentlyBaking: false,
    minRating: 0,
    searchQuery: '',
    sortBy: 'rating',
    breadCategory: null,
  });
  const [selectedBakery, setSelectedBakery] = useState<Bakery | null>(null);
  const [naverBakeries, setNaverBakeries] = useState<Bakery[]>([]);
  const [supabaseBakeries, setSupabaseBakeries] = useState<Bakery[]>([]); // 크론이 수집해 DB에 저장한 데이터
  const [isLoadingNaver, setIsLoadingNaver] = useState(false);
  const [lastSearchResult, setLastSearchResult] = useState<SearchResult | null>(null);
  const [mapFlyTarget, setMapFlyTarget] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(13);

  // 앱 시작 시 Supabase(크론이 수집한 전국 빵집)에서 한 번만 로드
  useEffect(() => {
    fetchBakeries().then(data => {
      const mockNames = new Set(mockBakeries.map(b => b.name));
      setSupabaseBakeries(data.filter(b => !mockNames.has(b.name)));
    }).catch(() => { /* Supabase 미연결 시 무시 — mockBakeries로 폴백 */ });
  }, []);
  const isApiConnected = isNaverApiConfigured();

  const clearSearchResult = useCallback(() => setLastSearchResult(null), []);
  const categorySearchedRef = useRef<Set<string>>(new Set());

  // 카테고리 선택 시 해당 키워드로 네이버 API 추가 검색
  useEffect(() => {
    const cat = filters.breadCategory;
    if (!cat || !isApiConnected) return;
    if (categorySearchedRef.current.has(cat)) return;
    categorySearchedRef.current.add(cat);

    // 현재 지도 중심 기반으로 카테고리 키워드 검색
    (async () => {
      setIsLoadingNaver(true);
      try {
        // 여러 검색 쿼리로 빵집 수집
        const queries = [
          `${cat} 빵집`,
          `${cat} 베이커리`,
          `${cat} 맛집`,
          `${cat} 카페`,
        ];
        const results = await Promise.all(queries.map(q => searchBakeries(q)));
        const allNew = results.flatMap(r => r.bakeries);

        if (allNew.length > 0) {
          setNaverBakeries(prev => {
            const existingIds = new Set(prev.map(b => b.id));
            const deduped = allNew.filter(b => !existingIds.has(b.id));
            return [...prev, ...deduped];
          });
        }
      } catch (e) {
        console.warn('Category search failed:', e);
      } finally {
        setIsLoadingNaver(false);
      }
    })();
  }, [filters.breadCategory, isApiConnected]);

  const searchArea = useCallback(async (area: string) => {
    if (!isApiConnected) return;
    setIsLoadingNaver(true);
    try {
      const results = await searchBakeriesByArea(area);
      // API 결과를 localStorage에 캐시 저장
      if (results.length > 0) setCachedBakeries(area, results);
      setNaverBakeries(prev => {
        const existingIds = new Set(prev.map(b => b.id));
        const newOnes = results.filter(b => !existingIds.has(b.id));
        return [...prev, ...newOnes];
      });
    } catch (e) {
      console.warn('Area search failed:', e);
    } finally {
      setIsLoadingNaver(false);
    }
  }, [isApiConnected]);

  /** localStorage에 저장된 전체 캐시를 즉시 상태에 반영 (API 호출 없음) */
  const loadCachedBakeries = useCallback(() => {
    const cached = getAllCachedBakeries();
    if (cached.length === 0) return;
    setNaverBakeries(prev => {
      const existingIds = new Set(prev.map(b => b.id));
      const newOnes = cached.filter(b => !existingIds.has(b.id));
      return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
    });
  }, []);

  // 위치 키워드 감지 (역명, 지역명)
  const BAKERY_KEYWORDS = ['빵집', '베이커리', '빵', '매장', '맛집', '소금빵', '크로와상', '베이글', '케이크', '제과'];

  function extractLocation(keyword: string): { location: string; foodKeyword: string } | null {
    const parts = keyword.trim().split(/\s+/);
    if (parts.length < 2) return null;
    const lastPart = parts[parts.length - 1];
    const isFoodKw = BAKERY_KEYWORDS.some(bk => lastPart.includes(bk));
    if (!isFoodKw) return null;
    const location = parts.slice(0, -1).join(' ');
    return { location, foodKeyword: lastPart };
  }

  function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function generateSuggestions(keyword: string): string[] {
    const suggestions: string[] = [];
    const kw = keyword.toLowerCase();
    const POPULAR_AREAS = [
      '강남', '홍대', '합정', '성수', '이태원', '종로', '을지로',
      '부평', '인천', '수원', '부산 서면', '부산 해운대', '대구', '대전',
      '공덕', '마포', '신촌', '건대', '압구정', '여의도', '판교',
      '전주', '제주', '광주', '춘천', '천안',
      '가산', '구로', '금천', '가산디지털단지', '구로디지털단지',  // 디지털단지 권역
      '양천', '목동', '은평', '강북', '도봉', '중랑', '강동',      // 기존 누락 서울
    ];
    const matchedAreas = POPULAR_AREAS.filter(a =>
      a.includes(kw) || kw.includes(a) || a.slice(0, 2) === kw.slice(0, 2)
    );
    matchedAreas.forEach(area => {
      suggestions.push(`${area} 빵집`);
      suggestions.push(`${area} 베이커리`);
    });
    const BREAD_TYPES = ['소금빵', '크로와상', '베이글', '식빵', '케이크', '마카롱'];
    BREAD_TYPES.forEach(bread => {
      if (kw.includes(bread.slice(0, 2))) {
        suggestions.push(`서울 ${bread}`);
      }
    });
    return suggestions.slice(0, 5);
  }

  const searchByKeyword = useCallback(async (keyword: string): Promise<SearchResult> => {
    const empty: SearchResult = { bakeries: [], center: null, suggestions: [] };
    if (!isApiConnected || !keyword.trim()) return empty;

    setIsLoadingNaver(true);
    try {
      const parsed = extractLocation(keyword);

      if (parsed) {
        const results = await searchBakeriesByArea(parsed.location);
        if (results.length > 0) {
          setNaverBakeries(prev => {
            const existingIds = new Set(prev.map(b => b.id));
            const newOnes = results.filter(b => !existingIds.has(b.id));
            return [...prev, ...newOnes];
          });
          const center = {
            lat: results.reduce((sum, b) => sum + b.coordinates.lat, 0) / results.length,
            lng: results.reduce((sum, b) => sum + b.coordinates.lng, 0) / results.length,
          };
          const nearby = results
            .map(b => ({ bakery: b, dist: distanceKm(center.lat, center.lng, b.coordinates.lat, b.coordinates.lng) }))
            .filter(x => x.dist <= 1.5)
            .sort((a, b) => a.dist - b.dist)
            .map(x => x.bakery);

          const result: SearchResult = { bakeries: nearby.length > 0 ? nearby : results, center, suggestions: [] };
          setLastSearchResult(result);
          // 지도 이동 (detail 패널 열지 않고 좌표만 이동)
          setMapFlyTarget({ lat: center.lat, lng: center.lng, zoom: 14 });
          return result;
        }
      }

      // 직접 키워드 검색
      const { bakeries } = await searchBakeries(keyword);
      if (bakeries.length > 0) {
        setNaverBakeries(prev => {
          const existingIds = new Set(prev.map(b => b.id));
          const newOnes = bakeries.filter(b => !existingIds.has(b.id));
          return [...prev, ...newOnes];
        });
        const center = { lat: bakeries[0].coordinates.lat, lng: bakeries[0].coordinates.lng };
        const result: SearchResult = { bakeries, center, suggestions: [] };
        setLastSearchResult(result);
        // 지도 이동
        setMapFlyTarget({ lat: center.lat, lng: center.lng, zoom: 14 });
        return result;
      }

      // 결과 없음 → 추천 검색어
      const suggestions = generateSuggestions(keyword);
      const result: SearchResult = { bakeries: [], center: null, suggestions };
      setLastSearchResult(result);
      return result;
    } catch (e) {
      console.warn('Keyword search failed:', e);
      return empty;
    } finally {
      setIsLoadingNaver(false);
    }
  }, [isApiConnected]);

  // Mock(하드코딩) + Supabase(크론 수집) + Naver(사용자 실시간 검색) 3계층 병합
  const allBakeries = useMemo(() => {
    const nameSet = new Set(mockBakeries.map(b => b.name));
    // Supabase 데이터 중복 제거
    const fromDB = supabaseBakeries.filter(b => {
      if (nameSet.has(b.name)) return false;
      nameSet.add(b.name);
      return true;
    });
    // 사용자 실시간 검색 결과 중복 제거
    const fromNaver = naverBakeries.filter(b => {
      if (nameSet.has(b.name)) return false;
      nameSet.add(b.name);
      return true;
    });
    return [...mockBakeries, ...fromDB, ...fromNaver];
  }, [supabaseBakeries, naverBakeries]);

  const filteredBakeries = useMemo(() => {
    let source: Bakery[];

    if (lastSearchResult && lastSearchResult.bakeries.length > 0) {
      // 검색 결과 모드: lastSearchResult의 빵집 사용 (text filter 적용 안함)
      source = [...lastSearchResult.bakeries];
    } else {
      // 지도 뷰포트 모드: 현재 화면 범위 내 빵집 표시
      source = [...allBakeries];
      if (mapBounds) {
        source = source.filter(b =>
          b.coordinates.lat >= mapBounds.south &&
          b.coordinates.lat <= mapBounds.north &&
          b.coordinates.lng >= mapBounds.west &&
          b.coordinates.lng <= mapBounds.east
        );
      }
      // 텍스트 검색 (뷰포트 모드에서만)
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        source = source.filter(b =>
          b.name.toLowerCase().includes(q) ||
          b.address.toLowerCase().includes(q) ||
          b.tags.some(t => t.toLowerCase().includes(q))
        );
      }
    }

    // 공통 필터 적용
    if (!filters.includeFranchise) {
      source = source.filter(b => b.type !== BakeryType.FRANCHISE);
    }
    if (filters.breadCategory) {
      const cat = filters.breadCategory;
      source = source.filter(b =>
        b.name.includes(cat) ||
        b.tags.some(t => t.includes(cat)) ||
        b.description.includes(cat)
      );
    }
    if (filters.currentlyBaking) {
      source = source.filter(b =>
        b.bakingSchedule.length > 0 && b.bakingSchedule.some(s => isFreshlyBaked(s.bakedAt))
      );
    }
    if (filters.minRating > 0) {
      source = source.filter(b => b.rating >= filters.minRating);
    }

    // 정렬: 입점 → 프리미엄 → 선택 기준
    source.sort((a, b) => {
      if (a.isRegistered !== b.isRegistered) return a.isRegistered ? -1 : 1;
      if (a.isPremium !== b.isPremium) return a.isPremium ? -1 : 1;
      switch (filters.sortBy) {
        case 'rating': {
          // 추천순: 평점 × log(리뷰수+1) 복합 스코어
          const sa = a.rating * Math.log10(Math.max(a.reviewCount, 1) + 1);
          const sb = b.rating * Math.log10(Math.max(b.reviewCount, 1) + 1);
          return sb - sa;
        }
        case 'reviewCount': return b.reviewCount - a.reviewCount;
        case 'name': return a.name.localeCompare(b.name, 'ko');
        default: return 0;
      }
    });

    return source;
  }, [filters, allBakeries, lastSearchResult, mapBounds]);

  return (
    <FilterContext.Provider value={{
      filters, setFilters, updateFilter: (key, value) => setFilters(prev => ({ ...prev, [key]: value })),
      filteredBakeries, selectedBakery, setSelectedBakery,
      naverBakeries, isLoadingNaver, searchArea, loadCachedBakeries, searchByKeyword, lastSearchResult, clearSearchResult, isApiConnected,
      mapFlyTarget, setMapFlyTarget, mapBounds, setMapBounds, mapZoom, setMapZoom,
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilterContext() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilterContext must be inside FilterProvider');
  return ctx;
}
