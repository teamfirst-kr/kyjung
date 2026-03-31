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

// 냉동빵/커피 프랜차이즈 - 빵집으로 보기 어려운 곳 제외
const EXCLUDE_NAMES = [
  '메가커피', '메가엠지씨커피', '컴포즈커피', '빽다방', '이디야',
  '스타벅스', '투썸플레이스', '할리스', '엔제리너스', '커피빈',
  '폴바셋', '탐앤탐스', '파스쿠찌', '드롭탑', '카페베네',
  '더벤티', '요거프레소', '봄봄', '카페드롭탑',
  '배스킨라빈스', '나뚜루', '하겐다즈', // 아이스크림 전문
  '이삭토스트', // 토스트 전문
];

// 프랜차이즈 베이커리 판별
const FRANCHISE_NAMES = [
  '파리바게뜨', '뚜레쥬르', '파리크라상', 'CU베이커리', 'CU 베이커리',
  '던킨', '크리스피크림', '베스킨라빈스', '뚜레주르', '삼립',
  'SPC', '성심당체인',
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

// 빵집 검색 쿼리 목록 (다양한 키워드로 더 많은 빵집 포착)
const BAKERY_QUERIES = [
  '베이커리', '빵집', '제과점',
  '베이글', '크로와상', '소금빵',
  '케이크', '타르트', '마카롱',
  '식빵', '천연발효빵', '사워도우',
];

// 빵집 카테고리 판별 (true = 포함)
function isBakeryCategory(cat: string): boolean {
  return (
    cat.includes('제과') ||
    cat.includes('베이커리') ||
    cat.includes('빵') ||
    cat.includes('케이크') ||
    cat.includes('디저트')
  );
}

// 커피 전문점 여부 (true = 제외)
function isCoffeeOnly(cat: string, name: string): boolean {
  // 이름이 제외 목록에 있으면 제외
  if (EXCLUDE_NAMES.some(ex => name.includes(ex))) return true;
  // 카테고리가 커피/카페인데 베이커리/제과 요소가 전혀 없으면 제외
  const hasCoffee = cat.includes('커피') || cat.includes('카페');
  const hasBakery = cat.includes('제과') || cat.includes('베이커리') || cat.includes('빵');
  return hasCoffee && !hasBakery;
}

// 네이버 지역검색 API: display 최대 5, start로 페이지네이션
async function fetchNaverLocal(
  query: string,
  start: number = 1,
  sort: 'comment' | 'sim' = 'comment',
): Promise<NaverLocalItem[]> {
  try {
    const params = new URLSearchParams({
      query,
      display: '5', // 네이버 지역검색 API 최대값
      start: String(start),
      sort,
    });
    const res = await fetch(`/api/naver-search?type=local&${params}`);
    if (!res.ok) return [];
    const data: NaverSearchResponse = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

export async function searchBakeries(
  query: string = '베이커리',
  _start: number = 1,
  _display: number = 5,
): Promise<{ bakeries: Bakery[]; total: number }> {
  try {
    // 2페이지까지 병렬 요청 (최대 10개), 정확도순 + 리뷰순 각각
    const [page1, page2, simPage] = await Promise.all([
      fetchNaverLocal(query, 1, 'comment'),
      fetchNaverLocal(query, 6, 'comment'),
      fetchNaverLocal(query, 1, 'sim'),
    ]);

    const allItems = [...page1, ...page2, ...simPage];

    // ID 기준 중복 제거
    const seenIds = new Set<string>();
    const unique = allItems.filter(item => {
      const id = `${item.mapx}-${item.mapy}`;
      if (seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    });

    const bakeries = unique
      .filter(item => {
        const cat = item.category.toLowerCase();
        const name = stripHtml(item.title);
        if (isCoffeeOnly(cat, name)) return false;
        return isBakeryCategory(cat);
      })
      .map((item, i) => naverItemToBakery(item, i));

    return { bakeries, total: bakeries.length };
  } catch (err) {
    console.warn('Naver API fetch failed:', err);
    return { bakeries: [], total: 0 };
  }
}

// 지역명 + 키워드로 여러 쿼리를 병렬 호출해서 빵집 수집
export async function searchBakeriesByArea(area: string): Promise<Bakery[]> {
  // 4개씩 배치로 병렬 처리 (API 부하 분산)
  const results: Bakery[] = [];
  for (let i = 0; i < BAKERY_QUERIES.length; i += 4) {
    const batch = BAKERY_QUERIES.slice(i, i + 4);
    const batchResults = await Promise.all(
      batch.map(q => searchBakeries(`${area} ${q}`))
    );
    batchResults.forEach(r => results.push(...r.bakeries));
  }

  // 중복 제거 (좌표 기준 - 더 정확)
  const seen = new Set<string>();
  return results.filter(b => {
    const key = `${Math.round(b.coordinates.lat * 1000)}-${Math.round(b.coordinates.lng * 1000)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// API 키가 설정되었는지 확인
// 빌드 시 환경변수가 주입되면 true, 또는 Vercel 서버리스 함수가 있으면 true
export function isNaverApiConfigured(): boolean {
  // Vercel 배포환경에서는 서버리스 함수가 API 키를 처리하므로 항상 true
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return true;
  }
  // 로컬 개발환경에서는 env 변수 확인
  return !!(
    import.meta.env.VITE_NAVER_CLIENT_ID &&
    import.meta.env.VITE_NAVER_CLIENT_ID !== 'your_client_id_here'
  );
}
