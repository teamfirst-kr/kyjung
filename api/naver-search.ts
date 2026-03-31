import type { VercelRequest, VercelResponse } from '@vercel/node';

// /api/naver-search?type=local&query=서울+베이커리&display=5&sort=comment
// /api/naver-search?type=image&query=성심당+빵집+매장&display=4&sort=sim
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(200).end();
  }

  const clientId = process.env.VITE_NAVER_CLIENT_ID || '';
  const clientSecret = process.env.VITE_NAVER_CLIENT_SECRET || '';

  if (!clientId || !clientSecret) {
    return res.status(500).json({
      error: 'Naver API keys not configured',
      configured: { id: !!clientId, secret: !!clientSecret },
    });
  }

  const { type, ...params } = req.query;
  const searchType = type === 'image' ? 'image' : 'local';

  const url = new URL(`https://openapi.naver.com/v1/search/${searchType}.json`);
  for (const [key, val] of Object.entries(params)) {
    if (typeof val === 'string') url.searchParams.set(key, val);
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Naver API request failed', detail: String(error) });
  }
}
