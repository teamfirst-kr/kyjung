import type { VercelRequest, VercelResponse } from '@vercel/node';

// /api/kakao-geocode?lat=37.414&lng=126.718
// 카카오 좌표→주소 변환 API 프록시
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(200).end();
  }

  const apiKey = process.env.VITE_KAKAO_REST_API_KEY || '';
  if (!apiKey) {
    return res.status(500).json({ error: 'Kakao API key not configured' });
  }

  const { lat, lng } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng required' });
  }

  try {
    const url = `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${lng}&y=${lat}`;
    const response = await fetch(url, {
      headers: { Authorization: `KakaoAK ${apiKey}` },
    });
    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Kakao geocode request failed', detail: String(error) });
  }
}
