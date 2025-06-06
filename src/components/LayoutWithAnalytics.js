// File: src/components/LayoutWithAnalytics.js
'use client';

import { useEffect } from 'react';
import AnalyticsScripts from '@/components/AnalyticsScripts';

/**
 * Ce composant client est placé dans `src/app/[locale]/layout.js` et exécute 
 * automatiquement vos scripts d’analyse ou de taggage.
 */
export default function LayoutWithAnalytics({ children }) {
  useEffect(() => {
    // Lancez ici vos scripts (Google Analytics, Hotjar, etc.)
    AnalyticsScripts();
  }, []);

  return <>{children}</>;
}
