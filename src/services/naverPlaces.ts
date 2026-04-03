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

// 빵집이 아닌 곳만 제외 (커피 전문점만, 빵 없는 카페/아이스크림)
const EXCLUDE_NAMES = [
  '메가커피', '메가엠지씨커피', '컴포즈커피', '빽다방', '이디야',
  '스타벅스', '투썸플레이스', '할리스', '엔제리너스', '커피빈',
  '폴바셋', '탐앤탐스', '파스쿠찌', '드롭탑', '카페베네',
  '더벤티', '요거프레소', '봄봄', '카페드롭탑',
  '배스킨라빈스', '나뚜루', '하겐다즈',
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

// 카테고리 + 이름 + 설명에서 빵 태그 추출
function extractTags(category: string, name: string, description: string = ''): string[] {
  const tags: string[] = [];
  const src = [stripHtml(name), category, description].join(' ').toLowerCase();

  if (/제과|베이커리|빵/.test(src)) tags.push('베이커리');
  if (/카페/.test(src))            tags.push('카페');

  // 빵 종류 키워드
  if (/소금빵/.test(src))                          tags.push('소금빵');
  if (/식빵|샌드위치|토스트/.test(src))             tags.push('식빵');
  if (/베이글/.test(src))                          tags.push('베이글');
  if (/케이크|타르트|마카롱|디저트|카스테라/.test(src)) tags.push('케이크');
  if (/바게트|치아바타/.test(src))                  tags.push('바게트');
  if (/크로와상|크루아상/.test(src))                tags.push('크로와상');
  if (/천연발효|사워도우|호밀/.test(src))           tags.push('천연발효');
  if (/단팥빵|소보로|앙금/.test(src))               tags.push('단팥빵');
  if (/도넛|도너츠/.test(src))                     tags.push('도넛');
  if (/스콘/.test(src))                            tags.push('스콘');

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
    tags: extractTags(item.category, name, item.description),
    isRegistered: false, // 네이버에서 가져온 빵집은 미입점
  };
}

// 빵집 검색 핵심 키워드 (API 호출 수 최소화)
const BAKERY_QUERIES = [
  '빵집', '베이커리', '제과', '케이크', '디저트',
];

// 빵집 카테고리 판별 (true = 포함)
function isBakeryCategory(cat: string): boolean {
  return (
    cat.includes('제과') ||
    cat.includes('베이커리') ||
    cat.includes('빵') ||
    cat.includes('케이크') ||
    cat.includes('디저트') ||
    cat.includes('파티쉐') ||
    cat.includes('브레드') ||
    cat.includes('도넛') ||
    cat.includes('베이글') ||
    cat.includes('크로와상') ||
    cat.includes('마카롱') ||
    cat.includes('타르트')
  );
}

// 커피 전문점 여부 (true = 제외) — 빵집과 무관한 경우만 제외
function isCoffeeOnly(_cat: string, name: string): boolean {
  // 이름이 제외 목록에 있으면 제외
  if (EXCLUDE_NAMES.some(ex => name.includes(ex))) return true;
  return false; // 카테고리 필터는 isBakeryCategory에서만 처리
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
    if (!res.ok) {
      console.warn(`[NaverAPI] ${query} → HTTP ${res.status}`);
      return [];
    }
    const data: NaverSearchResponse = await res.json();
    return data.items || [];
  } catch (err) {
    console.warn('[NaverAPI] fetch error:', query, err);
    return [];
  }
}

export async function searchBakeries(
  query: string = '베이커리',
  _start: number = 1,
  _display: number = 5,
): Promise<{ bakeries: Bakery[]; total: number }> {
  try {
    // 2페이지 병렬 요청 (리뷰순 + 정확도순) — API 부하 최소화
    const [page1, simPage] = await Promise.all([
      fetchNaverLocal(query, 1, 'comment'),
      fetchNaverLocal(query, 1, 'sim'),
    ]);

    const allItems = [...page1, ...simPage];

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

// 지역명 + 키워드로 병렬 호출해서 빵집 수집
// areas: 추가 세부 지역명 배열 (예: ['검단동', '불로동']) 을 함께 검색
export async function searchBakeriesByArea(area: string, subAreas: string[] = []): Promise<Bakery[]> {
  // 핵심 쿼리: area × keywords + subArea × keywords
  const queries: string[] = BAKERY_QUERIES.map(q => `${area} ${q}`);
  for (const sub of subAreas) {
    queries.push(`${sub} 빵집`, `${sub} 베이커리`, `${sub} 제과`);
  }

  // 한 번에 병렬 처리 (최대 ~14 queries × 2 API calls = ~28 calls)
  const batchResults = await Promise.all(
    queries.map(q => searchBakeries(q))
  );

  const results = batchResults.flatMap(r => r.bakeries);

  // 중복 제거 (좌표 기준)
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
