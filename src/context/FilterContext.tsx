import { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';
import { Bakery, BakeryType } from '../types/bakery';
import { mockBakeries } from '../mock/bakeries';
import { isFreshlyBaked } from '../utils/time';
import { searchBakeriesByArea, isNaverApiConfigured } from '../services/naverPlaces';

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
  const isApiConnected = isNaverApiConfigured();

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
      naverBakeries, isLoadingNaver, searchArea, isApiConnected,
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
