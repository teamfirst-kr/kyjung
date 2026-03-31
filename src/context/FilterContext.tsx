import { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';
import { Bakery, BakeryType } from '../types/bakery';
import { mockBakeries } from '../mock/bakeries';
import { isFreshlyBaked } from '../utils/time';
import { searchBakeriesByArea, searchBakeries, isNaverApiConfigured } from '../services/naverPlaces';

export const BREAD_CATEGORIES = [
  '소금빵', '크로와상', '바게트', '식빵', '케이크',
  '베이글', '스콘', '소보로', '단팥빵', '천연발효',
  '디저트', '샌드위치',
] as const;

export interface FilterState {
  includeFranchise: boolean;
  currentlyBaking: boolean;
  minRating: number;
  searchQuery: string;
  sortBy: 'rating' | 'name' | 'reviewCount';
  breadCategory: string | null;
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
  searchByKeyword: (keyword: string) => Promise<SearchResult>;
  lastSearchResult: SearchResult | null;
  clearSearchResult: () => void;
  isApiConnected: boolean;
}

const FilterContext = createContext<FilterContextType | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>({
    includeFranchise: false,
    currentlyBaking: false,
    minRating: 0,
    searchQuery: '',
    sortBy: 'rating',
    breadCategory: null,
  });
  const [selectedBakery, setSelectedBakery] = useState<Bakery | null>(null);
  const [naverBakeries, setNaverBakeries] = useState<Bakery[]>([]);
  const [isLoadingNaver, setIsLoadingNaver] = useState(false);
  const [lastSearchResult, setLastSearchResult] = useState<SearchResult | null>(null);
  const isApiConnected = isNaverApiConfigured();

  const clearSearchResult = useCallback(() => setLastSearchResult(null), []);

  const searchArea = useCallback(async (area: string) => {
    if (!isApiConnected) return;
    setIsLoadingNaver(true);
    try {
      const results = await searchBakeriesByArea(area);
      setNaverBakeries(prev => {
        // 기존 결과에 새 결과 병합 (중복 제거)
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

  // 위치 키워드 감지 (역명, 지역명)
  const BAKERY_KEYWORDS = ['빵집', '베이커리', '빵', '매장', '맛집', '소금빵', '크로와상', '베이글', '케이크', '제과'];

  function extractLocation(keyword: string): { location: string; foodKeyword: string } | null {
    // "공덕역 빵집" → location: "공덕역", foodKeyword: "빵집"
    // "부평 소금빵" → location: "부평", foodKeyword: "소금빵"
    const parts = keyword.trim().split(/\s+/);
    if (parts.length < 2) return null;

    const lastPart = parts[parts.length - 1];
    const isFoodKw = BAKERY_KEYWORDS.some(bk => lastPart.includes(bk));
    if (!isFoodKw) return null;

    const location = parts.slice(0, -1).join(' ');
    return { location, foodKeyword: lastPart };
  }

  // 두 좌표 사이 거리 (km)
  function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // 추천 검색어 생성
  function generateSuggestions(keyword: string): string[] {
    const suggestions: string[] = [];
    const kw = keyword.toLowerCase();

    // 지역명 매칭
    const POPULAR_AREAS = [
      '강남', '홍대', '합정', '성수', '이태원', '종로', '을지로',
      '부평', '인천', '수원', '부산 서면', '부산 해운대', '대구', '대전',
      '공덕', '마포', '신촌', '건대', '압구정', '여의도', '판교',
      '전주', '제주', '광주', '춘천', '천안',
    ];

    const matchedAreas = POPULAR_AREAS.filter(a =>
      a.includes(kw) || kw.includes(a) ||
      a.slice(0, 2) === kw.slice(0, 2)
    );

    matchedAreas.forEach(area => {
      suggestions.push(`${area} 빵집`);
      suggestions.push(`${area} 베이커리`);
    });

    // 빵 종류 매칭
    const BREAD_TYPES = ['소금빵', '크로와상', '베이글', '식빵', '케이크', '마카롱'];
    BREAD_TYPES.forEach(bread => {
      if (kw.includes(bread.slice(0, 2))) {
        suggestions.push(`서울 ${bread}`);
      }
    });

    return suggestions.slice(0, 5);
  }

  // 검색 (지역+키워드 → 반경 1km 리스트)
  const searchByKeyword = useCallback(async (keyword: string): Promise<SearchResult> => {
    const empty: SearchResult = { bakeries: [], center: null, suggestions: [] };
    if (!isApiConnected || !keyword.trim()) return empty;

    setIsLoadingNaver(true);
    try {
      const parsed = extractLocation(keyword);

      if (parsed) {
        // "공덕역 빵집" → 지역 기반 검색
        // 1) 네이버에서 위치 키워드로 빵집 검색
        const results = await searchBakeriesByArea(parsed.location);

        if (results.length > 0) {
          // 결과 병합
          setNaverBakeries(prev => {
            const existingIds = new Set(prev.map(b => b.id));
            const newOnes = results.filter(b => !existingIds.has(b.id));
            return [...prev, ...newOnes];
          });

          // 중심점 계산 (결과들의 평균 좌표)
          const center = {
            lat: results.reduce((sum, b) => sum + b.coordinates.lat, 0) / results.length,
            lng: results.reduce((sum, b) => sum + b.coordinates.lng, 0) / results.length,
          };

          // 반경 1km 필터 (중심점에서 가까운 순 정렬)
          const nearby = results
            .map(b => ({
              bakery: b,
              dist: distanceKm(center.lat, center.lng, b.coordinates.lat, b.coordinates.lng),
            }))
            .filter(x => x.dist <= 1.5) // 1.5km 반경
            .sort((a, b) => a.dist - b.dist)
            .map(x => x.bakery);

          const result: SearchResult = { bakeries: nearby.length > 0 ? nearby : results, center, suggestions: [] };
          setLastSearchResult(result);
          return result;
        }
      }

      // 직접 키워드 검색 (빵집 이름 등)
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
        return result;
      }

      // 결과 없음 → 추천 검색어 생성
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

  // 자체 등록(Mock) + 네이버 API 결과 병합
  const allBakeries = useMemo(() => {
    const registeredIds = new Set(mockBakeries.map(b => b.name));
    // 네이버 데이터 중 Mock과 이름이 같은 것은 제외 (자체 등록 우선)
    const deduped = naverBakeries.filter(b => !registeredIds.has(b.name));
    return [...mockBakeries, ...deduped];
  }, [naverBakeries]);

  const filteredBakeries = useMemo(() => {
    let result = [...allBakeries];

    // Exclude franchise by default
    if (!filters.includeFranchise) {
      result = result.filter(b => b.type !== BakeryType.FRANCHISE);
    }

    // Search
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        b =>
          b.name.toLowerCase().includes(q) ||
          b.address.toLowerCase().includes(q) ||
          b.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Bread category
    if (filters.breadCategory) {
      const cat = filters.breadCategory.toLowerCase();
      result = result.filter(b =>
        b.tags.some(t => t.toLowerCase().includes(cat)) ||
        b.bakingSchedule.some(s => s.breadType.toLowerCase().includes(cat)) ||
        b.name.toLowerCase().includes(cat)
      );
    }

    // Currently baking (only applies to registered bakeries with schedule)
    if (filters.currentlyBaking) {
      result = result.filter(b =>
        b.bakingSchedule.length > 0 && b.bakingSchedule.some(s => isFreshlyBaked(s.bakedAt))
      );
    }

    // Min rating (only applies to bakeries with ratings)
    if (filters.minRating > 0) {
      result = result.filter(b => b.rating >= filters.minRating);
    }

    // Sort - registered first, then premium, then by sort
    result.sort((a, b) => {
      // 입점 매장 우선
      if (a.isRegistered !== b.isRegistered) return a.isRegistered ? -1 : 1;
      // 프리미엄 우선
      if (a.isPremium !== b.isPremium) return a.isPremium ? -1 : 1;
      switch (filters.sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'reviewCount': return b.reviewCount - a.reviewCount;
        case 'name': return a.name.localeCompare(b.name, 'ko');
        default: return 0;
      }
    });

    return result;
  }, [filters, allBakeries]);

  return (
    <FilterContext.Provider value={{
      filters, setFilters, updateFilter: (key, value) => setFilters(prev => ({ ...prev, [key]: value })),
      filteredBakeries, selectedBakery, setSelectedBakery,
      naverBakeries, isLoadingNaver, searchArea, searchByKeyword, lastSearchResult, clearSearchResult, isApiConnected,
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
