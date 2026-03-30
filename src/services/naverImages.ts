// 네이버 이미지 검색 API (무료, 일 25,000건)
// 기존 Vite 프록시 (/api/naver -> openapi.naver.com)를 그대로 사용

interface NaverImageItem {
  title: string;
  link: string;
  thumbnail: string;
  sizeheight: string;
  sizewidth: string;
}

interface NaverImageResponse {
  total: number;
  start: number;
  display: number;
  items: NaverImageItem[];
}

const imageCache = new Map<string, string[]>();

export async function searchBakeryImages(bakeryName: string, count: number = 4): Promise<string[]> {
  // 캐시 확인
  if (imageCache.has(bakeryName)) {
    return imageCache.get(bakeryName)!;
  }

  try {
    const query = `${bakeryName} 빵집 매장`;
    const params = new URLSearchParams({
      query,
      display: String(count),
      sort: 'sim',
    });

    const res = await fetch(`/api/naver/v1/search/image?${params}`);

    if (!res.ok) {
      console.warn(`Naver Image API error: ${res.status}`);
      return [];
    }

    const data: NaverImageResponse = await res.json();
    const urls = data.items.map(item => item.thumbnail);

    imageCache.set(bakeryName, urls);
    return urls;
  } catch (err) {
    console.warn('Naver Image API fetch failed:', err);
    return [];
  }
}
