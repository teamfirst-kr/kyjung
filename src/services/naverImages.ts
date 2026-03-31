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

// 빵집 이름이 포함된 이미지만 필터 (제목에 이름이 없으면 관련 없는 사진일 가능성)
function isRelevantImage(item: NaverImageItem, bakeryName: string): boolean {
  const titleLower = item.title.toLowerCase();
  const nameLower = bakeryName.toLowerCase();
  // 이름의 첫 두 글자라도 제목에 포함되면 관련 있다고 판단
  const prefix = nameLower.slice(0, 2);
  return titleLower.includes(nameLower) || titleLower.includes(prefix)
    || titleLower.includes('매장') || titleLower.includes('빵') || titleLower.includes('베이커리');
}

export async function searchBakeryImages(
  bakeryName: string,
  address: string = '',
  count: number = 4,
): Promise<string[]> {
  const cacheKey = `${bakeryName}-${address}`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  try {
    // 쿼리에 주소의 동/구 정보를 더해 같은 이름 다른 가게를 구분
    const addressHint = address
      ? address.split(' ').slice(0, 3).join(' ') // "서울 마포구 합정동" 수준
      : '';
    const query = addressHint
      ? `"${bakeryName}" ${addressHint} 베이커리 매장`
      : `"${bakeryName}" 베이커리 빵집 매장 외관`;

    const params = new URLSearchParams({
      query,
      display: String(Math.min(count * 2, 10)), // 여유있게 가져와서 필터링
      sort: 'sim',
    });

    const res = await fetch(`/api/naver-search?type=image&${params}`);
    if (!res.ok) return [];

    const data: NaverImageResponse = await res.json();

    // 관련성 필터링 후 필요한 수만큼만 사용
    const filtered = data.items
      .filter(item => isRelevantImage(item, bakeryName))
      .slice(0, count)
      .map(item => item.thumbnail);

    // 필터 후 부족하면 원본에서 보충 (필터 없이)
    const result = filtered.length >= 2
      ? filtered
      : data.items.slice(0, count).map(item => item.thumbnail);

    imageCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn('Naver Image API fetch failed:', err);
    return [];
  }
}
