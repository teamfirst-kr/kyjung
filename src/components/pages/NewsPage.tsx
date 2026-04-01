import { useState, useEffect } from 'react';
import {
  fetchNews, fetchInstagramPosts,
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
];

const FALLBACK_INSTA: NewsItem[] = [
  {
    id: 'ig1', source: 'instagram', author: 'bread_seoul',
    title: '오늘의 소금빵 🥐',
    summary: '갓 구운 소금빵 한 봉지... 버터향이 온 골목에 퍼져요 🧈 #소금빵 #베이커리 #빵스타그램',
    imageUrl: '', link: '', date: '2026-04-01', tags: ['소금빵', '베이커리', '빵스타그램'],
  },
  {
    id: 'ig2', source: 'instagram', author: 'bagle_lover',
    title: '런던베이글뮤지엄 웨이팅 후기',
    summary: '2시간 기다렸는데 완전 가치있었어요!! 어니언 베이글 강추 🥯 #베이글 #맛집 #서울카페',
    imageUrl: '', link: '', date: '2026-03-31', tags: ['베이글', '맛집', '서울'],
  },
  {
    id: 'ig3', source: 'instagram', author: 'cake_daily',
    title: '딸기케이크 시즌 끝나기 전에',
    summary: '3월 딸기케이크 마지막 주문했어요🍓 봄 딸기는 이 맛이지... #케이크 #딸기케이크 #베이커리카페',
    imageUrl: '', link: '', date: '2026-03-30', tags: ['케이크', '딸기', '베이커리'],
  },
  {
    id: 'ig4', source: 'instagram', author: 'daily_bread_kr',
    title: '성수동 새 빵집 발견 🍞',
    summary: '성수동 골목에서 발견한 작은 빵집. 천연발효 캄파뉴 맛이 진짜 예술이에요 #성수 #빵집 #천연발효',
    imageUrl: '', link: '', date: '2026-03-29', tags: ['성수', '빵집', '천연발효'],
  },
  {
    id: 'ig5', source: 'instagram', author: 'homebaking_hana',
    title: '식빵 홈베이킹 성공!!',
    summary: '드디어 식빵 성공했다!! 폭신폭신 😍 하루종일 기다린 보람이 있네요 #홈베이킹 #식빵 #베이킹일상',
    imageUrl: '', link: '', date: '2026-03-28', tags: ['홈베이킹', '식빵', '베이킹'],
  },
  {
    id: 'ig6', source: 'instagram', author: 'croissant_seoul',
    title: '크로와상 맛집 탐방기',
    summary: '이번 주 크로와상 5곳 다녀왔습니다. 레이어가 살아있는 진짜 정통 크로와상 🥐 #크로와상 #빵스타그램 #서울맛집',
    imageUrl: '', link: '', date: '2026-03-27', tags: ['크로와상', '빵스타그램', '맛집'],
  },
];

// ── 소스 메타 ─────────────────────────────────────────────────────────
const SOURCE_INFO = {
  instagram: { icon: '📸', label: '인스타그램', color: '#E1306C' },
  blog:      { icon: '📝', label: '블로그',    color: '#03C75A' },
  youtube:   { icon: '▶️', label: '동영상',    color: '#FF0000' },
};

// Instagram 해시태그 카드 배경색 팔레트 (이미지 없을 때)
const INSTA_COLORS = [
  'linear-gradient(135deg,#f5a7c7,#f7d9a8)',
  'linear-gradient(135deg,#a8d8f0,#c8f0d0)',
  'linear-gradient(135deg,#f0d8a8,#f0a87a)',
  'linear-gradient(135deg,#c8a8f0,#f0a8d8)',
  'linear-gradient(135deg,#a8f0d8,#a8d8f0)',
  'linear-gradient(135deg,#f0c8a8,#f0e8a8)',
];

type SourceFilter = 'instagram' | 'blog' | 'youtube';

export default function NewsPage() {
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('blog');
  const [news, setNews]         = useState<NewsItem[]>([]);
  const [insta, setInsta]       = useState<NewsItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [instaLoading, setInstaLoading] = useState(true);
  const [isLive, setIsLive]     = useState(false);
  const [isInstaLive, setIsInstaLive] = useState(false);

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

  // 인스타그램 로딩
  useEffect(() => {
    let cancelled = false;
    async function loadInsta() {
      setInstaLoading(true);
      if (isNewsApiAvailable()) {
        try {
          const items = await fetchInstagramPosts();
          if (!cancelled) {
            setInsta(items.length > 0 ? items : FALLBACK_INSTA);
            setIsInstaLive(items.length > 0);
          }
        } catch {
          if (!cancelled) { setInsta(FALLBACK_INSTA); setIsInstaLive(false); }
        }
      } else {
        if (!cancelled) { setInsta(FALLBACK_INSTA); setIsInstaLive(false); }
      }
      if (!cancelled) setInstaLoading(false);
    }
    loadInsta();
    return () => { cancelled = true; };
  }, []);

  // ── 필터링 ─────────────────────────────────────────────────────────
  const displayedNews: NewsItem[] = (() => {
    switch (sourceFilter) {
      case 'instagram': return insta;
      case 'blog':      return news.filter(n => n.source === 'blog');
      case 'youtube':   return news.filter(n => n.source === 'youtube');
    }
  })();

  const isCurrentlyLoading = sourceFilter === 'instagram' ? instaLoading : loading;

  return (
    <div className="news-page">
      {/* 헤더 */}
      <div className="news-header">
        <h2 className="news-title">🍞 빵소식</h2>
        <p className="news-subtitle">
          인스타그램 · 블로그 · 유튜브에서 모은 베이커리 소식
          {(isLive || isInstaLive) && <span className="news-live-badge">LIVE</span>}
        </p>
      </div>

      {/* 소스 필터 */}
      <div className="news-source-filters">
        <button className={`source-filter-btn blog ${sourceFilter === 'blog' ? 'active' : ''}`}
          onClick={() => setSourceFilter('blog')}>📝 블로그</button>
        <button className={`source-filter-btn instagram ${sourceFilter === 'instagram' ? 'active' : ''}`}
          onClick={() => setSourceFilter('instagram')}>
          📸 인스타그램 {isInstaLive && <span className="live-dot" />}
        </button>
        <button className={`source-filter-btn youtube ${sourceFilter === 'youtube' ? 'active' : ''}`}
          onClick={() => setSourceFilter('youtube')}>▶️ 동영상</button>
      </div>

      {/* 로딩 */}
      {isCurrentlyLoading && (
        <div className="news-loading">
          <span className="news-loading-icon">🍞</span>
          <span>빵소식을 불러오는 중...</span>
        </div>
      )}

      {/* 인스타그램 — 그리드 레이아웃 */}
      {sourceFilter === 'instagram' && !instaLoading && (
        <div className="insta-section">
          <div className="insta-header-row">
            <span className="insta-hashtag-chips">
              {['#베이커리','#빵집','#소금빵','#베이글','#케이크','#빵스타그램'].map(tag => (
                <span key={tag} className="insta-chip">{tag}</span>
              ))}
            </span>
          </div>
          <div className="insta-grid">
            {insta.map((item, i) => (
              <div
                key={item.id}
                className="insta-card"
                style={{ background: INSTA_COLORS[i % INSTA_COLORS.length] }}
                onClick={() => item.link && window.open(item.link, '_blank', 'noopener')}
              >
                {item.imageUrl
                  ? <img
                      src={`/api/image-proxy?url=${encodeURIComponent(item.imageUrl)}`}
                      alt={item.title}
                      className="insta-card-img"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  : <div className="insta-card-placeholder">🍞</div>
                }
                <div className="insta-card-overlay">
                  <div className="insta-card-author">@{item.author}</div>
                  <div className="insta-card-tags">
                    {item.tags.map(t => <span key={t}>#{t} </span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 인스타 포스트 요약 리스트 */}
          <div className="insta-list">
            {insta.map(item => (
              <article key={item.id + '-list'} className="insta-list-item"
                onClick={() => item.link && window.open(item.link, '_blank', 'noopener')}>
                <div className="insta-list-avatar">
                  <span>{item.author.slice(0, 1).toUpperCase()}</span>
                </div>
                <div className="insta-list-body">
                  <div className="insta-list-top">
                    <span className="insta-list-author">@{item.author}</span>
                    <span className="insta-list-date">{item.date}</span>
                  </div>
                  <p className="insta-list-text">{item.summary}</p>
                  <div className="insta-list-tags">
                    {item.tags.map(t => (
                      <span key={t} className="insta-tag">#{t}</span>
                    ))}
                  </div>
                </div>
                {item.link && <span className="insta-external">→</span>}
              </article>
            ))}
          </div>

          {!isInstaLive && (
            <p className="insta-disclaimer">
              ※ API 미연결 시 샘플 데이터가 표시됩니다.
              실제 운영 시 Naver Search API 키를 설정하면 최신 해시태그 포스트가 수집됩니다.
            </p>
          )}
        </div>
      )}

      {/* 블로그 + 동영상 카드 리스트 */}
      {sourceFilter !== 'instagram' && (
        <div className="news-list">
          {displayedNews.map(item => {
            const src = SOURCE_INFO[item.source];
            return (
              <article
                key={item.id}
                className="news-card"
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
              </article>
            );
          })}

          {!isCurrentlyLoading && displayedNews.length === 0 && (
            <div className="news-empty">
              <span>🔍</span>
              <p>해당 소식이 없습니다.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
