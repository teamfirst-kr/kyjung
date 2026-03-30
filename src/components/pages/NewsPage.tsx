import { useState } from 'react';
import './NewsPage.css';

interface NewsItem {
  id: string;
  source: 'instagram' | 'blog' | 'youtube';
  author: string;
  title: string;
  summary: string;
  imageUrl: string;
  date: string;
  likes: number;
  tags: string[];
}

const MOCK_NEWS: NewsItem[] = [
  {
    id: 'n1',
    source: 'instagram',
    author: '@bread_lover_kr',
    title: '성심당 신메뉴 리뷰',
    summary: '성심당에서 새로 출시한 딸기 크로와상! 바삭한 겉면에 신선한 딸기크림이 가득 🍓 역시 성심당은 실망시키지 않는다...',
    imageUrl: '',
    date: '2026-03-28',
    likes: 2847,
    tags: ['성심당', '크로와상', '신메뉴'],
  },
  {
    id: 'n2',
    source: 'blog',
    author: '빵순이의 빵투어',
    title: '서울 3대 베이글 맛집 비교',
    summary: '런던베이글뮤지엄, 오올리베이글, 더베이글샵을 직접 다녀와 비교해봤습니다. 각각의 특징과 추천 메뉴를 정리했어요!',
    imageUrl: '',
    date: '2026-03-27',
    likes: 1523,
    tags: ['베이글', '맛집투어', '서울'],
  },
  {
    id: 'n3',
    source: 'youtube',
    author: '베이킹챌린지',
    title: '집에서 소금빵 만들기 도전!',
    summary: '요즘 대세 소금빵을 집에서 직접 만들어봤습니다. 겉바속촉 비결은 바로 버터 양에 있었는데요...',
    imageUrl: '',
    date: '2026-03-26',
    likes: 8912,
    tags: ['소금빵', '홈베이킹', '레시피'],
  },
  {
    id: 'n4',
    source: 'instagram',
    author: '@seoul_bakery_tour',
    title: '을지로 숨은 빵집 발견!',
    summary: '을지로 골목에서 발견한 40년 전통 나폴레옹과자점. 옛날 감성 그대로의 나폴레옹파이가 정말 맛있어요 ✨',
    imageUrl: '',
    date: '2026-03-25',
    likes: 3201,
    tags: ['을지로', '나폴레옹과자점', '레트로'],
  },
  {
    id: 'n5',
    source: 'blog',
    author: '카페탐방일지',
    title: '연남동 새로 오픈한 천연발효빵집',
    summary: '연남동에 천연발효 장인이 운영하는 빵집이 오픈했습니다. 르방 종으로 발효한 캉파뉴와 사워도우가 일품!',
    imageUrl: '',
    date: '2026-03-24',
    likes: 987,
    tags: ['연남동', '천연발효', '신규오픈'],
  },
  {
    id: 'n6',
    source: 'youtube',
    author: '빵지순례',
    title: '대전 빵집 투어 VLOG',
    summary: '대전 성심당 본점부터 튀김소보로 맛집까지! 대전 당일치기 빵 투어 브이로그입니다 🚗',
    imageUrl: '',
    date: '2026-03-23',
    likes: 15420,
    tags: ['대전', '성심당', 'VLOG'],
  },
  {
    id: 'n7',
    source: 'instagram',
    author: '@bakery_daily',
    title: '오늘의 갓 구운 빵 라인업',
    summary: '아침 7시 첫 빵이 나왔어요! 크로와상, 바게트, 식빵 모두 완판 전에 서두르세요 🥐',
    imageUrl: '',
    date: '2026-03-22',
    likes: 1876,
    tags: ['갓구운빵', '모닝베이킹', '일상'],
  },
  {
    id: 'n8',
    source: 'blog',
    author: '디저트매니아',
    title: '2026 봄 한정 케이크 총정리',
    summary: '파리바게뜨, 뚜레쥬르, 개인 베이커리까지! 올 봄 시즌 한정 딸기케이크 라인업을 비교분석합니다.',
    imageUrl: '',
    date: '2026-03-21',
    likes: 2345,
    tags: ['봄한정', '딸기케이크', '신메뉴'],
  },
];

const SOURCE_INFO = {
  instagram: { icon: '📸', label: '인스타그램', color: '#E1306C' },
  blog: { icon: '📝', label: '네이버 블로그', color: '#03C75A' },
  youtube: { icon: '▶️', label: '유튜브', color: '#FF0000' },
};

type SourceFilter = 'all' | 'instagram' | 'blog' | 'youtube';

export default function NewsPage() {
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');

  const filtered = sourceFilter === 'all'
    ? MOCK_NEWS
    : MOCK_NEWS.filter(n => n.source === sourceFilter);

  return (
    <div className="news-page">
      <div className="news-header">
        <h2 className="news-title">🍞 빵소식</h2>
        <p className="news-subtitle">인스타그램, 블로그, 유튜브에서 모은 베이커리 소식</p>
      </div>

      <div className="news-source-filters">
        <button
          className={`source-filter-btn ${sourceFilter === 'all' ? 'active' : ''}`}
          onClick={() => setSourceFilter('all')}
        >전체</button>
        <button
          className={`source-filter-btn instagram ${sourceFilter === 'instagram' ? 'active' : ''}`}
          onClick={() => setSourceFilter('instagram')}
        >📸 인스타그램</button>
        <button
          className={`source-filter-btn blog ${sourceFilter === 'blog' ? 'active' : ''}`}
          onClick={() => setSourceFilter('blog')}
        >📝 블로그</button>
        <button
          className={`source-filter-btn youtube ${sourceFilter === 'youtube' ? 'active' : ''}`}
          onClick={() => setSourceFilter('youtube')}
        >▶️ 유튜브</button>
      </div>

      <div className="news-list">
        {filtered.map(item => {
          const src = SOURCE_INFO[item.source];
          return (
            <article key={item.id} className="news-card">
              <div className="news-card-image">
                <div className="news-image-placeholder">
                  <span>{src.icon}</span>
                </div>
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
                  <span className="news-likes">❤️ {item.likes.toLocaleString()}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
