import { useState } from 'react';
import type { AdBanner } from '../../types/ad';
import './AdManager.css';

const INITIAL_ADS: AdBanner[] = [
  {
    id: 'ad1', title: '홈베이킹 밀키트 - 초코 크로와상', description: '집에서 쉽게 만드는 초코 크로와상! 지금 20% 할인',
    imageUrl: '', linkUrl: '#', type: 'top', startDate: '2026-03-01', endDate: '2026-04-30',
    frequency: 'always', isActive: true, advertiser: '베이킹코리아', cost: 500000, impressions: 12400, clicks: 342,
  },
  {
    id: 'ad2', title: '프리미엄 밀가루 - 백설', description: '전문 베이커도 인정한 프리미엄 밀가루',
    imageUrl: '', linkUrl: '#', type: 'top', startDate: '2026-03-15', endDate: '2026-05-15',
    frequency: 'always', isActive: true, advertiser: 'CJ제일제당', cost: 800000, impressions: 8900, clicks: 201,
  },
  {
    id: 'ad3', title: '베이킹 클래스 - 르꼬르동블루', description: '프렌치 베이킹의 정수를 배워보세요',
    imageUrl: '', linkUrl: '#', type: 'sidebar', startDate: '2026-03-10', endDate: '2026-06-10',
    frequency: 'daily', isActive: true, advertiser: '르꼬르동블루', cost: 300000, impressions: 5600, clicks: 89,
  },
  {
    id: 'ad5', title: '홈베이킹 오븐 - 발뮤다', description: '스팀 기술로 빵집처럼 구워내는 토스터',
    imageUrl: '', linkUrl: '#', type: 'product', startDate: '2026-02-01', endDate: '2026-04-01',
    frequency: 'always', isActive: true, advertiser: '발뮤다코리아', cost: 600000, impressions: 15200, clicks: 567,
  },
  {
    id: 'ad-popup1', title: '빵맵 프리미엄 입점', description: '첫 달 광고비 무료!',
    imageUrl: '', linkUrl: '#', type: 'popup', startDate: '2026-03-01', endDate: '2026-12-31',
    frequency: 'daily', isActive: true, advertiser: '빵맵 자체', cost: 0, impressions: 31000, clicks: 1200,
  },
  {
    id: 'ad-bottom1', title: '빵맵 제휴 광고', description: 'Google AdSense 배너',
    imageUrl: '', linkUrl: '#', type: 'bottom', startDate: '2026-01-01', endDate: '2026-12-31',
    frequency: 'always', isActive: true, advertiser: 'Google AdSense', cost: 0, impressions: 98000, clicks: 2100,
  },
];

const TYPE_LABELS: Record<string, string> = {
  top: '상단 배너', sidebar: '사이드바', product: '상품 광고', popup: '팝업 광고', bottom: '하단 배너',
};

const TYPE_COLORS: Record<string, string> = {
  top: '#FF7043', sidebar: '#AB47BC', product: '#42A5F5', popup: '#EF5350', bottom: '#66BB6A',
};

export default function AdManager() {
  const [ads, setAds] = useState(INITIAL_ADS);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<AdBanner | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', type: 'top' as AdBanner['type'],
    advertiser: '', linkUrl: '', startDate: '', endDate: '',
    frequency: 'always' as 'always' | 'daily' | 'weekly', cost: 0,
  });

  function handleToggle(id: string) {
    setAds(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  }

  function handleDelete(id: string) {
    setAds(prev => prev.filter(a => a.id !== id));
  }

  function handleEdit(ad: AdBanner) {
    setEditingAd(ad);
    setForm({
      title: ad.title, description: ad.description, type: ad.type,
      advertiser: ad.advertiser || '', linkUrl: ad.linkUrl,
      startDate: ad.startDate || '', endDate: ad.endDate || '',
      frequency: ad.frequency || 'always', cost: ad.cost || 0,
    });
    setShowForm(true);
  }

  function handleNew() {
    setEditingAd(null);
    setForm({ title: '', description: '', type: 'top', advertiser: '', linkUrl: '', startDate: '', endDate: '', frequency: 'always', cost: 0 });
    setShowForm(true);
  }

  function handleSave() {
    if (!form.title) return;
    if (editingAd) {
      setAds(prev => prev.map(a => a.id === editingAd.id ? {
        ...a, ...form, imageUrl: a.imageUrl,
      } : a));
    } else {
      setAds(prev => [...prev, {
        id: `ad-new-${Date.now()}`, ...form, imageUrl: '', isActive: true,
        impressions: 0, clicks: 0,
      }]);
    }
    setShowForm(false);
  }

  const activeCount = ads.filter(a => a.isActive).length;
  const totalImpressions = ads.reduce((s, a) => s + (a.impressions || 0), 0);
  const totalClicks = ads.reduce((s, a) => s + (a.clicks || 0), 0);

  return (
    <div className="ad-manager">
      <div className="ad-manager-top">
        <div className="ad-stats">
          <span className="ad-stat">활성 <strong>{activeCount}</strong></span>
          <span className="ad-stat">노출 <strong>{totalImpressions.toLocaleString()}</strong></span>
          <span className="ad-stat">클릭 <strong>{totalClicks.toLocaleString()}</strong></span>
          <span className="ad-stat">CTR <strong>{totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : 0}%</strong></span>
        </div>
        <button className="ad-new-btn" onClick={handleNew}>+ 광고 등록</button>
      </div>

      {showForm && (
        <div className="ad-form-card">
          <h4>{editingAd ? '광고 수정' : '새 광고 등록'}</h4>
          <div className="ad-form-grid">
            <label>
              <span>광고명</span>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="광고 제목" />
            </label>
            <label>
              <span>광고주</span>
              <input value={form.advertiser} onChange={e => setForm(p => ({ ...p, advertiser: e.target.value }))} placeholder="광고주명" />
            </label>
            <label>
              <span>설명</span>
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="광고 설명" />
            </label>
            <label>
              <span>링크 URL</span>
              <input value={form.linkUrl} onChange={e => setForm(p => ({ ...p, linkUrl: e.target.value }))} placeholder="https://..." />
            </label>
            <label>
              <span>광고 위치</span>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as AdBanner['type'] }))}>
                <option value="top">상단 배너</option>
                <option value="sidebar">사이드바</option>
                <option value="product">상품 광고</option>
                <option value="popup">팝업 광고</option>
                <option value="bottom">하단 배너</option>
              </select>
            </label>
            <label>
              <span>노출 빈도</span>
              <select value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value as 'always' | 'daily' | 'weekly' }))}>
                <option value="always">항상</option>
                <option value="daily">하루 1회</option>
                <option value="weekly">주 1회</option>
              </select>
            </label>
            <label>
              <span>시작일</span>
              <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
            </label>
            <label>
              <span>종료일</span>
              <input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
            </label>
            <label>
              <span>광고비 (원)</span>
              <input type="number" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: Number(e.target.value) }))} />
            </label>
          </div>
          <div className="ad-form-actions">
            <button className="ad-save-btn" onClick={handleSave}>저장</button>
            <button className="ad-cancel-btn" onClick={() => setShowForm(false)}>취소</button>
          </div>
        </div>
      )}

      <div className="ad-list">
        {ads.map(ad => (
          <div key={ad.id} className={`ad-item ${!ad.isActive ? 'inactive' : ''}`}>
            <div className="ad-item-top">
              <span className="ad-type-badge" style={{ background: TYPE_COLORS[ad.type] || '#999' }}>
                {TYPE_LABELS[ad.type] || ad.type}
              </span>
              <span className={`ad-status ${ad.isActive ? 'active' : ''}`}>
                {ad.isActive ? '노출중' : '중지'}
              </span>
            </div>
            <h4 className="ad-item-title">{ad.title}</h4>
            <p className="ad-item-desc">{ad.description}</p>
            <div className="ad-item-meta">
              <span>광고주: {ad.advertiser}</span>
              <span>기간: {ad.startDate} ~ {ad.endDate}</span>
              <span>빈도: {ad.frequency === 'always' ? '항상' : ad.frequency === 'daily' ? '일 1회' : '주 1회'}</span>
            </div>
            <div className="ad-item-stats">
              <span>노출 {(ad.impressions || 0).toLocaleString()}</span>
              <span>클릭 {(ad.clicks || 0).toLocaleString()}</span>
              <span>CTR {ad.impressions ? (((ad.clicks || 0) / ad.impressions) * 100).toFixed(1) : 0}%</span>
              {ad.cost ? <span>비용 ₩{ad.cost.toLocaleString()}</span> : null}
            </div>
            <div className="ad-item-actions">
              <button className="ad-action-btn edit" onClick={() => handleEdit(ad)}>수정</button>
              <button className="ad-action-btn toggle" onClick={() => handleToggle(ad.id)}>
                {ad.isActive ? '중지' : '활성화'}
              </button>
              <button className="ad-action-btn delete" onClick={() => handleDelete(ad.id)}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
