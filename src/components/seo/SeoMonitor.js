// ✅ /src/components/seo/SeoMonitor.js (bonus SEO audit)
'use client';

import { useEffect } from 'react';

export default function SeoMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Simple audit de présence des balises title/desc/h1
    const hasTitle = !!document.title;
    const hasDesc = !!document.querySelector('meta[name="description"]');
    const hasH1 = !!document.querySelector('h1');
    if (!hasTitle || !hasDesc || !hasH1) {
      // eslint-disable-next-line no-console
      console.warn('SEO: balise manquante', { hasTitle, hasDesc, hasH1 });
    }
  }, []);
  return null;
}
