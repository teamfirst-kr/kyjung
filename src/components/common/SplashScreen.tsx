import { useEffect, useState } from 'react';
import './SplashScreen.css';

const BREADS = ['🥐', '🍞', '🥖', '🧁', '🥯', '🍩', '🥨', '🍪'];

interface FloatingBread {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  size: number;
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

      {/* 중앙 메인 로고 */}
      <div className="splash-content">
        <div className="splash-logo-icon">🍞</div>
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
