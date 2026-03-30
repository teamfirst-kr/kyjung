import './BottomTabBar.css';

export type TabType = 'map' | 'community' | 'news' | 'my' | 'event' | 'store-manage' | 'admin';
export type UserRole = 'consumer' | 'seller' | 'admin';

interface Props {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  userRole: UserRole;
}

/* ⑥ SVG 아이콘 시스템 — outline(비활성) / filled(활성) */
interface TabDef {
  key: TabType;
  label: string;
  roles: UserRole[]; // 어떤 역할에서 보이는지
  icon: (active: boolean) => JSX.Element;
}

const allTabs: TabDef[] = [
  {
    key: 'map',
    label: '빵맵',
    roles: ['consumer', 'seller', 'admin'],
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.8}>
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        {!a && <circle cx="12" cy="9" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />}
        {a && <circle cx="12" cy="9" r="2.5" fill="white" />}
      </svg>
    ),
  },
  {
    key: 'community',
    label: '빵수다',
    roles: ['consumer', 'seller', 'admin'],
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.8}>
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        {a && <>
          <line x1="8" y1="9" x2="16" y2="9" stroke="white" strokeWidth="1.5" />
          <line x1="8" y1="13" x2="13" y2="13" stroke="white" strokeWidth="1.5" />
        </>}
        {!a && <>
          <line x1="8" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="1.5" />
          <line x1="8" y1="13" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" />
        </>}
      </svg>
    ),
  },
  {
    key: 'news',
    label: '빵소식',
    roles: ['consumer', 'seller', 'admin'],
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.8}>
        <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" />
        {a && <>
          <line x1="7" y1="8" x2="17" y2="8" stroke="white" strokeWidth="1.5" />
          <line x1="7" y1="12" x2="17" y2="12" stroke="white" strokeWidth="1.5" />
          <line x1="7" y1="16" x2="13" y2="16" stroke="white" strokeWidth="1.5" />
        </>}
        {!a && <>
          <line x1="7" y1="8" x2="17" y2="8" />
          <line x1="7" y1="12" x2="17" y2="12" />
          <line x1="7" y1="16" x2="13" y2="16" />
        </>}
      </svg>
    ),
  },
  {
    key: 'my',
    label: '마이빵집',
    roles: ['consumer', 'seller', 'admin'],
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.8}>
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
  {
    key: 'event',
    label: '이벤트',
    roles: ['consumer', 'seller', 'admin'],
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.8}>
        <path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6" />
        <rect x="2" y="7" width="20" height="5" rx="1" />
        <line x1="12" y1="22" x2="12" y2="7" stroke={a ? 'white' : 'currentColor'} strokeWidth={a ? 1.5 : 1.8} />
        <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
      </svg>
    ),
  },
  {
    key: 'store-manage',
    label: '매장관리',
    roles: ['seller'],
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.8}>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        {a && <rect x="9" y="14" width="6" height="8" fill="white" rx="1" />}
        {!a && <polyline points="9,22 9,12 15,12 15,22" fill="none" stroke="currentColor" strokeWidth="1.8" />}
      </svg>
    ),
  },
  {
    key: 'admin',
    label: '관리자',
    roles: ['admin'],
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.8}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
];

export default function BottomTabBar({ activeTab, onChangeTab, userRole }: Props) {
  const visibleTabs = allTabs.filter(tab => tab.roles.includes(userRole));

  return (
    <nav className="bottom-tab-bar">
      {visibleTabs.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            className={`tab-item ${isActive ? 'active' : ''}`}
            onClick={() => onChangeTab(tab.key)}
          >
            <span className="tab-icon">{tab.icon(isActive)}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
