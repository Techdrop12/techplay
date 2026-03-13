// ✅ /src/components/seo/index.ts — point d'entrée SEO (compat)
export { default as SEOHead } from '@/components/SEOHead';
export { getFallbackDescription, defaultMeta } from '@/lib/meta';
export { default as SeoMonitor } from './SeoMonitor';
export { default as OGMetaTags } from './OGMetaTags';
export { default as useBreadcrumbSegments } from '@/lib/useBreadcrumbSegments';
