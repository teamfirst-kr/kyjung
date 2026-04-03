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

  // seeded pseudo-random: 무작위 느낌 + 리렌더링 안정
  const [breads] = useState<BreadItem[]>(() => {
    let seed = 42;
    const rand = () => { seed = (seed * 16807 + 11) % 2147483647; return (seed & 0x7fffffff) / 0x7fffffff; };
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      emoji: BREADS[i % BREADS.length],
      left: 3 + rand() * 90,
      delay: rand() * 1.2,
      size: 22 + rand() * 22,
    }));
  });

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
        <div className="splash-logo-icon">🍞</div>
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
