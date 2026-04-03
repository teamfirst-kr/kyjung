import { useRef, useEffect } from 'react';
import GoogleAdSense from './GoogleAdSense';
import './BottomAdBanner.css';

export default function BottomAdBanner() {
  const outerRef = useRef<HTMLDivElement>(null);

  // AdSense JS가 외부 컨테이너 height를 수정하면 강제 복원
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const observer = new MutationObserver(() => {
      if (el.style.height !== '58px') el.style.height = '58px';
      if (el.style.overflow !== 'hidden') el.style.overflow = 'hidden';
      if (el.style.maxHeight) el.style.maxHeight = '';
    });
    observer.observe(el, { attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={outerRef} className="bottom-ad-outer">
      <div className="bottom-ad-banner">
        <div className="bottom-ad-content">
          <span className="bottom-ad-label">AD</span>
          <div className="bottom-ad-slot">
            <GoogleAdSense
              slot="7074985940"
              format="horizontal"
              style={{ width: '100%', maxWidth: 728, height: 50 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
