// ✅ /src/components/seo/index.js — point d'entrée SEO (compat)
// Utilise les modules unifiés (TS) et conserve SeoMonitor si tu l'emploies.

export { default as SEOHead } from '@/components/SEOHead'
export { getFallbackDescription, defaultMeta } from '@/lib/meta'

// Garde ce composant si tu l'utilises encore, sinon on le supprimera plus tard.
export { default as SeoMonitor } from './SeoMonitor'

// Compat: on laisse OGMetaTags qui wrap SEOHead (à migrer puis supprimer)
export { default as OGMetaTags } from './OGMetaTags'

// ⚠️ Le hook sera unifié en Grappe C (i18n). En attendant, utilise la version lib.
export { default as useBreadcrumbSegments } from '@/lib/useBreadcrumbSegments'
