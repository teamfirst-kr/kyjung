import { Bakery, BakeryType } from '../../types/bakery';

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// ── 5 bread icons — white shapes on colored badge, centered at (28,26) ──

// 0. 식빵 — rectangular loaf + dome + vertical score lines
const ICON_SIKBBANG = () => `
  <rect x="14" y="24" width="28" height="15" rx="4" fill="rgba(255,255,255,0.95)"/>
  <ellipse cx="28" cy="24" rx="14" ry="8" fill="rgba(255,255,255,0.95)"/>
  <line x1="21" y1="17" x2="21" y2="39" stroke="rgba(0,0,0,0.1)" stroke-width="1.5"/>
  <line x1="28" y1="16" x2="28" y2="39" stroke="rgba(0,0,0,0.1)" stroke-width="1.5"/>
  <line x1="35" y1="17" x2="35" y2="39" stroke="rgba(0,0,0,0.1)" stroke-width="1.5"/>`;

// 1. 소금빵 — elongated oval body + diagonal score lines + salt crystals (from photo)
const ICON_SOGEUMBANG = () => `
  <ellipse cx="28" cy="27" rx="17" ry="10" fill="rgba(255,255,255,0.95)"/>
  <line x1="17" y1="20" x2="14" y2="34" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/>
  <line x1="23" y1="19" x2="20" y2="34" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/>
  <line x1="29" y1="19" x2="26" y2="34" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/>
  <line x1="35" y1="20" x2="32" y2="34" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/>
  <circle cx="24" cy="20" r="1.3" fill="rgba(0,0,0,0.18)"/>
  <circle cx="29" cy="19" r="1.5" fill="rgba(0,0,0,0.18)"/>
  <circle cx="34" cy="20" r="1.2" fill="rgba(0,0,0,0.18)"/>`;

// 2. 케이크 — two-tier cake + candle + frosting waves
const ICON_CAKE = () => `
  <rect x="12" y="27" width="32" height="11" rx="4" fill="rgba(255,255,255,0.95)"/>
  <rect x="17" y="19" width="22" height="10" rx="3" fill="rgba(255,255,255,0.95)"/>
  <rect x="27" y="13" width="2"  height="7"  rx="1" fill="rgba(255,255,255,0.8)"/>
  <ellipse cx="28" cy="13" rx="2" ry="2.5" fill="rgba(255,255,255,0.9)"/>
  <path d="M12,29 Q19,25 28,29 Q37,25 44,29" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="1.2"/>
  <path d="M17,21 Q24,17 28,21 Q32,17 39,21" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="1.2"/>`;

// 3. 바게트 — long loaf + diagonal slash marks
const ICON_BAGUETTE = () => `
  <rect x="9" y="21" width="38" height="12" rx="6" fill="rgba(255,255,255,0.95)"/>
  <line x1="16" y1="19" x2="13" y2="35" stroke="rgba(0,0,0,0.1)" stroke-width="1.5"/>
  <line x1="23" y1="19" x2="20" y2="35" stroke="rgba(0,0,0,0.1)" stroke-width="1.5"/>
  <line x1="30" y1="19" x2="27" y2="35" stroke="rgba(0,0,0,0.1)" stroke-width="1.5"/>
  <line x1="37" y1="19" x2="34" y2="35" stroke="rgba(0,0,0,0.1)" stroke-width="1.5"/>`;

// 4. 베이글 — ring with center hole
const ICON_BAGEL = () => `
  <ellipse cx="28" cy="26" rx="14" ry="10" fill="rgba(255,255,255,0.95)"/>
  <ellipse cx="28" cy="26" rx="5.5" ry="3.8" fill="rgba(0,0,0,0.15)"/>`;

const BREAD_ICONS = [ICON_SIKBBANG, ICON_SOGEUMBANG, ICON_CAKE, ICON_BAGUETTE, ICON_BAGEL];

// ── 매장명(name) 기준 아이콘 인덱스 — 키워드 포함 여부만 판단 ──
function getBreadIconIndex(bakery: Bakery): number {
  const name = bakery.name;
  if (name.includes('소금빵')) return 1; // ICON_SOGEUMBANG
  if (name.includes('케이크')) return 2; // ICON_CAKE
  if (name.includes('베이글')) return 4; // ICON_BAGEL
  if (name.includes('식빵'))  return 0; // ICON_SIKBBANG
  return 3; // ICON_BAGUETTE — 기본값 (전체/프랜차이즈/미분류)
}

// ── 갓 구운 빵 스팀 애니메이션 ──
const STEAM_SVG = `
  <g>
    <circle cx="18" cy="4" r="2" fill="white" opacity="0.7">
      <animate attributeName="cy" values="4;-4" dur="1.6s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.7;0" dur="1.6s" repeatCount="indefinite"/>
      <animate attributeName="r"  values="2;3.5" dur="1.6s" repeatCount="indefinite"/>
    </circle>
    <circle cx="28" cy="2" r="1.8" fill="white" opacity="0.6">
      <animate attributeName="cy" values="2;-6" dur="1.9s" begin="0.35s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;0" dur="1.9s" begin="0.35s" repeatCount="indefinite"/>
      <animate attributeName="r"  values="1.8;3.2" dur="1.9s" begin="0.35s" repeatCount="indefinite"/>
    </circle>
    <circle cx="38" cy="4" r="2.2" fill="white" opacity="0.55">
      <animate attributeName="cy" values="4;-4" dur="2.1s" begin="0.7s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.55;0" dur="2.1s" begin="0.7s" repeatCount="indefinite"/>
      <animate attributeName="r"  values="2.2;4" dur="2.1s" begin="0.7s" repeatCount="indefinite"/>
    </circle>
  </g>`;

export function getBakeryMarkerSvg(bakery: Bakery, hasFreshBread: boolean, isSelected: boolean): string {
  const isFranchise = bakery.type === BakeryType.FRANCHISE;
  const isRegistered = bakery.isRegistered;

  // ── 색상 분기 ──
  // 추천매장(입점) → 골드  |  프랜차이즈 → 초록  |  개인 → 베이지
  const badge  = isRegistered ? '#F0C040' : isFranchise ? '#4CAF50' : '#D4956A';
  const border = isRegistered ? '#B8860B'  : isFranchise ? '#2E7D32' : '#A0714A';

  const iconIndex = getBreadIconIndex(bakery);
  const icon = BREAD_ICONS[iconIndex]();

  // 추천매장은 기본보다 10% 크게
  const scale = isSelected ? 1.22 : isRegistered ? 1.1 : 1;
  const uid   = `b${hashString(bakery.id) % 99999}`;

  const shadowFilter = `
    <filter id="sh${uid}" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="2" stdDeviation="${isRegistered ? 4 : 3}"
        flood-color="${isRegistered ? '#B8860B55' : '#00000040'}"/>
    </filter>`;
  const selGlow = isSelected
    ? `<filter id="glow${uid}" x="-40%" y="-40%" width="180%" height="180%">
         <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="${badge}" flood-opacity="0.7"/>
       </filter>`
    : '';
  const glowAttr = isSelected ? ` filter="url(#glow${uid})"` : '';

  // 추천매장 — 오른쪽 상단에 별 뱃지
  const starBadge = isRegistered
    ? `<circle cx="44" cy="9" r="8" fill="#FF5722"/>
       <text x="44" y="13" text-anchor="middle" font-size="9" fill="white" font-family="sans-serif">★</text>`
    : '';

  // 입점 매장(scale 1.1)이나 선택(scale 1.22) 시 잘림 방지를 위해 큰 viewBox 사용
  const vw = 66;
  const vh = 82;
  const ox = (vw - 56) / 2; // 좌우 여백 5
  const oy = (vh - 72) / 2; // 상하 여백 5

  return `<svg width="${vw}" height="${vh}" viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg">
  <defs>${shadowFilter}${selGlow}</defs>
  <g transform="translate(${ox + 28 - 28 * scale},${oy + 52 - 52 * scale}) scale(${scale})">
    <g filter="url(#sh${uid})"${glowAttr}>
      <rect x="4" y="2" width="48" height="48" rx="14" fill="${badge}" stroke="${border}" stroke-width="${isRegistered ? 2 : 1.5}"/>
      <polygon points="28,68 20,49 36,49" fill="${badge}"/>
    </g>
    <rect x="8" y="6" width="40" height="20" rx="10" fill="rgba(255,255,255,0.18)"/>
    ${icon}
    ${hasFreshBread ? STEAM_SVG : ''}
    ${starBadge}
  </g>
</svg>`;
}
