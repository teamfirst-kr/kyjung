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
            viewBox="0 0 140 128"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 그림자 */}
            <ellipse cx="70" cy="122" rx="52" ry="5" fill="rgba(0,0,0,0.10)" />

            {/* ── 지도 패널 4개 (흰색 계열) ── */}
            {/* 왼쪽 패널 */}
            <polygon points="6,36 38,30 38,110 6,104" fill="#E8E8E8" />
            {/* 중앙-왼쪽 패널 */}
            <polygon points="38,30 74,32 74,112 38,110" fill="#F5F5F5" />
            {/* 중앙-오른쪽 패널 */}
            <polygon points="74,32 110,30 110,110 74,112" fill="#EEEEEE" />
            {/* 오른쪽 패널 */}
            <polygon points="110,30 134,36 134,102 110,110" fill="#E0E0E0" />

            {/* 수평 접힘 음영 */}
            <polygon points="6,70 134,70 134,72 6,72" fill="rgba(0,0,0,0.05)" />

            {/* 접힘 세로선 */}
            <line x1="38"  y1="30"  x2="38"  y2="110" stroke="rgba(0,0,0,0.12)" strokeWidth="1.2" />
            <line x1="74"  y1="32"  x2="74"  y2="112" stroke="rgba(0,0,0,0.09)" strokeWidth="1.0" />
            <line x1="110" y1="30"  x2="110" y2="110" stroke="rgba(0,0,0,0.12)" strokeWidth="1.2" />

            {/* 상단 하이라이트 */}
            <polygon points="6,36 38,30 38,35 6,41"    fill="rgba(255,255,255,0.7)" />
            <polygon points="38,30 74,32 74,37 38,35"   fill="rgba(255,255,255,0.8)" />
            <polygon points="74,32 110,30 110,35 74,37" fill="rgba(255,255,255,0.7)" />
            <polygon points="110,30 134,36 134,41 110,35" fill="rgba(255,255,255,0.5)" />

            {/* 지도 위 장식선 (도로 느낌) */}
            <line x1="15" y1="55" x2="35" y2="55" stroke="#D0D0D0" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="15" y1="85" x2="35" y2="85" stroke="#D0D0D0" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="48" y1="50" x2="68" y2="50" stroke="#D0D0D0" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="48" y1="90" x2="68" y2="90" stroke="#D0D0D0" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="80" y1="55" x2="100" y2="55" stroke="#D0D0D0" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="80" y1="85" x2="100" y2="85" stroke="#D0D0D0" strokeWidth="1.5" strokeLinecap="round"/>

            {/* 식빵 — 지도 중앙 윗쪽에 얹힌 느낌 */}
            <text
              x="70"
              y="36"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="52"
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
