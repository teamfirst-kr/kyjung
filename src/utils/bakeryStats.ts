/**
 * 빵집 클릭 통계 (localStorage 기반)
 * - 빵집 클릭 시 기록
 * - 최근 7일간 인기 빵집 조회
 */

const STATS_KEY = 'bakery_click_stats';

interface BakeryClickRecord {
  name: string;
  clicks: number;
  lastClick: number;
}

export function trackBakeryClick(bakeryId: string, bakeryName: string): void {
  try {
    const stats: Record<string, BakeryClickRecord> = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    const existing = stats[bakeryId];
    stats[bakeryId] = {
      name: bakeryName,
      clicks: (existing?.clicks || 0) + 1,
      lastClick: Date.now(),
    };
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch { /* ignore storage errors */ }
}

export interface TopBakery {
  id: string;
  name: string;
  clicks: number;
}

export function getTopBakeries(limit = 5): TopBakery[] {
  try {
    const stats: Record<string, BakeryClickRecord> = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    return Object.entries(stats)
      .filter(([, v]) => v.lastClick >= weekAgo)
      .map(([id, v]) => ({ id, name: v.name, clicks: v.clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, limit);
  } catch {
    return [];
  }
}
