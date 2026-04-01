import { useFilterContext, BREAD_CATEGORIES } from '../../context/FilterContext';
import './FilterPanel.css';

export default function FilterPanel() {
  const { filters, updateFilter } = useFilterContext();

  return (
    <div className="filter-panel">
      <div className="filter-row">
        <div className="filter-buttons">
          <button
            className={`filter-btn toggle-btn ${filters.includeFranchise ? 'active' : ''}`}
            onClick={() => updateFilter('includeFranchise', !filters.includeFranchise)}
          >🏪 프랜차이즈 {filters.includeFranchise ? 'ON' : 'OFF'}</button>
          <button
            className={`filter-btn ${filters.currentlyBaking ? 'active baking' : ''}`}
            onClick={() => updateFilter('currentlyBaking', !filters.currentlyBaking)}
          >🔥 갓 구운 빵</button>
        </div>
        <select
          className="filter-select"
          value={filters.sortBy}
          onChange={e => updateFilter('sortBy', e.target.value as 'rating' | 'name' | 'reviewCount')}
        >
          <option value="rating">추천순</option>
          <option value="reviewCount">리뷰순</option>
        </select>
      </div>

      <div className="category-row">
        <button
          className={`cat-btn ${filters.breadCategory === null ? 'active' : ''}`}
          onClick={() => updateFilter('breadCategory', null)}
        >전체</button>
        {BREAD_CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`cat-btn ${filters.breadCategory === cat ? 'active' : ''}`}
            onClick={() => updateFilter('breadCategory', filters.breadCategory === cat ? null : cat)}
          >{cat}</button>
        ))}
      </div>
    </div>
  );
}
