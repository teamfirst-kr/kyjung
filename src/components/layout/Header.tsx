import { useState } from 'react';
import { useFilterContext } from '../../context/FilterContext';
import { useCartContext } from '../../context/CartContext';
import type { UserRole } from './BottomTabBar';
import './Header.css';

interface Props {
  onOpenAuth: () => void;
  onOpenStoreReg: () => void;
  onGoHome: () => void;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  consumer: '👤 소비자',
  seller: '🏠 판매자',
  admin: '🛠️ 관리자',
};

export default function Header({ onOpenAuth, onOpenStoreReg, onGoHome, userRole, onChangeRole }: Props) {
  const { filters, updateFilter, searchByKeyword, isLoadingNaver, lastSearchResult, clearSearchResult } = useFilterContext();
  const { itemCount, setCartOpen } = useCartContext();
  const [menuOpen, setMenuOpen] = useState(false);

  // Enter 키로 검색 → 네이버 API 호출, 지도 이동은 mapFlyTarget으로 처리
  const handleSearchKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || !filters.searchQuery.trim()) return;
    e.preventDefault();
    await searchByKeyword(filters.searchQuery.trim());
  };

  // 추천 검색어 클릭
  const handleSuggestionClick = async (suggestion: string) => {
    updateFilter('searchQuery', suggestion);
    clearSearchResult();
    await searchByKeyword(suggestion);
  };

  // 검색어 클리어 시 결과도 초기화
  const handleClearSearch = () => {
    updateFilter('searchQuery', '');
    clearSearchResult();
  };

  return (
    <header className="header">
      <div className="header-logo" onClick={onGoHome}>
        <span className="logo-icon">🍞</span>
        <h1 className="logo-text">빵맵</h1>
      </div>
      <div className="header-search">
        <svg className="search-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <line x1="15.5" y1="15.5" x2="20" y2="20" />
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="빵집, 지역명 검색 후 Enter..."
          value={filters.searchQuery}
          onChange={e => updateFilter('searchQuery', e.target.value)}
          onKeyDown={handleSearchKeyDown}
          disabled={isLoadingNaver}
        />
        {filters.searchQuery && (
          <button className="search-clear" onClick={handleClearSearch}>✕</button>
        )}
        {/* 검색 결과 카운트 */}
        {lastSearchResult && lastSearchResult.bakeries.length > 0 && (
          <span className="search-result-count">{lastSearchResult.bakeries.length}개</span>
        )}
        {/* 추천 검색어 (결과 없을 때) */}
        {lastSearchResult && lastSearchResult.bakeries.length === 0 && lastSearchResult.suggestions.length > 0 && (
          <div className="search-suggestions">
            <span className="suggestions-label">이런 검색을 찾으시나요?</span>
            {lastSearchResult.suggestions.map((s, i) => (
              <button key={i} className="suggestion-chip" onClick={() => handleSuggestionClick(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
        {/* 결과 없음 (추천도 없을 때) */}
        {lastSearchResult && lastSearchResult.bakeries.length === 0 && lastSearchResult.suggestions.length === 0 && (
          <div className="search-no-result">
            검색 결과가 없습니다. 지역명 + 빵집/베이커리로 검색해보세요.
          </div>
        )}
      </div>
      <div className="header-right">
        <button className="header-icon-btn cart-icon-btn" onClick={() => setCartOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
        </button>
        <button className="header-icon-btn profile-btn" onClick={() => setMenuOpen(!menuOpen)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
        {menuOpen && (
          <div className="header-menu">
            {/* 역할 전환 (데모용) */}
            <div className="header-menu-section">
              <span className="menu-section-label">역할 전환</span>
              {(['consumer', 'seller', 'admin'] as UserRole[]).map(role => (
                <button
                  key={role}
                  className={`header-menu-item ${userRole === role ? 'active-role' : ''}`}
                  onClick={() => { onChangeRole(role); setMenuOpen(false); }}
                >
                  <span>{ROLE_LABELS[role]}</span>
                  {userRole === role && <span className="role-check">✓</span>}
                </button>
              ))}
            </div>
            <div className="menu-divider" />
            <button className="header-menu-item" onClick={() => { onOpenStoreReg(); setMenuOpen(false); }}>
              <span>🏠</span> 입점신청
            </button>
            <button className="header-menu-item" onClick={() => { onOpenAuth(); setMenuOpen(false); }}>
              <span>👤</span> 회원가입
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
