import { Bakery, BakeryType } from '../types/bakery';

interface NaverLocalItem {
  title: string;
  link: string;
  category: string;
  description: string;
  telephone: string;
  address: string;
  roadAddress: string;
  mapx: string; // KATECH x (경도 * 10^7 수준)
  mapy: string; // KATECH y (위도 * 10^7 수준)
}

interface NaverSearchResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverLocalItem[];
}

// KATECH/TM 좌표 -> WGS84 근사 변환
function katechToWgs84(mapx: string, mapy: string): { lat: number; lng: number } {
  // 네이버 지역검색 API는 KATECH 좌표계를 사용
  // 간이 변환 (실서비스에선 proj4 라이브러리 사용 권장)
  const x = parseInt(mapx, 10);
  const y = parseInt(mapy, 10);

  const lng = x / 10000000;
  const lat = y / 10000000;

  return { lat, lng };
}

// HTML 태그 제거
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

// 프랜차이즈 판별
const FRANCHISE_NAMES = [
  '파리바게뜨', '뚜레쥬르', '파리크라상', 'CU베이커리', 'CU 베이커리',
  '던킨', '크리스피크림', '베스킨라빈스', '뚜레주르', '삼립',
  'SPC', '성심당체인', '이삭토스트',
];

function isFranchise(name: string): boolean {
  const clean = stripHtml(name);
  return FRANCHISE_NAMES.some(f => clean.includes(f));
}

// 카테고리에서 빵집 관련 태그 추출
function extractTags(category: string, name: string): string[] {
  const tags: string[] = [];
  const clean = stripHtml(name).toLowerCase();
  const cat = category.toLowerCase();

  if (cat.includes('제과') || cat.includes('베이커리') || cat.includes('빵')) tags.push('베이커리');
  if (cat.includes('카페')) tags.push('카페');
  if (cat.includes('케이크')) tags.push('케이크');
  if (clean.includes('베이글')) tags.push('베이글');
  if (clean.includes('크로와상') || clean.includes('크루아상')) tags.push('크로와상');
  if (clean.includes('소금빵')) tags.push('소금빵');
  if (clean.includes('식빵')) tags.push('식빵');
  if (clean.includes('천연발효') || clean.includes('사워도우')) tags.push('천연발효');

  return tags.length > 0 ? tags : ['베이커리'];
}

function naverItemToBakery(item: NaverLocalItem, index: number): Bakery {
  const name = stripHtml(item.title);
  const coords = katechToWgs84(item.mapx, item.mapy);
  const franchise = isFranchise(name);

  return {
    id: `naver-${item.mapx}-${item.mapy}-${index}`,
    name,
    type: franchise ? BakeryType.FRANCHISE : BakeryType.INDEPENDENT,
    isPremium: false,
    address: item.roadAddress || item.address,
    coordinates: coords,
    phone: item.telephone || '',
    hours: { open: '09:00', close: '21:00' }, // API에서 제공하지 않음
    rating: 0, // API에서 제공하지 않음
    reviewCount: 0,
    imageUrl: '',
    description: item.category,
    bakingSchedule: [], // 네이버 데이터엔 없음
    tags: extractTags(item.category, name),
    isRegistered: false, // 네이버에서 가져온 빵집은 미입점
  };
}

// 빵집 검색 쿼리 목록
const BAKERY_QUERIES = [
  '베이커리', '빵집', '제과점', '베이글', '크로와상',
];

export async function searchBakeries(
  query: string = '베이커리',
  start: number = 1,
  display: number = 5,
): Promise<{ bakeries: Bakery[]; total: number }> {
  try {
    const params = new URLSearchParams({
      query,
      display: String(display),
      start: String(start),
      sort: 'comment', // 리뷰 많은순
    });

    const res = await fetch(`/api/naver/v1/search/local.json?${params}`);

    if (!res.ok) {
      console.warn(`Naver API error: ${res.status}`);
      return { bakeries: [], total: 0 };
    }

    const data: NaverSearchResponse = await res.json();

    const bakeries = data.items
      .filter(item => {
        const cat = item.category.toLowerCase();
        return cat.includes('제과') || cat.includes('베이커리') || cat.includes('빵')
          || cat.includes('케이크') || cat.includes('디저트');
      })
      .map((item, i) => naverItemToBakery(item, start + i));

    return { bakeries, total: data.total };
  } catch (err) {
    console.warn('Naver API fetch failed:', err);
    return { bakeries: [], total: 0 };
  }
}

// 지역명 + 키워드로 여러 쿼리를 병렬 호출해서 빵집 수집
export async function searchBakeriesByArea(area: string): Promise<Bakery[]> {
  const results = await Promise.all(
    BAKERY_QUERIES.map(q => searchBakeries(`${area} ${q}`, 1, 5))
  );

  // 중복 제거 (주소 기준)
  const seen = new Set<string>();
  const all: Bakery[] = [];

  for (const { bakeries } of results) {
    for (const b of bakeries) {
      const key = b.address || b.name;
      if (!seen.has(key)) {
        seen.add(key);
        all.push(b);
      }
    }
  }

  return all;
}

// API 키가 설정되었는지 확인
export function isNaverApiConfigured(): boolean {
  return !!(
    import.meta.env.VITE_NAVER_CLIENT_ID &&
    import.meta.env.VITE_NAVER_CLIENT_ID !== 'your_client_id_here'
  );
}
