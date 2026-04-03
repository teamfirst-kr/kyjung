import { useState, useEffect } from 'react';
import {
  fetchNews,
  isNewsApiAvailable, type NewsItem,
} from '../../services/newsService';
import './NewsPage.css';

// ── 폴백 데이터 ───────────────────────────────────────────────────────
const FALLBACK_NEWS: NewsItem[] = [
  {
    id: 'f1', source: 'blog', author: '빵순이의 빵투어',
    title: '서울 3대 베이글 맛집 비교',
    summary: '런던베이글뮤지엄, 오올리베이글, 더베이글샵을 직접 다녀와 비교해봤습니다. 각각의 특징과 추천 메뉴를 정리했어요!',
    imageUrl: '', link: '', date: '2026-03-27', tags: ['베이글', '맛집투어', '서울'],
  },
  {
    id: 'f2', source: 'youtube', author: '베이킹챌린지',
    title: '집에서 소금빵 만들기 도전!',
    summary: '요즘 대세 소금빵을 집에서 직접 만들어봤습니다. 겉바속촉 비결은 바로 버터 양에 있었는데요...',
    imageUrl: '', link: '', date: '2026-03-26', tags: ['소금빵', '홈베이킹', '레시피'],
  },
  {
    id: 'f3', source: 'blog', author: '카페탐방일지',
    title: '연남동 새로 오픈한 천연발효빵집',
    summary: '연남동에 천연발효 장인이 운영하는 빵집이 오픈했습니다. 르방 종으로 발효한 캉파뉴와 사워도우가 일품!',
    imageUrl: '', link: '', date: '2026-03-24', tags: ['천연발효', '맛집', '서울'],
  },
  {
    id: 'f4', source: 'youtube', author: '빵지순례',
    title: '대전 빵집 투어 VLOG',
    summary: '대전 성심당 본점부터 튀김소보로 맛집까지! 대전 당일치기 빵 투어 브이로그입니다.',
    imageUrl: '', link: '', date: '2026-03-23', tags: ['대전', '성심당', '빵투어'],
  },
  {
    id: 'f5', source: 'youtube', author: '먹방크리에이터',
    title: '서울 성수동 빵집 투어 TOP 5',
    summary: '성수동에서 가장 핫한 빵집 5곳을 돌아봤습니다. 크로와상부터 천연발효빵까지!',
    imageUrl: '', link: '', date: '2026-03-22', tags: ['성수동', '빵투어', '서울'],
  },
  {
    id: 'f6', source: 'youtube', author: '빵먹는언니',
    title: '강남역 근처 숨은 빵집 리뷰',
    summary: '강남역 주변 골목에 숨겨진 소규모 베이커리 3곳 방문 리뷰입니다.',
    imageUrl: '', link: '', date: '2026-03-21', tags: ['강남', '빵집', '리뷰'],
  },
  {
    id: 'f7', source: 'youtube', author: '맛집탐방TV',
    title: '부산 해운대 빵집 투어 브이로그',
    summary: '부산 해운대에서 꼭 가봐야 할 베이커리 맛집을 소개합니다.',
    imageUrl: '', link: '', date: '2026-03-20', tags: ['부산', '해운대', '빵투어'],
  },
  {
    id: 'f8', source: 'youtube', author: '홈베이킹마스터',
    title: '크로와상 만들기 A to Z',
    summary: '층층이 살아있는 크로와상 만드는 전 과정을 상세하게 담았습니다.',
    imageUrl: '', link: '', date: '2026-03-19', tags: ['크로와상', '홈베이킹', '레시피'],
  },
  {
    id: 'f9', source: 'youtube', author: '카페디저트',
    title: '을지로 카페 빵집 데이트 코스',
    summary: '을지로 힙한 카페와 빵집을 하루 코스로 돌아보는 데이트 브이로그입니다.',
    imageUrl: '', link: '', date: '2026-03-18', tags: ['을지로', '카페', '데이트'],
  },
  {
    id: 'f10', source: 'youtube', author: '빵덕후TV',
    title: '전국 소금빵 맛집 TOP 7',
    summary: '서울, 부산, 대전, 제주까지 전국 소금빵 맛집을 총정리했습니다.',
    imageUrl: '', link: '', date: '2026-03-17', tags: ['소금빵', '맛집', '전국'],
  },
];


// ── 소스 메타 ─────────────────────────────────────────────────────────
const SOURCE_INFO = {
  instagram: { icon: '📸', label: '인스타그램', color: '#E1306C' },
  blog:      { icon: '📝', label: '블로그',    color: '#03C75A' },
  youtube:   { icon: '▶️', label: '유튜브',    color: '#FF0000' },
};


type SourceFilter = 'blog' | 'youtube';

export default function NewsPage() {
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('youtube');
  const [news, setNews]       = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive]   = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 블로그 + 동영상 로딩
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      if (isNewsApiAvailable()) {
        try {
          const items = await fetchNews();
          if (!cancelled) {
            setNews(items.length > 0 ? items : FALLBACK_NEWS);
            setIsLive(items.length > 0);
          }
        } catch {
          if (!cancelled) { setNews(FALLBACK_NEWS); setIsLive(false); }
        }
      } else {
        if (!cancelled) { setNews(FALLBACK_NEWS); setIsLive(false); }
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // ── 필터링 ─────────────────────────────────────────────────────────
  const q = searchQuery.trim().replace(/^#/, '').toLowerCase();

  const displayedNews: NewsItem[] = news
    .filter(n => n.source === sourceFilter)
    .filter(n => {
      if (!q) return true;
      const titleMatch = n.title.toLowerCase().includes(q);
      const tagMatch   = n.tags.some(t => t.toLowerCase().includes(q));
      return titleMatch || tagMatch;
    });

  const isCurrentlyLoading = loading;

  return (
    <div className="news-page">
      {/* 헤더 */}
      <div className="news-header">
        <h2 className="news-title">🍞 빵소식</h2>
        <p className="news-subtitle">
          블로그 · 유튜브에서 모은 베이커리 소식
          {isLive && <span className="news-live-badge">LIVE</span>}
        </p>
      </div>

      {/* 소스 필터 */}
      <div className="news-source-filters">
        <button className={`source-filter-btn youtube ${sourceFilter === 'youtube' ? 'active' : ''}`}
          onClick={() => setSourceFilter('youtube')}>▶️ 유튜브</button>
        <button className={`source-filter-btn blog ${sourceFilter === 'blog' ? 'active' : ''}`}
          onClick={() => setSourceFilter('blog')}>📝 블로그</button>
      </div>

      {/* 검색창 */}
      <div className="news-search-bar">
        <span className="news-search-icon">🔍</span>
        <input
          className="news-search-input"
          type="text"
          placeholder="제목 또는 #해시태그 검색"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="news-search-clear" onClick={() => setSearchQuery('')}>✕</button>
        )}
      </div>

      {/* 로딩 */}
      {isCurrentlyLoading && (
        <div className="news-loading">
          <span className="news-loading-icon">🍞</span>
          <span>빵소식을 불러오는 중...</span>
        </div>
      )}

      {/* 블로그 + 동영상 카드 리스트 */}
      {!isCurrentlyLoading && (
        <div className="news-list">
          {displayedNews.map(item => {
            const src = SOURCE_INFO[item.source];
            return (
              <article
                key={item.id}
                className={`news-card${item.source === 'youtube' ? ' youtube' : ''}`}
                onClick={() => item.link && window.open(item.link, '_blank', 'noopener')}
              >
                <div className="news-card-image">
                  {item.imageUrl ? (
                    <img
                      src={item.source === 'youtube'
                        ? item.imageUrl
                        : `/api/image-proxy?url=${encodeURIComponent(item.imageUrl)}`}
                      alt={item.title}
                      className="news-image-actual"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="news-image-placeholder">
                      <span>{src.icon}</span>
                    </div>
                  )}
                  <span className="news-source-badge" style={{ background: src.color }}>
                    {src.label}
                  </span>
                </div>
                {item.source === 'youtube' ? (
                  <div className="news-card-body youtube-body">
                    <div className="news-card-meta">
                      <span className="news-author">{item.author}</span>
                      <span className="news-date">{item.date}</span>
                    </div>
                    <h3 className="news-card-title youtube-title">{item.title}</h3>
                    {item.link && <span className="news-link-label">보러가기 →</span>}
                  </div>
                ) : (
                  <div className="news-card-body">
                    <div className="news-card-meta">
                      <span className="news-author">{item.author}</span>
                      <span className="news-date">{item.date}</span>
                    </div>
                    <h3 className="news-card-title">{item.title}</h3>
                    <p className="news-card-summary">{item.summary}</p>
                    <div className="news-card-footer">
                      <div className="news-tags">
                        {item.tags.map(tag => (
                          <span key={tag} className="news-tag">#{tag}</span>
                        ))}
                      </div>
                      {item.link && <span className="news-link-label">보러가기 →</span>}
                    </div>
                  </div>
                )}
              </article>
            );
          })}

          {!isCurrentlyLoading && displayedNews.length === 0 && (
            <div className="news-empty">
              <span>🔍</span>
              <p>{q ? `"${q}" 검색 결과가 없습니다.` : '해당 소식이 없습니다.'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
