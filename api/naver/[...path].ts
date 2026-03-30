import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { path } = req.query;
  const naverPath = Array.isArray(path) ? path.join('/') : path || '';

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
        'X-Naver-Client-Id': process.env.VITE_NAVER_CLIENT_ID || '',
        'X-Naver-Client-Secret': process.env.VITE_NAVER_CLIENT_SECRET || '',
      },
    });

    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Naver API proxy error:', error);
    return res.status(500).json({ error: 'Naver API proxy failed' });
  }
}
