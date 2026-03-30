import { Bakery, BakeryType } from '../../types/bakery';

// 5 different 3D isometric bakery building designs
const BUILDING_DESIGNS = [
  // Design 1: Cute house with chimney
  (color: string, roofColor: string) => `
    <g transform="translate(8,12)">
      <rect x="6" y="18" width="28" height="22" rx="2" fill="${color}" stroke="${roofColor}" stroke-width="1"/>
      <polygon points="5,18 20,6 35,18" fill="${roofColor}" stroke="${roofColor}" stroke-width="1"/>
      <rect x="30" y="4" width="4" height="12" rx="1" fill="#8B7355"/>
      <rect x="12" y="24" width="8" height="8" rx="1" fill="rgba(255,255,255,0.7)" stroke="${roofColor}" stroke-width="0.5"/>
      <rect x="24" y="24" width="5" height="10" rx="1" fill="#8B6914"/>
      <circle cx="27" cy="30" r="0.8" fill="#333"/>
    </g>`,
  // Design 2: European bakery with awning
  (color: string, roofColor: string) => `
    <g transform="translate(8,14)">
      <rect x="6" y="14" width="28" height="24" rx="2" fill="${color}" stroke="${roofColor}" stroke-width="1"/>
      <rect x="6" y="12" width="28" height="6" rx="2" fill="${roofColor}"/>
      <path d="M6,18 Q13,22 20,18 Q27,22 34,18" stroke="white" stroke-width="1.5" fill="none" opacity="0.6"/>
      <rect x="10" y="22" width="7" height="7" rx="1" fill="rgba(255,255,255,0.7)"/>
      <rect x="23" y="22" width="7" height="7" rx="1" fill="rgba(255,255,255,0.7)"/>
      <rect x="16" y="26" width="5" height="10" rx="1" fill="#8B6914"/>
    </g>`,
  // Design 3: Round cottage bakery
  (color: string, roofColor: string) => `
    <g transform="translate(8,12)">
      <rect x="8" y="20" width="24" height="20" rx="4" fill="${color}" stroke="${roofColor}" stroke-width="1"/>
      <ellipse cx="20" cy="20" rx="16" ry="10" fill="${roofColor}"/>
      <rect x="13" y="26" width="6" height="6" rx="2" fill="rgba(255,255,255,0.7)"/>
      <rect x="22" y="26" width="6" height="6" rx="2" fill="rgba(255,255,255,0.7)"/>
      <rect x="17" y="30" width="5" height="9" rx="1" fill="#8B6914"/>
      <circle cx="20" cy="16" r="2" fill="white" opacity="0.5"/>
    </g>`,
  // Design 4: Modern bakery with sign
  (color: string, roofColor: string) => `
    <g transform="translate(8,14)">
      <rect x="6" y="10" width="28" height="28" rx="3" fill="${color}" stroke="${roofColor}" stroke-width="1"/>
      <rect x="6" y="10" width="28" height="8" rx="3" fill="${roofColor}"/>
      <text x="20" y="17" text-anchor="middle" font-size="5" fill="white" font-weight="bold">BAKERY</text>
      <rect x="8" y="22" width="24" height="10" rx="2" fill="rgba(255,255,255,0.6)"/>
      <rect x="17" y="30" width="6" height="8" rx="1" fill="#8B6914"/>
    </g>`,
  // Design 5: Traditional Korean bakery
  (color: string, roofColor: string) => `
    <g transform="translate(8,12)">
      <rect x="6" y="20" width="28" height="20" rx="2" fill="${color}" stroke="${roofColor}" stroke-width="1"/>
      <path d="M3,20 L20,8 L37,20 Z" fill="${roofColor}"/>
      <path d="M5,20 L20,10 L35,20" fill="none" stroke="white" stroke-width="0.5" opacity="0.4"/>
      <rect x="10" y="24" width="6" height="6" rx="1" fill="rgba(255,255,255,0.7)"/>
      <rect x="24" y="24" width="6" height="6" rx="1" fill="rgba(255,255,255,0.7)"/>
      <rect x="17" y="28" width="5" height="11" rx="1" fill="#8B6914"/>
    </g>`,
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const STEAM_SVG = `
  <g class="steam-anim">
    <circle cx="16" cy="8" r="2" fill="white" opacity="0.7">
      <animate attributeName="cy" values="10;2" dur="1.5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.7;0" dur="1.5s" repeatCount="indefinite"/>
      <animate attributeName="r" values="2;3.5" dur="1.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="22" cy="6" r="1.8" fill="white" opacity="0.6">
      <animate attributeName="cy" values="8;0" dur="1.8s" begin="0.3s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;0" dur="1.8s" begin="0.3s" repeatCount="indefinite"/>
      <animate attributeName="r" values="1.8;3" dur="1.8s" begin="0.3s" repeatCount="indefinite"/>
    </circle>
    <circle cx="28" cy="9" r="2.2" fill="white" opacity="0.5">
      <animate attributeName="cy" values="10;1" dur="2s" begin="0.6s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.5;0" dur="2s" begin="0.6s" repeatCount="indefinite"/>
      <animate attributeName="r" values="2.2;3.8" dur="2s" begin="0.6s" repeatCount="indefinite"/>
    </circle>
  </g>`;

export function getBakeryMarkerSvg(bakery: Bakery, hasFreshBread: boolean, isSelected: boolean): string {
  const isFranchise = bakery.type === BakeryType.FRANCHISE;
  const color = isFranchise ? '#FFF3E0' : '#E8F5E9';
  const roofColor = isFranchise ? '#FF8C42' : '#66BB6A';
  const designIndex = hashString(bakery.id) % BUILDING_DESIGNS.length;
  const building = BUILDING_DESIGNS[designIndex](color, roofColor);
  const scale = isSelected ? 1.2 : 1;
  const shadow = isSelected
    ? '<filter id="sel"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#D4956A" flood-opacity="0.5"/></filter>'
    : '';
  const filterAttr = isSelected ? ' filter="url(#sel)"' : '';

  return `<svg width="56" height="72" viewBox="0 0 56 72" xmlns="http://www.w3.org/2000/svg">
    <defs>${shadow}</defs>
    <g transform="translate(${28 - 28 * scale},${48 - 48 * scale}) scale(${scale})"${filterAttr}>
      ${hasFreshBread ? STEAM_SVG : ''}
      ${building}
      ${bakery.isPremium ? '<circle cx="38" cy="14" r="5" fill="#FF5722"/><text x="38" y="16.5" text-anchor="middle" font-size="5" fill="white" font-weight="bold">AD</text>' : ''}
    </g>
    <polygon points="28,72 23,58 33,58" fill="${roofColor}" opacity="0.8"/>
  </svg>`;
}
