// ✅ src/components/A/BTestBanner.js

'use client';

import { useEffect, useState } from 'react';
import { logEvent } from '@/lib/logEvent';

export default function ABTestBanner({ variantA, variantB }) {
  const [variant, setVariant] = useState('A');

  useEffect(() => {
    let v = localStorage.getItem('ab_variant');
    if (!v) {
      v = Math.random() < 0.5 ? 'A' : 'B';
      localStorage.setItem('ab_variant', v);
    }
    setVariant(v);
    logEvent('ab_banner_view', { variant: v });
  }, []);

  return (
    <div className="my-3">
      {variant === 'A' ? variantA : variantB}
    </div>
  );
}
