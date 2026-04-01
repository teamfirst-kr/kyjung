import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * GET /api/image-proxy?url=<encoded_image_url>
 * 네이버 이미지 썸네일은 브라우저에서 직접 로드 시 CORS 차단됨.
 * 서버에서 이미지를 가져와 프록시로 전달합니다.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url parameter required' });
  }

  // 허용된 도메인만 프록시 (네이버 썸네일 도메인)
  const ALLOWED_HOSTS = [
    'search.pstatic.net',
    'blogpfthumb-phinf.pstatic.net',
    'postfiles.pstatic.net',
    'imgnews.pstatic.net',
    'ssl.pstatic.net',
    'pstatic.net',
    'naver.net',
    'naverusercontent.com',
    // YouTube / Google CDN
    'ytimg.com',
    'img.youtube.com',
    'googleusercontent.com',
    'ggpht.com',
    // Kakao CDN
    'kakaocdn.net',
    'daumcdn.net',
  ];

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const isAllowed = ALLOWED_HOSTS.some(host => parsed.hostname.endsWith(host));
  if (!isAllowed) {
    return res.status(403).json({ error: `Host not allowed: ${parsed.hostname}` });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BbangMapBot/1.0)',
        'Referer': 'https://www.naver.com/',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Upstream fetch failed' });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1일 캐시
    res.setHeader('Content-Length', buffer.length);
    return res.status(200).send(buffer);
  } catch (err) {
    return res.status(500).json({ error: 'Proxy fetch failed', detail: String(err) });
  }
}
