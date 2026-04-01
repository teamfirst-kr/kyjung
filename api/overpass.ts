import type { VercelRequest, VercelResponse } from '@vercel/node';

// Overpass API 서버사이드 프록시 — Production에서 CORS/타임아웃 우회
const ENDPOINTS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { data } = req.query;
  if (!data || typeof data !== 'string') {
    return res.status(400).json({ error: 'Missing data parameter' });
  }

  for (const endpoint of ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 9000);

      const upstream = await fetch(`${endpoint}?data=${encodeURIComponent(data)}`, {
        signal: controller.signal,
        headers: { 'User-Agent': 'BreadMap/1.0 (bakery-app)' },
      });
      clearTimeout(timer);

      if (!upstream.ok) {
        console.warn(`[overpass proxy] ${endpoint} → ${upstream.status}`);
        continue;
      }

      const json = await upstream.json();
      // Vercel Edge 캐시 3분
      res.setHeader('Cache-Control', 'public, s-maxage=180, stale-while-revalidate=300');
      return res.json(json);
    } catch (err) {
      console.warn(`[overpass proxy] ${endpoint} failed:`, err);
    }
  }

  return res.status(504).json({ error: 'All Overpass endpoints timed out' });
}
