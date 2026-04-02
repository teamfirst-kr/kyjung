import type { Bakery } from '../types/bakery';

// ── TTL 상수 ──────────────────────────────────────────────────────────────────
export const CACHE_TTL = {
  PRIORITY: 24 * 60 * 60 * 1000,      // 우선지역: 1일
  REGIONAL: 7 * 24 * 60 * 60 * 1000,  // 지방·기타: 7일
} as const;

const CACHE_KEY = 'bakery_cache_v1';

interface CacheEntry {
  bakeries: Bakery[];
  fetchedAt: number; // Date.now()
}

type CacheStore = Record<string, CacheEntry>;

// ── 내부 읽기/쓰기 ────────────────────────────────────────────────────────────
function readStore(): CacheStore {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CacheStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: CacheStore): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(store));
  } catch {
    // storage full → 캐시 초기화 후 재시도
    localStorage.removeItem(CACHE_KEY);
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(store)); } catch { /* noop */ }
  }
}

// ── 공개 API ──────────────────────────────────────────────────────────────────

/** 특정 지역의 캐시가 TTL 이내인지 확인 */
export function isCacheFresh(area: string, ttl: number): boolean {
  const entry = readStore()[area];
  if (!entry) return false;
  return Date.now() - entry.fetchedAt < ttl;
}

/** 특정 지역 캐시 저장 */
export function setCachedBakeries(area: string, bakeries: Bakery[]): void {
  const store = readStore();
  store[area] = { bakeries, fetchedAt: Date.now() };
  writeStore(store);
}

/** 전체 캐시에서 중복 제거된 빵집 목록 반환 */
export function getAllCachedBakeries(): Bakery[] {
  const store = readStore();
  const seen = new Set<string>();
  const all: Bakery[] = [];
  for (const entry of Object.values(store)) {
    for (const b of entry.bakeries) {
      if (!seen.has(b.id)) {
        seen.add(b.id);
        all.push(b);
      }
    }
  }
  return all;
}

/** 캐시 전체 삭제 (강제 새로고침 용도) */
export function clearBakeryCache(): void {
  localStorage.removeItem(CACHE_KEY);
}
