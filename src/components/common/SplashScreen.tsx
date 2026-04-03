import { useEffect, useState } from 'react';
import './SplashScreen.css';

const BREADS = ['🥐', '🍞', '🥖', '🧁', '🥯', '🍩', '🥨', '🍪'];

interface FloatingBread {
  id: number;
  emoji: string;
  left: number;   // %
  delay: number;  // s
  size: number;   // px
}

const FLOATING_BREADS: FloatingBread[] = BREADS.map((emoji, i) => ({
  id: i,
  emoji,
  left: 8 + i * 12,
  delay: 0.1 + i * 0.12,
  size: 20 + (i % 3) * 6,
}));

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 2200);
    const endTimer = setTimeout(onFinish, 2800);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, [onFinish]);

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>

      {/* 아래에서 솟아오르는 작은 빵 이모지들 */}
      <div className="splash-breads">
        {FLOATING_BREADS.map(b => (
          <span
            key={b.id}
            className="splash-bread"
            style={{
              left: `${b.left}%`,
              fontSize: `${b.size}px`,
              animationDelay: `${b.delay}s`,
            }}
          >
            {b.emoji}
          </span>
        ))}
      </div>

      <div className="splash-content">

        {/* 접은 지도 + 식빵 로고 */}
        <div className="splash-logo-icon">
          <svg
            className="splash-map-svg"
            viewBox="0 0 160 168"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 그림자 */}
            <ellipse cx="80" cy="162" rx="58" ry="5" fill="rgba(0,0,0,0.10)" />

            {/* ── 지도 패널 6개 (지그재그 접힘) ── */}
            <polygon points="4,62 28,52 28,138 4,128" fill="#DEDEDE" />
            <polygon points="28,52 56,58 56,144 28,138" fill="#F3F3F3" />
            <polygon points="56,58 84,52 84,138 56,144" fill="#E6E6E6" />
            <polygon points="84,52 112,58 112,144 84,138" fill="#F3F3F3" />
            <polygon points="112,58 136,52 136,138 112,144" fill="#E6E6E6" />
            <polygon points="136,52 156,62 156,126 136,138" fill="#D8D8D8" />

            {/* 수평 접힘 음영 */}
            <polygon points="4,94 156,94 156,96 4,96" fill="rgba(0,0,0,0.05)" />

            {/* 접힘 세로선 */}
            <line x1="28"  y1="52"  x2="28"  y2="138" stroke="rgba(0,0,0,0.14)" strokeWidth="1.2" />
            <line x1="56"  y1="58"  x2="56"  y2="144" stroke="rgba(0,0,0,0.10)" strokeWidth="1.0" />
            <line x1="84"  y1="52"  x2="84"  y2="138" stroke="rgba(0,0,0,0.14)" strokeWidth="1.2" />
            <line x1="112" y1="58"  x2="112" y2="144" stroke="rgba(0,0,0,0.10)" strokeWidth="1.0" />
            <line x1="136" y1="52"  x2="136" y2="138" stroke="rgba(0,0,0,0.14)" strokeWidth="1.2" />

            {/* 상단 하이라이트 */}
            <polygon points="4,62 28,52 28,57 4,67"      fill="rgba(255,255,255,0.6)" />
            <polygon points="28,52 56,58 56,63 28,57"     fill="rgba(255,255,255,0.8)" />
            <polygon points="56,58 84,52 84,57 56,63"     fill="rgba(255,255,255,0.6)" />
            <polygon points="84,52 112,58 112,63 84,57"   fill="rgba(255,255,255,0.8)" />
            <polygon points="112,58 136,52 136,57 112,63" fill="rgba(255,255,255,0.6)" />
            <polygon points="136,52 156,62 156,67 136,57" fill="rgba(255,255,255,0.4)" />

            {/* 도로 장식선 */}
            <line x1="10" y1="80" x2="24" y2="80" stroke="#CDCDCD" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="10" y1="112" x2="24" y2="112" stroke="#CDCDCD" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="34" y1="76" x2="50" y2="76" stroke="#CDCDCD" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="34" y1="118" x2="50" y2="118" stroke="#CDCDCD" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="62" y1="80" x2="78" y2="80" stroke="#CDCDCD" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="62" y1="112" x2="78" y2="112" stroke="#CDCDCD" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="90" y1="76" x2="106" y2="76" stroke="#CDCDCD" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="90" y1="118" x2="106" y2="118" stroke="#CDCDCD" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="118" y1="80" x2="130" y2="80" stroke="#CDCDCD" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="118" y1="112" x2="130" y2="112" stroke="#CDCDCD" strokeWidth="1.5" strokeLinecap="round"/>

            {/* 식빵 — 지도 상단 위에 얹힌 느낌 (잘리지 않게 여유) */}
            <text
              x="80"
              y="46"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="104"
            >
              🍞
            </text>
          </svg>
        </div>

        {/* 타이틀 */}
        <h1 className="splash-title">
          <span className="splash-char" style={{ animationDelay: '0.3s' }}>빵</span>
          <span className="splash-space"> </span>
          <span className="splash-char" style={{ animationDelay: '0.5s' }}>맵</span>
        </h1>
        <p className="splash-tagline">내 주변 맛있는 빵집을 찾아보세요</p>
      </div>
    </div>
  );
}
