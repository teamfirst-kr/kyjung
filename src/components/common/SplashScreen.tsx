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
            viewBox="0 0 140 108"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 그림자 */}
            <ellipse cx="70" cy="104" rx="52" ry="5" fill="rgba(0,0,0,0.10)" />

            {/* ── 지도 패널 4개 (접힌 느낌) ── */}
            {/* 왼쪽 패널 */}
            <polygon points="6,16 38,9 38,90 6,84" fill="#5BAD6F" />
            {/* 중앙-왼쪽 패널 */}
            <polygon points="38,9 74,11 74,92 38,90" fill="#74C988" />
            {/* 중앙-오른쪽 패널 */}
            <polygon points="74,11 110,9 110,90 74,92" fill="#5BAD6F" />
            {/* 오른쪽 패널 */}
            <polygon points="110,9 134,16 134,82 110,90" fill="#4A9A5C" />

            {/* 수평 접힘 (상/하 구분선 + 음영) */}
            <polygon points="6,50 134,50 134,52 6,52" fill="rgba(0,0,0,0.06)" />

            {/* 파란 물/바다 영역 */}
            <ellipse cx="22" cy="36" rx="11" ry="8"  fill="#59B8D5" opacity="0.82" />
            <ellipse cx="22" cy="68" rx="9"  ry="6"  fill="#59B8D5" opacity="0.70" />
            <ellipse cx="120" cy="30" rx="8" ry="5.5" fill="#59B8D5" opacity="0.80" />
            <ellipse cx="118" cy="70" rx="7" ry="5"  fill="#59B8D5" opacity="0.65" />

            {/* 접힘 세로선 */}
            <line x1="38"  y1="9"  x2="38"  y2="90" stroke="rgba(0,0,0,0.16)" strokeWidth="1.2" />
            <line x1="74"  y1="11" x2="74"  y2="92" stroke="rgba(0,0,0,0.13)" strokeWidth="1.0" />
            <line x1="110" y1="9"  x2="110" y2="90" stroke="rgba(0,0,0,0.16)" strokeWidth="1.2" />

            {/* 상단 하이라이트 (접힌 종이 느낌) */}
            <polygon points="6,16 38,9 38,14 6,21"   fill="rgba(255,255,255,0.18)" />
            <polygon points="38,9 74,11 74,16 38,14"  fill="rgba(255,255,255,0.22)" />
            <polygon points="74,11 110,9 110,14 74,16" fill="rgba(255,255,255,0.18)" />
            <polygon points="110,9 134,16 134,21 110,14" fill="rgba(255,255,255,0.12)" />

            {/* 중앙 식빵 이모지 */}
            <text
              x="70"
              y="57"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="34"
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
