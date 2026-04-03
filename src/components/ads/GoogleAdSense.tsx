import { useEffect, useRef } from 'react';

interface Props {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  style?: React.CSSProperties;
  className?: string;
}

const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT_ID as string;
const isAdSenseConfigured = !!ADSENSE_CLIENT && ADSENSE_CLIENT !== 'ca-pub-your-adsense-id';

/**
 * Google AdSense 광고 컴포넌트
 * VITE_ADSENSE_CLIENT_ID 환경변수 설정 시 실제 광고 표시
 * 미설정 시 플레이스홀더 표시
 */
export default function GoogleAdSense({ slot, format = 'auto', style, className }: Props) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!isAdSenseConfigured || !slot || pushed.current) return;
    if (!adRef.current || adRef.current.getAttribute('data-adsbygoogle-status')) return;
    pushed.current = true;
    try {
      ((window as unknown as Record<string, unknown>).adsbygoogle =
        (window as unknown as Record<string, unknown>).adsbygoogle || []) as unknown[];
      ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle).push({});
    } catch (e) {
      console.warn('AdSense init error:', e);
    }
  }, [slot]);

  if (!isAdSenseConfigured) {
    // VITE_ADSENSE_CLIENT_ID 미설정: 개발 플레이스홀더
    return (
      <div
        className={`adsense-placeholder-box ${className || ''}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8f8f8',
          border: '2px dashed #ddd',
          borderRadius: '8px',
          padding: '12px',
          color: '#bbb',
          fontSize: '11px',
          gap: '4px',
          ...style,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M9 9l3 3-3 3"/><line x1="15" y1="9" x2="15" y2="15"/>
        </svg>
        <span>Google AdSense</span>
        <span style={{ fontSize: '9px' }}>VITE_ADSENSE_CLIENT_ID 설정 필요</span>
      </div>
    );
  }

  // client ID 있음 — slot 있으면 수동 광고 단위, 없으면 자동 광고(Auto Ads)
  return (
    <ins
      ref={adRef}
      className={`adsbygoogle ${className || ''}`}
      style={{ display: 'block', ...style }}
      data-ad-client={ADSENSE_CLIENT}
      {...(slot ? {
        'data-ad-slot': slot,
        'data-ad-format': format,
        ...(format === 'auto' ? { 'data-full-width-responsive': 'true' } : {}),
      } : {})}
    />
  );
}
