import { useState, useEffect } from 'react';
import { mockAds } from '../../mock/ads';
import AdBanner from './AdBanner';
import { useFilterContext } from '../../context/FilterContext';

export default function TopBanner() {
  const topAds = mockAds.filter(a => a.type === 'top');
  const [index, setIndex] = useState(0);
  const { mapZoom } = useFilterContext();

  useEffect(() => {
    if (topAds.length <= 1) return;
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % topAds.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [topAds.length]);

  if (topAds.length === 0) return null;
  if (mapZoom <= 12) return null;

  return <AdBanner ad={topAds[index]} variant="top" />;
}
