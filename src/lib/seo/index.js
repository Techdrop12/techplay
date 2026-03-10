export { default as SEOHead } from '@/components/SEOHead'
export { default as OGMetaTags } from '@/components/seo/OGMetaTags'
export {
  seoMonitor,
  logSeoEvent,
  reportSEOIssue,
} from './seoMonitor'
export { default as useBreadcrumbSegments } from '@/lib/useBreadcrumbSegments'
export { getFallbackDescription, defaultMeta } from '@/lib/meta'