/**
 * /api/collect-bakeries
 *
 * Vercel Cron Job — 서버에서 네이버 API를 호출해 빵집 데이터를 Supabase에 저장.
 * 유저 브라우저는 이 결과를 Supabase에서 읽기만 함 (API 호출 0회).
 *
 * 스케줄:
 *   - 우선지역 (서울·수도권·광역시): 매일 새벽 2시 KST
 *   - 전국 기타지역:                 매주 일요일 새벽 3시 KST
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

// ── 환경변수 ────────────────────────────────────────────────────────────────
const SUPABASE_URL        = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // 서버 전용 (service_role)
const NAVER_ID            = process.env.VITE_NAVER_CLIENT_ID || '';
const NAVER_SECRET        = process.env.VITE_NAVER_CLIENT_SECRET || '';
const CRON_SECRET         = process.env.CRON_SECRET || '';               // 외부 무단 호출 방지

// ── 수집 대상 지역 ──────────────────────────────────────────────────────────
const PRIORITY_AREAS = [
  // 서울 전 지역
  '서울 강남', '서울 서초', '서울 송파', '서울 강동',
  '서울 마포', '서울 홍대', '서울 합정', '서울 공덕',
  '서울 종로', '서울 중구', '서울 용산', '서울 이태원',
  '서울역', '서울 명동', '서울 을지로', '서울 충정로',
  '서울 성동', '서울 성수', '서울 광진', '서울 건대',
  '서울 동대문', '서울 중랑', '서울 성북', '서울 강북',
  '서울 도봉', '서울 노원', '서울 은평', '서울 서대문',
  '서울 양천', '서울 목동', '서울 강서', '서울 구로',
  '서울 금천', '서울 가산', '서울 영등포', '서울 여의도',
  '서울 동작', '서울 관악',
  // 수도권·광역시
  '인천 부평', '인천 송도', '인천 구월',
  '수원', '성남 분당', '성남 판교', '고양 일산', '고양 덕양',
  '용인 수지', '부천', '안양', '안산', '화성 동탄',
  '부산 해운대', '부산 서면', '부산 광안리', '부산 남포',
  '대구 동성로', '대구 수성', '대전 둔산', '대전 은행동',
  '광주 충장로', '광주 상무', '울산 삼산',
];

const REGIONAL_AREAS = [
  '강릉', '속초', '춘천', '원주', '동해', '양양', '삼척',
  '청주', '충주', '제천', '천안', '아산', '공주', '서산',
  '전주', '군산', '익산', '정읍', '남원',
  '여수', '순천', '목포', '광양', '나주',
  '포항', '경주', '창원', '진주', '통영', '거제', '김해',
  '안동', '구미', '경산',
  '제주시', '서귀포',
  '평택', '파주', '김포', '의정부', '남양주', '하남', '광명',
];

// ── 네이버 검색 쿼리 (클라이언트 20개 → 서버 5개로 축소) ──────────────────
const BAKERY_QUERIES = ['베이커리', '빵집', '제과점', '소금빵 맛집', '베이글 카페'];

// ── KATECH 좌표 변환 ────────────────────────────────────────────────────────
function katechToWgs84(mapx: string, mapy: string) {
  return { lat: parseInt(mapy, 10) / 10000000, lng: parseInt(mapx, 10) / 10000000 };
}

// 네이버 좌표 → 결정적 UUID 생성
function coordToUuid(mapx: string, mapy: string): string {
  const hex = createHash('md5').update(`naver-${mapx}-${mapy}`).digest('hex');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
}

function stripHtml(s: string) { return s.replace(/<[^>]*>/g, ''); }

const FRANCHISE_NAMES = ['파리바게뜨', '뚜레쥬르', '파리크라상', '던킨', '크리스피크림'];
const EXCLUDE_NAMES   = ['메가커피', '컴포즈커피', '빽다방', '이디야', '스타벅스',
                         '투썸플레이스', '할리스', '배스킨라빈스'];

function extractTags(category: string, name: string): string[] {
  const src = [name, category].join(' ').toLowerCase();
  const tags: string[] = [];
  if (/소금빵/.test(src))                      tags.push('소금빵');
  if (/식빵|샌드위치/.test(src))               tags.push('식빵');
  if (/베이글/.test(src))                      tags.push('베이글');
  if (/케이크|타르트|마카롱/.test(src))        tags.push('케이크');
  if (/바게트|치아바타/.test(src))             tags.push('바게트');
  if (/크로와상|크루아상/.test(src))           tags.push('크로와상');
  if (/천연발효|사워도우|호밀/.test(src))      tags.push('천연발효');
  return tags.length > 0 ? tags : ['베이커리'];
}

// ── 네이버 지역검색 직접 호출 ──────────────────────────────────────────────
async function fetchNaverLocal(query: string, start = 1) {
  const url = new URL('https://openapi.naver.com/v1/search/local.json');
  url.searchParams.set('query', query);
  url.searchParams.set('display', '5');
  url.searchParams.set('start', String(start));
  url.searchParams.set('sort', 'comment');

  const res = await fetch(url.toString(), {
    headers: {
      'X-Naver-Client-Id': NAVER_ID,
      'X-Naver-Client-Secret': NAVER_SECRET,
    },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items || []) as Array<{
    title: string; category: string; telephone: string;
    roadAddress: string; address: string; mapx: string; mapy: string;
  }>;
}

// ── 지역 1개 수집 → Bakery 행 배열 반환 ───────────────────────────────────
async function collectArea(area: string) {
  const seen = new Set<string>();
  const rows: object[] = [];

  for (const q of BAKERY_QUERIES) {
    const [p1, p2, p3] = await Promise.all([
      fetchNaverLocal(`${area} ${q}`, 1),
      fetchNaverLocal(`${area} ${q}`, 6),
      fetchNaverLocal(`${area} ${q}`, 11),
    ]);
    for (const item of [...p1, ...p2, ...p3]) {
      const coordKey = `${item.mapx}-${item.mapy}`;
      if (seen.has(coordKey)) continue;
      seen.add(coordKey);

      const name = stripHtml(item.title);
      if (EXCLUDE_NAMES.some(e => name.includes(e))) continue;
      if (!item.category.match(/제과|베이커리|빵|케이크|디저트|도넛|베이글|마카롱/)) continue;

      const coords = katechToWgs84(item.mapx, item.mapy);
      const isFranchise = FRANCHISE_NAMES.some(f => name.includes(f));

      rows.push({
        id:             coordToUuid(item.mapx, item.mapy),
        name,
        type:           isFranchise ? 'franchise' : 'independent',
        is_premium:     false,
        address:        item.roadAddress || item.address,
        lat:            coords.lat,
        lng:            coords.lng,
        phone:          item.telephone || '',
        open_time:      '09:00',
        close_time:     '21:00',
        rating:         0,
        review_count:   0,
        image_url:      '',
        description:    item.category,
        baking_schedule: [],
        tags:           extractTags(item.category, name),
        is_registered:  false,
      });
    }
  }
  return rows;
}

// ── 메인 핸들러 ────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 보안: Vercel Cron은 Authorization 헤더에 CRON_SECRET을 자동 주입
  const authHeader = req.headers['authorization'] || '';
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Supabase 서비스 키 미설정 (SUPABASE_SERVICE_ROLE_KEY)' });
  }
  if (!NAVER_ID || !NAVER_SECRET) {
    return res.status(500).json({ error: '네이버 API 키 미설정' });
  }

  const type = req.query['type'] === 'regional' ? 'regional' : 'priority';
  const areas = type === 'regional' ? REGIONAL_AREAS : PRIORITY_AREAS;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  let totalUpserted = 0;
  let totalAreas    = 0;
  const errors: string[] = [];

  // 3개 지역씩 병렬 수집
  for (let i = 0; i < areas.length; i += 3) {
    const batch = areas.slice(i, i + 3);
    const batchResults = await Promise.allSettled(batch.map(a => collectArea(a)));

    const allRows: object[] = [];
    batchResults.forEach((r, idx) => {
      if (r.status === 'fulfilled') { allRows.push(...r.value); totalAreas++; }
      else errors.push(`${batch[idx]}: ${r.reason}`);
    });

    // 배치 내 id 중복 제거
    const deduped = new Map<string, object>();
    for (const row of allRows) deduped.set((row as { id: string }).id, row);
    const rows = [...deduped.values()];

    if (rows.length > 0) {
      const { error } = await supabase
        .from('bakeries')
        .upsert(rows, { onConflict: 'id' });
      if (error) errors.push(`Supabase upsert: ${error.message}`);
      else totalUpserted += rows.length;
    }

    // API 부하 분산: 배치 간 100ms 대기
    if (i + 3 < areas.length) await new Promise(r => setTimeout(r, 100));
  }

  return res.status(200).json({
    type,
    totalAreas,
    totalUpserted,
    errors: errors.slice(0, 10), // 최대 10개만
    timestamp: new Date().toISOString(),
  });
}
