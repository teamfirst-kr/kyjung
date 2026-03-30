import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  const { path } = req.query;
  const naverPath = Array.isArray(path) ? path.join('/') : path || '';

  const clientId = process.env.VITE_NAVER_CLIENT_ID || '';
  const clientSecret = process.env.VITE_NAVER_CLIENT_SECRET || '';

  // 환경변수 체크
  if (!clientId || !clientSecret) {
    return res.status(500).json({
      error: 'Naver API keys not configured',
      hint: 'Set VITE_NAVER_CLIENT_ID and VITE_NAVER_CLIENT_SECRET in Vercel Environment Variables',
    });
  }

  // 쿼리 파라미터 전달
  const url = new URL(`https://openapi.naver.com/${naverPath}`);
  const queryParams = { ...req.query };
  delete queryParams.path;
  for (const [key, val] of Object.entries(queryParams)) {
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

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Naver API proxy error:', error);
    return res.status(500).json({ error: 'Naver API proxy failed', detail: String(error) });
  }
}
