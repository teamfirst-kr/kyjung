// 빵소식: 네이버 블로그 + 동영상 + 인스타그램 해시태그 검색 API를 통해 실제 콘텐츠를 가져옵니다.

export interface NewsItem {
  id: string;
  source: 'blog' | 'youtube' | 'instagram';
  author: string;
  title: string;
  summary: string;
  imageUrl: string;
  link: string;
  date: string;
  tags: string[];
}

// HTML 태그 제거
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim();
}

// 날짜 포맷
function formatDate(raw: string): string {
  if (!raw) return '';
  try {
    if (raw.length === 8) {
      return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
    }
    const d = new Date(raw);
    return d.toISOString().slice(0, 10);
  } catch {
    return raw;
  }
}

// ── 검색 키워드 ──────────────────────────────────────────────────────
const SEARCH_QUERIES = [
  '빵집 맛집 추천',
  '베이커리 신메뉴',
  '소금빵 크로와상',
  '빵투어 후기',
];

const VIDEO_QUERIES = [
  '빵집 투어',
  '빵지순례',
  '베이커리 브이로그',
  '빵집 추천',
  '소금빵 맛집',
  '빵 투어 vlog',
];

// 인스타그램 해시태그 기반 검색 쿼리
const INSTAGRAM_HASHTAGS = [
  '#베이커리 빵',
  '#빵집 추천',
  '#소금빵',
  '#베이글 카페',
  '#케이크 맛집',
  '#식빵 홈베이킹',
  '#빵스타그램',
  '#카페투어 빵',
];

// 해시태그에서 이미지 검색용 순수 키워드 추출
const HASHTAG_IMAGE_QUERIES: Record<string, string> = {
  '#베이커리 빵':    '베이커리 빵',
  '#빵집 추천':     '빵집 내부',
  '#소금빵':        '소금빵',
  '#베이글 카페':   '베이글',
  '#케이크 맛집':   '케이크',
  '#식빵 홈베이킹': '식빵',
  '#빵스타그램':    '빵 카페',
  '#카페투어 빵':   '카페 빵',
};

// ── 캐시 ─────────────────────────────────────────────────────────────
let cachedAll:   NewsItem[] | null = null;
let cachedInsta: NewsItem[] | null = null;
let cacheTime  = 0;
let instaTime  = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5분

// 이미지 캐시 (쿼리 → thumbnail URL[])
const imageCache: Record<string, string[]> = {};

// ── Naver 이미지 검색 ─────────────────────────────────────────────────
async function fetchImagesForQuery(query: string, count = 9): Promise<string[]> {
  if (imageCache[query]) return imageCache[query];
  try {
    const res = await fetch(
      `/api/naver-search?type=image&query=${encodeURIComponent(query)}&display=${count}&sort=sim`
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.items?.length) return [];

    const urls: string[] = data.items
      .map((item: Record<string, string>) => item.thumbnail || item.link)
      .filter(Boolean);

    imageCache[query] = urls;
    return urls;
  } catch {
    return [];
  }
}

// 블로그 폴백 (API 실패 시 항상 보여줄 샘플)
const FALLBACK_BLOG: NewsItem[] = [
  { id: 'fb1', source: 'blog', author: '빵순이의 빵투어', title: '서울 3대 베이글 맛집 비교', summary: '런던베이글뮤지엄, 오올리베이글, 더베이글샵을 직접 비교했습니다.', imageUrl: '', link: '', date: '2026-03-27', tags: ['베이글', '맛집', '서울'] },
  { id: 'fb2', source: 'blog', author: '카페탐방일지', title: '연남동 새로 오픈한 천연발효빵집', summary: '르방 종으로 발효한 캉파뉴와 사워도우가 일품인 연남동 베이커리 방문기.', imageUrl: '', link: '', date: '2026-03-24', tags: ['천연발효', '연남동', '베이커리'] },
  { id: 'fb3', source: 'blog', author: '빵지순례', title: '성수동 빵집 지도 총정리', summary: '성수동의 숨은 빵집 10곳을 한눈에 정리했습니다. 주말 코스 추천!', imageUrl: '', link: '', date: '2026-03-22', tags: ['성수동', '빵집', '지도'] },
  { id: 'fb4', source: 'blog', author: '홈베이킹노트', title: '소금빵 황금 레시피 공유', summary: '버터 함량과 굽기 온도를 수십 번 테스트해서 찾아낸 완벽한 소금빵 레시피입니다.', imageUrl: '', link: '', date: '2026-03-20', tags: ['소금빵', '레시피', '홈베이킹'] },
  { id: 'fb5', source: 'blog', author: '빵덕후', title: '크로와상 맛집 서울 TOP 5', summary: '층층이 살아있는 결, 진한 버터향의 크로와상 전문점 5곳을 소개합니다.', imageUrl: '', link: '', date: '2026-03-18', tags: ['크로와상', '서울', 'TOP5'] },
];

// ── 전체 뉴스 (블로그 + 동영상) ──────────────────────────────────────
export async function fetchNews(): Promise<NewsItem[]> {
  if (cachedAll && Date.now() - cacheTime < CACHE_TTL) return cachedAll;

  const blogQuery = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)];
  const vidIdx    = Math.floor(Math.random() * VIDEO_QUERIES.length);
  const vidQuery1 = VIDEO_QUERIES[vidIdx];
  const vidQuery2 = VIDEO_QUERIES[(vidIdx + 1) % VIDEO_QUERIES.length];

  try {
    const [blogItems, videoItems1, videoItems2] = await Promise.all([
      fetchBlogPosts(blogQuery),
      fetchVideos(vidQuery1),
      fetchVideos(vidQuery2),
    ]);

    // 블로그 API 실패 시 독립적으로 폴백 적용 (YouTube 성공 여부와 무관)
    const blogs  = blogItems.length > 0 ? blogItems : FALLBACK_BLOG;
    const videos = [...videoItems1, ...videoItems2];

    const all = [...blogs, ...videos].sort((a, b) => b.date.localeCompare(a.date));
    const seen = new Set<string>();
    const deduped = all.filter(item => {
      if (seen.has(item.title)) return false;
      seen.add(item.title);
      return true;
    });
    cachedAll = deduped;
    cacheTime = Date.now();
    return deduped;
  } catch (err) {
    console.warn('[NewsService] fetchNews failed:', err);
    // 전체 실패 시 블로그 폴백만이라도 반환
    return cachedAll || FALLBACK_BLOG;
  }
}

// ── 인스타그램 해시태그 검색 ──────────────────────────────────────────
export async function fetchInstagramPosts(): Promise<NewsItem[]> {
  if (cachedInsta && Date.now() - instaTime < CACHE_TTL) return cachedInsta;

  const startIdx = Math.floor(Math.random() * INSTAGRAM_HASHTAGS.length);
  const queries = [0, 1, 2].map(i =>
    INSTAGRAM_HASHTAGS[(startIdx + i) % INSTAGRAM_HASHTAGS.length]
  );

  try {
    // 블로그 포스트와 이미지를 동시에 수집
    const [postResults, ...imageResults] = await Promise.all([
      Promise.all(queries.map(q => fetchBlogPostsAsInstagram(q))),
      // 각 해시태그별 이미지 풀 수집
      ...queries.map(q => fetchImagesForQuery(HASHTAG_IMAGE_QUERIES[q] ?? q.replace('#', ''), 9)),
    ]);

    const merged = (postResults as NewsItem[][]).flat();

    // 이미지 풀 합치기
    const allImages = (imageResults as string[][]).flat();

    // 중복 제거 (title 기준)
    const seen = new Set<string>();
    const deduped = merged.filter(item => {
      if (seen.has(item.title)) return false;
      seen.add(item.title);
      return true;
    });

    // 각 포스트에 이미지 배분 (순환)
    const withImages = deduped.map((item, i) => ({
      ...item,
      imageUrl: item.imageUrl || allImages[i % allImages.length] || '',
    }));

    const sorted = withImages.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);
    cachedInsta = sorted;
    instaTime = Date.now();
    return sorted;
  } catch (err) {
    console.warn('[NewsService] fetchInstagramPosts failed:', err);
    return cachedInsta || [];
  }
}

// 블로그 포스트를 Instagram 소스로 변환
async function fetchBlogPostsAsInstagram(query: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      `/api/naver-search?type=blog&query=${encodeURIComponent(query)}&display=8&sort=date`
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.items) return [];

    return data.items.map((item: Record<string, string>, idx: number) => {
      const rawTitle = stripHtml(item.title || '');
      const rawDesc  = stripHtml(item.description || '');
      const hashtagMatches = (rawTitle + ' ' + rawDesc).match(/#[가-힣a-zA-Z0-9]+/g) || [];
      const inlineTags = hashtagMatches.map(t => t.replace('#', '')).slice(0, 4);
      const autoTags   = extractTags(rawTitle + ' ' + rawDesc);
      const tags       = [...new Set([...inlineTags, ...autoTags])].slice(0, 4);

      // originallink에 실제 인스타그램 URL이 있으면 사용, 없으면 Naver 블로그
      const originalLink = item.originallink || '';
      const link = originalLink.includes('instagram.com/p/')
        ? originalLink
        : (item.link || item.bloggerlink || '');

      return {
        id: `insta-${idx}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        source: 'instagram' as const,
        author: stripHtml(item.bloggername || ''),
        title: rawTitle,
        summary: rawDesc,
        imageUrl: '',  // 이미지는 fetchInstagramPosts에서 배분
        link,
        date: formatDate(item.postdate || ''),
        tags,
      };
    });
  } catch {
    return [];
  }
}

// ── 블로그 포스트 ──────────────────────────────────────────────────────
async function fetchBlogPosts(query: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      `/api/naver-search?type=blog&query=${encodeURIComponent(query)}&display=10&sort=date`
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.items) return [];

    return data.items.map((item: Record<string, string>, idx: number) => ({
      id: `blog-${idx}-${Date.now()}`,
      source: 'blog' as const,
      author: stripHtml(item.bloggername || ''),
      title: stripHtml(item.title || ''),
      summary: stripHtml(item.description || ''),
      imageUrl: item.thumbnail || '',
      link: item.link || item.bloggerlink || '',
      date: formatDate(item.postdate || ''),
      tags: extractTags(stripHtml(item.title + ' ' + item.description)),
    }));
  } catch {
    return [];
  }
}

// ── 동영상 (Invidious — YouTube 데이터, 무료 API 키 불필요) ─────────────
async function fetchVideos(query: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      `/api/youtube-search?q=${encodeURIComponent(query)}&maxResults=10`
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.videos?.length) return [];

    return data.videos.map((v: {
      videoId: string; title: string; thumbnail: string;
      channelTitle: string; publishedAt: string; description: string;
      watchUrl: string;
    }, idx: number) => ({
      id: `yt-${v.videoId || idx}-${Date.now()}`,
      source: 'youtube' as const,
      author: v.channelTitle || '',
      title: v.title || '',
      summary: v.description || '',
      imageUrl: v.thumbnail || '',
      link: v.watchUrl || '',
      date: formatDate(v.publishedAt || ''),
      tags: extractTags(v.title + ' ' + v.description),
    }));
  } catch {
    return [];
  }
}

// ── 태그 추출 ──────────────────────────────────────────────────────────
function extractTags(text: string): string[] {
  const TAG_KEYWORDS = [
    '소금빵', '크로와상', '베이글', '바게트', '식빵', '케이크',
    '마카롱', '스콘', '타르트', '도넛', '천연발효', '사워도우',
    '성심당', '빵투어', '신메뉴', '맛집', '베이커리', '홈베이킹',
    '서울', '대전', '부산', '강남', '홍대', '성수', '을지로',
    '레시피', '리뷰', '오픈', '카페', '디저트', '빵스타그램',
  ];
  return TAG_KEYWORDS.filter(kw => text.includes(kw)).slice(0, 3);
}

export function isNewsApiAvailable(): boolean {
  return typeof window !== 'undefined';
}
