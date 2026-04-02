import { useEffect, useState } from 'react';
import './SplashScreen.css';

const BREADS = ['🥐', '🍞', '🥖', '🧁', '🍰', '🥯', '🥨', '🍩', '🥮', '🍪', '🎂', '🧇'];

interface BreadItem {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  size: number;
}

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);

  const breads: BreadItem[] = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    emoji: BREADS[i % BREADS.length],
    left: 5 + (i * 4.7) % 90,
    delay: Math.random() * 1.2,
    size: 24 + Math.random() * 20,
  }));

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
      <div className="splash-breads">
        {breads.map(b => (
          <span
            key={b.id}
            className="splash-bread"
            style={{
              left: `${b.left}%`,
              animationDelay: `${b.delay}s`,
              fontSize: `${b.size}px`,
            }}
          >
            {b.emoji}
          </span>
        ))}
      </div>
      <div className="splash-content">
        {/* 지도 핀 아이콘 */}
        <div className="splash-logo-icon">
          <svg viewBox="0 0 80 96" width="96" height="116" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 핀 몸통 */}
            <ellipse cx="40" cy="38" rx="30" ry="30" fill="#D4956A"/>
            <ellipse cx="40" cy="38" rx="30" ry="30" fill="url(#pin-grad)" />
            {/* 핀 꼬리 */}
            <path d="M40 68 L28 52 Q40 76 52 52 Z" fill="#C47D52"/>
            {/* 내부 흰 원 */}
            <circle cx="40" cy="38" r="18" fill="white" fillOpacity="0.92"/>
            {/* 빵 이모지 자리 - 작은 빵 아이콘 */}
            <text x="40" y="47" textAnchor="middle" fontSize="22">🍞</text>
            <defs>
              <radialGradient id="pin-grad" cx="40%" cy="35%" r="60%" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#E8A87C"/>
                <stop offset="100%" stopColor="#B8622A"/>
              </radialGradient>
            </defs>
          </svg>
        </div>
        <h1 className="splash-title">
          <span className="splash-char" style={{ animationDelay: '0.3s' }}>빵</span>
          <span className="splash-space"> </span>
          <span className="splash-char" style={{ animationDelay: '0.6s' }}>맵</span>
        </h1>
        <p className="splash-tagline">내 주변 맛있는 빵집을 찾아보세요</p>
      </div>
    </div>
  );
}
