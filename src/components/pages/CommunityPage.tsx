import { useState, useRef } from 'react';
import './CommunityPage.css';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
  name: string;
}

interface Post {
  id: string;
  author: string;
  avatar: string;
  category: '맛집추천' | '빵레시피' | '자유수다' | '빵질문' | '인증샷';
  title: string;
  content: string;
  media: MediaItem[];
  likes: number;
  comments: number;
  createdAt: string;
  isLiked: boolean;
}

const MOCK_POSTS: Post[] = [
  {
    id: 'p1', author: '빵순이맘', avatar: '👩', category: '맛집추천',
    title: '강남역 새로 오픈한 크로와상 전문점 다녀왔어요!',
    content: '버터향이 진짜 미쳤어요... 겉은 바삭하고 속은 촉촉한 정통 프랑스 스타일이에요. 아몬드 크로와상이 특히 추천!',
    media: [], likes: 47, comments: 12, createdAt: '30분 전', isLiked: false,
  },
  {
    id: 'p2', author: '베이킹초보', avatar: '👨‍🍳', category: '빵레시피',
    title: '소금빵 레시피 공유합니다 (초보 가능!)',
    content: '강력분 250g, 이스트 3g, 소금 4g, 버터 20g(반죽용) + 15g(속용). 1차 발효 60분, 200도 15분이면 완성!',
    media: [], likes: 89, comments: 23, createdAt: '1시간 전', isLiked: true,
  },
  {
    id: 'p3', author: '대전빵러버', avatar: '🧑', category: '인증샷',
    title: '성심당 튀김소보로 + 판타롱부추빵 조합 ❤️',
    content: '주말에 대전 다녀왔습니다! 아침 일찍 갔더니 대기 없이 바로 구매 성공. 튀김소보로는 역시 갓 튀긴 게 최고네요.',
    media: [], likes: 156, comments: 31, createdAt: '2시간 전', isLiked: false,
  },
  {
    id: 'p4', author: '글루텐프리생활', avatar: '🌱', category: '빵질문',
    title: '서울에 글루텐프리 빵집 아시는 분?',
    content: '글루텐 알레르기가 있어서 쌀가루 빵이나 글루텐프리 빵을 주로 찾는데요, 서울에 괜찮은 곳 추천해주시면 감사하겠습니다!',
    media: [], likes: 23, comments: 18, createdAt: '3시간 전', isLiked: false,
  },
  {
    id: 'p5', author: '빵투어마스터', avatar: '🎒', category: '자유수다',
    title: '이번 주말 빵투어 같이 갈 분~',
    content: '이번 토요일에 망원동 빵투어 계획 중인데 같이 가실 분 계신가요? 코스는 밀도 → 타르틴 → 리틀넥 → 망원시장 빵집 순서로!',
    media: [], likes: 34, comments: 27, createdAt: '4시간 전', isLiked: false,
  },
  {
    id: 'p6', author: '제빵사지망생', avatar: '👩‍🍳', category: '빵레시피',
    title: '바게트 클래프 터뜨리는 비결 알려드립니다',
    content: '핵심은 ① 반죽 수분량 72% 이상 ② 최종 발효 80% ③ 칼날 각도 30도 ④ 스팀 충분히! 이 4가지만 지키면 됩니다.',
    media: [], likes: 201, comments: 45, createdAt: '5시간 전', isLiked: true,
  },
];

const CATEGORIES = ['전체', '맛집추천', '빵레시피', '자유수다', '빵질문', '인증샷'] as const;
type CategoryFilter = typeof CATEGORIES[number];

const CATEGORY_COLORS: Record<string, string> = {
  '맛집추천': '#FF6B35',
  '빵레시피': '#4CAF50',
  '자유수다': '#2196F3',
  '빵질문': '#9C27B0',
  '인증샷': '#E91E63',
};

export default function CommunityPage() {
  const [category, setCategory] = useState<CategoryFilter>('전체');
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [showWrite, setShowWrite] = useState(false);

  // 글쓰기 폼 상태
  const [writeTitle, setWriteTitle]       = useState('');
  const [writeContent, setWriteContent]   = useState('');
  const [writeCategory, setWriteCategory] = useState<Post['category']>('자유수다');
  const [writePreviews, setWritePreviews] = useState<MediaItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = category === '전체' ? posts : posts.filter(p => p.category === category);

  // 파일 선택 처리
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const newItems: MediaItem[] = files.map(f => ({
      url: URL.createObjectURL(f),
      type: f.type.startsWith('video/') ? 'video' : 'image',
      name: f.name,
    }));
    setWritePreviews(prev => [...prev, ...newItems].slice(0, 9)); // 최대 9개
    e.target.value = '';
  }

  function removePreview(idx: number) {
    setWritePreviews(prev => prev.filter((_, i) => i !== idx));
  }

  // 글 등록
  function handleSubmit() {
    if (!writeTitle.trim()) return;
    const newPost: Post = {
      id: `p${Date.now()}`,
      author: '나',
      avatar: '😊',
      category: writeCategory,
      title: writeTitle.trim(),
      content: writeContent.trim(),
      media: writePreviews,
      likes: 0,
      comments: 0,
      createdAt: '방금 전',
      isLiked: false,
    };
    setPosts(prev => [newPost, ...prev]);
    setWriteTitle('');
    setWriteContent('');
    setWritePreviews([]);
    setShowWrite(false);
  }

  const toggleLike = (id: string) => {
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  return (
    <div className="community-page">
      <div className="community-header">
        <div className="community-header-top">
          <h2 className="community-title">💬 빵수다</h2>
          <button className="community-write-btn" onClick={() => setShowWrite(!showWrite)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            글쓰기
          </button>
        </div>
        <p className="community-subtitle">빵을 사랑하는 사람들의 소통 공간</p>
      </div>

      {/* ── 글쓰기 폼 ── */}
      {showWrite && (
        <div className="community-write-form">
          <div className="write-form-row">
            <select
              className="write-category-select"
              value={writeCategory}
              onChange={e => setWriteCategory(e.target.value as Post['category'])}
            >
              {CATEGORIES.filter(c => c !== '전체').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            className="write-title-input"
            placeholder="제목을 입력하세요"
            value={writeTitle}
            onChange={e => setWriteTitle(e.target.value)}
          />
          <textarea
            className="write-content-input"
            placeholder="내용을 입력하세요..."
            rows={3}
            value={writeContent}
            onChange={e => setWriteContent(e.target.value)}
          />

          {/* 미디어 미리보기 */}
          {writePreviews.length > 0 && (
            <div className="write-media-previews">
              {writePreviews.map((item, idx) => (
                <div key={idx} className="write-media-thumb">
                  {item.type === 'image' ? (
                    <img src={item.url} alt={item.name} />
                  ) : (
                    <div className="write-video-thumb">
                      <video src={item.url} />
                      <span className="write-play-icon">▶</span>
                    </div>
                  )}
                  <button className="write-thumb-remove" onClick={() => removePreview(idx)}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div className="write-actions">
            <div className="write-media-btns">
              <button className="write-photo-btn" onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = 'image/*';
                  fileInputRef.current.click();
                }
              }}>📷 사진</button>
              <button className="write-photo-btn" onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = 'video/*';
                  fileInputRef.current.click();
                }
              }}>🎬 영상</button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button
              className="write-submit-btn"
              onClick={handleSubmit}
              disabled={!writeTitle.trim()}
            >등록</button>
          </div>
        </div>
      )}

      {/* 카테고리 필터 */}
      <div className="community-categories">
        {CATEGORIES.map(c => (
          <button
            key={c}
            className={`community-cat-btn ${category === c ? 'active' : ''}`}
            style={category === c && c !== '전체' ? { background: CATEGORY_COLORS[c], borderColor: CATEGORY_COLORS[c] } : {}}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 인기글 배너 */}
      <div className="community-hot-banner">
        <span className="hot-icon">🔥</span>
        <span className="hot-label">인기글</span>
        <span className="hot-title">{[...posts].sort((a, b) => b.likes - a.likes)[0].title}</span>
      </div>

      {/* 게시글 목록 */}
      <div className="community-posts">
        {filtered.map(post => (
          <article key={post.id} className="community-post-card">
            <div className="post-card-header">
              <div className="post-author-info">
                <span className="post-avatar">{post.avatar}</span>
                <span className="post-author">{post.author}</span>
                <span className="post-time">{post.createdAt}</span>
              </div>
              <span className="post-category-tag" style={{ background: CATEGORY_COLORS[post.category] + '20', color: CATEGORY_COLORS[post.category] }}>
                {post.category}
              </span>
            </div>
            <h3 className="post-title">{post.title}</h3>
            <p className="post-content">{post.content}</p>

            {/* 미디어 썸네일 */}
            {post.media.length > 0 && (
              <div className={`post-media-grid count-${Math.min(post.media.length, 3)}`}>
                {post.media.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="post-media-thumb">
                    {item.type === 'image' ? (
                      <img src={item.url} alt="" />
                    ) : (
                      <div className="post-video-thumb">
                        <video src={item.url} />
                        <span className="post-play-icon">▶</span>
                      </div>
                    )}
                    {idx === 3 && post.media.length > 4 && (
                      <div className="post-media-more">+{post.media.length - 4}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="post-card-footer">
              <button className={`post-like-btn ${post.isLiked ? 'liked' : ''}`} onClick={() => toggleLike(post.id)}>
                {post.isLiked ? '❤️' : '🤍'} {post.likes}
              </button>
              <span className="post-comment-count">💬 {post.comments}</span>
              {post.media.length > 0 && (
                <span className="post-media-count">
                  {post.media.filter(m => m.type === 'image').length > 0 && `📷 ${post.media.filter(m => m.type === 'image').length}`}
                  {post.media.filter(m => m.type === 'video').length > 0 && ` 🎬 ${post.media.filter(m => m.type === 'video').length}`}
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
