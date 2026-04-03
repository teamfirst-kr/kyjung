import { useEffect, useState } from 'react';
import './SplashScreen.css';

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
      <div className="splash-content">

        {/* 접은 지도 + 식빵 로고 */}
        <div className="splash-logo-icon">
          <svg
            className="splash-map-svg"
            viewBox="0 0 160 148"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 그림자 */}
            <ellipse cx="80" cy="142" rx="58" ry="5" fill="rgba(0,0,0,0.10)" />

            {/* ── 지도 패널 6개 (지그재그 접힘) ── */}
            {/* 패널 1 (왼쪽 끝 — 위로 접힘) */}
            <polygon points="4,42 28,32 28,118 4,108" fill="#DEDEDE" />
            {/* 패널 2 (아래로 접힘) */}
            <polygon points="28,32 56,38 56,124 28,118" fill="#F3F3F3" />
            {/* 패널 3 (위로 접힘) */}
            <polygon points="56,38 84,32 84,118 56,124" fill="#E6E6E6" />
            {/* 패널 4 (아래로 접힘) */}
            <polygon points="84,32 112,38 112,124 84,118" fill="#F3F3F3" />
            {/* 패널 5 (위로 접힘) */}
            <polygon points="112,38 136,32 136,118 112,124" fill="#E6E6E6" />
            {/* 패널 6 (오른쪽 끝 — 아래로 접힘) */}
            <polygon points="136,32 156,42 156,106 136,118" fill="#D8D8D8" />

            {/* 수평 접힘 음영 */}
            <polygon points="4,74 156,74 156,76 4,76" fill="rgba(0,0,0,0.05)" />

            {/* 접힘 세로선 (지그재그 골) */}
            <line x1="28"  y1="32"  x2="28"  y2="118" stroke="rgba(0,0,0,0.14)" strokeWidth="1.2" />
            <line x1="56"  y1="38"  x2="56"  y2="124" stroke="rgba(0,0,0,0.10)" strokeWidth="1.0" />
            <line x1="84"  y1="32"  x2="84"  y2="118" stroke="rgba(0,0,0,0.14)" strokeWidth="1.2" />
            <line x1="112" y1="38"  x2="112" y2="124" stroke="rgba(0,0,0,0.10)" strokeWidth="1.0" />
            <line x1="136" y1="32"  x2="136" y2="118" stroke="rgba(0,0,0,0.14)" strokeWidth="1.2" />

            {/* 상단 하이라이트 (빛 반사) */}
            <polygon points="4,42 28,32 28,37 4,47"      fill="rgba(255,255,255,0.6)" />
            <polygon points="28,32 56,38 56,43 28,37"     fill="rgba(255,255,255,0.8)" />
            <polygon points="56,38 84,32 84,37 56,43"     fill="rgba(255,255,255,0.6)" />
            <polygon points="84,32 112,38 112,43 84,37"   fill="rgba(255,255,255,0.8)" />
            <polygon points="112,38 136,32 136,37 112,43" fill="rgba(255,255,255,0.6)" />
            <polygon points="136,32 156,42 156,47 136,37" fill="rgba(255,255,255,0.4)" />

            {/* 지도 위 장식선 (도로 느낌) */}
            <line x1="10" y1="60" x2="24" y2="60" stroke="#CDCDCD" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="10" y1="92" x2="24" y2="92" stroke="#CDCDCD" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="34" y1="56" x2="50" y2="56" stroke="#CDCDCD" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="34" y1="98" x2="50" y2="98" stroke="#CDCDCD" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="62" y1="60" x2="78" y2="60" stroke="#CDCDCD" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="62" y1="92" x2="78" y2="92" stroke="#CDCDCD" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="90" y1="56" x2="106" y2="56" stroke="#CDCDCD" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="90" y1="98" x2="106" y2="98" stroke="#CDCDCD" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="118" y1="60" x2="130" y2="60" stroke="#CDCDCD" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="118" y1="92" x2="130" y2="92" stroke="#CDCDCD" strokeWidth="1.5" strokeLinecap="round"/>

            {/* 식빵 — 지도 윗쪽에 크게 얹힌 느낌 */}
            <text
              x="80"
              y="32"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="80"
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
