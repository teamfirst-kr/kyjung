// OSM Overpass API로 지하철 출구 + 노선 터널 데이터를 가져옵니다.
// 여러 미러 서버를 순차 시도해 504 타임아웃을 우회합니다.

export interface SubwayExit {
  id: number;
  lat: number;
  lng: number;
  ref: string;
  name?: string;
}

export interface SubwayTrack {
  id: number;
  coords: [number, number][];
  colour: string;
  name?: string;
}

const OVERPASS_ENDPOINTS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];

// Production(Vercel)에서는 서버사이드 프록시를 먼저 시도
const isProduction = typeof window !== 'undefined' &&
  !['localhost', '127.0.0.1'].includes(window.location.hostname);

async function fetchOverpassQuery(query: string): Promise<Response | null> {
  // Production: 서버 프록시 우선 (CORS·타임아웃 문제 없음)
  if (isProduction) {
    try {
      const res = await fetchWithTimeout(`/api/overpass?data=${encodeURIComponent(query)}`, 12000);
      if (res.ok) return res;
      console.warn('[Overpass proxy] status:', res.status);
    } catch (err) {
      console.warn('[Overpass proxy] failed:', err);
    }
  }
  // 로컬 dev 또는 프록시 실패 시: 직접 호출
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetchWithTimeout(`${endpoint}?data=${encodeURIComponent(query)}`, 7000);
      if (res.ok) return res;
    } catch (err) {
      console.warn(`[Overpass] ${endpoint} failed:`, err);
    }
  }
  return null;
}

// CartoDB 타일 색감에 맞춘 채도 낮춘 노선 색상
const LINE_COLOR_MAP: Record<string, string> = {
  '1': '#4A7DB5', '2': '#3FA66B', '3': '#D4874A',
  '4': '#38AACC', '5': '#8B6DAE', '6': '#C07840',
  '7': '#7A8C3A', '8': '#C45A82', '9': '#B8AA3A',
  '공항': '#5588BB', 'AREX': '#5588BB',
  '경의': '#5CAA90', '중앙': '#5CAA90',
  '수인': '#D4961E', '분당': '#D4961E',
  '신분당': '#C43060', '경춘': '#4A8AC4',
  '경강': '#3A5CA8', '인천': '#6A9EC4',
  '김포': '#8A6838', '의정부': '#C07840',
};

function resolveColour(tags: Record<string, string>): string {
  if (tags.colour) return tags.colour;
  if (tags.color)  return tags.color;
  const s = [tags.name, tags['name:ko'], tags.ref, tags.network, tags.line]
    .filter(Boolean).join(' ');
  for (const [key, color] of Object.entries(LINE_COLOR_MAP)) {
    if (s.includes(key)) return color;
  }
  return '#888';
}

async function fetchWithTimeout(url: string, ms = 7000): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

// 세션 캐시
const cache = new Map<string, { exits: SubwayExit[]; tracks: SubwayTrack[] }>();

function bboxKey(n: number, s: number, e: number, w: number): string {
  const p = 1000;
  return [Math.floor(s*p)/p, Math.floor(w*p)/p, Math.ceil(n*p)/p, Math.ceil(e*p)/p].join(',');
}

import { SUBWAY_STATIONS } from '../data/subwayStations';

/** 위도/경도 거리 (km) */
function distKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

/** 플랫폼 좌표 중심에서 가장 가까운 역의 주 노선 색상 반환 */
function colourByNearestStation(coords: [number, number][]): string {
  if (coords.length === 0) return '#888';
  const midIdx = Math.floor(coords.length / 2);
  const [cLat, cLng] = coords[midIdx];
  let best = SUBWAY_STATIONS[0];
  let bestDist = Infinity;
  for (const s of SUBWAY_STATIONS) {
    const d = distKm(cLat, cLng, s.lat, s.lng);
    if (d < bestDist) { bestDist = d; best = s; }
  }
  // 1km 이상 떨어지면 색상 불명
  return bestDist < 1 ? best.lines[0].color : '#888';
}

export async function fetchSubwayData(
  bounds: { north: number; south: number; east: number; west: number }
): Promise<{ exits: SubwayExit[]; tracks: SubwayTrack[] }> {
  const { north, south, east, west } = bounds;
  const key = bboxKey(north, south, east, west);
  if (cache.has(key)) return cache.get(key)!;

  // 줌 레벨 관계없이 역 출구를 잡기 위해 ~800m 버퍼 추가
  const BUF = 0.008; // ~800m
  const qs = south - BUF, qw = west - BUF, qn = north + BUF, qe = east + BUF;

  // subway_entrance(출구) + railway=platform(역 플랫폼) 쿼리
  const query = `[out:json][timeout:10];
(
  node["railway"="subway_entrance"](${qs},${qw},${qn},${qe});
  way["railway"="platform"](${qs},${qw},${qn},${qe});
  way["public_transport"="platform"]["subway"="yes"](${qs},${qw},${qn},${qe});
);
out body geom;`;

  const res = await fetchOverpassQuery(query);
  if (!res) return { exits: [], tracks: [] };

  try {
    const data = await res.json();
    const exits: SubwayExit[] = [];
    const tracksMap = new Map<number, SubwayTrack>();

    for (const el of data.elements) {
      if (el.type === 'node') {
        const ref = el.tags?.ref ?? el.tags?.['ref:korean'] ?? '?';
        exits.push({ id: el.id, lat: el.lat, lng: el.lon, ref, name: el.tags?.name });
      } else if (el.type === 'way' && el.geometry?.length > 1 && !tracksMap.has(el.id)) {
        const coords = el.geometry.map((g: { lat: number; lon: number }) => [g.lat, g.lon] as [number, number]);
        const colour = resolveColour(el.tags ?? {}) !== '#888'
          ? resolveColour(el.tags ?? {})
          : colourByNearestStation(coords);
        tracksMap.set(el.id, { id: el.id, coords, colour, name: el.tags?.name });
      }
    }

    const result = { exits, tracks: Array.from(tracksMap.values()) };
    cache.set(key, result);
    return result;
  } catch (err) {
    console.warn('[Overpass] JSON parse error:', err);
    return { exits: [], tracks: [] };
  }
}
