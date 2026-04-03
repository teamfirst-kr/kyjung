// Invidious API proxy — API 키 없이 YouTube 동영상 검색
// Invidious는 YouTube의 오픈소스 프론트엔드로 무료 공개 API를 제공합니다.
import type { VercelRequest, VercelResponse } from '@vercel/node';

// 공개 Invidious 인스턴스 목록 (하나가 다운되면 다음으로 폴백)
const INVIDIOUS_INSTANCES = [
  'https://inv.nadeko.net',
  'https://invidious.nerdvpn.de',
  'https://invidious.privacyredirect.com',
  'https://iv.melmac.space',
];

interface InvidiousVideo {
  type: string;
  title: string;
  videoId: string;
  author: string;
  published: number;
  description: string;
  viewCount: number;
  videoThumbnails: Array<{ quality: string; url: string; width: number; height: number }>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const q = (req.query.q as string) || '빵집 투어';
  const maxResults = Math.min(Number(req.query.maxResults) || 10, 20);

  const params = new URLSearchParams({
    q,
    type: 'video',
    region: 'KR',
    hl: 'ko',
    page: '1',
  });

  let lastError: string = 'No instances available';

  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const url = `${instance}/api/v1/search?${params}`;
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5000), // 5초 타임아웃
        headers: { 'User-Agent': 'BreadMapApp/1.0' },
      });

      if (!response.ok) {
        lastError = `${instance} returned ${response.status}`;
        continue;
      }

      const data: InvidiousVideo[] = await response.json();

      const minViews = Number(req.query.minViews) || 0;

      const videos = data
        .filter(item => item.type === 'video' && item.videoId && (item.viewCount || 0) >= minViews)
        .slice(0, maxResults)
        .map(item => {
          // mqdefault (320×180) 또는 hqdefault (480×360) 우선
          const thumb =
            item.videoThumbnails?.find(t => t.quality === 'medium')?.url ||
            item.videoThumbnails?.find(t => t.quality === 'high')?.url ||
            `https://i.ytimg.com/vi/${item.videoId}/mqdefault.jpg`;

          return {
            videoId: item.videoId,
            title: item.title,
            thumbnail: thumb,
            channelTitle: item.author,
            publishedAt: item.published
              ? new Date(item.published * 1000).toISOString()
              : '',
            description: item.description || '',
            viewCount: item.viewCount || 0,
            watchUrl: `https://www.youtube.com/watch?v=${item.videoId}`,
          };
        });

      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600');
      return res.status(200).json({ videos, instance });
    } catch (err) {
      lastError = String(err);
      continue; // 다음 인스턴스 시도
    }
  }

  // 모든 인스턴스 실패 시
  return res.status(503).json({ error: 'All Invidious instances unavailable', detail: lastError });
}
