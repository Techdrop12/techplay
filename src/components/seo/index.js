export { default as SEOHead } from '@/components/SEOHead'
export { default as OGMetaTags } from './OGMetaTags'
export {
  seoMonitor as SeoMonitor,
  seoMonitor,
  logSeoEvent,
  reportSEOIssue,
} from '@/lib/seo/seoMonitor'
export { getFallbackDescription, defaultMeta } from '@/lib/meta'
export { default as useBreadcrumbSegments } from '@/lib/useBreadcrumbSegments'