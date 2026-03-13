import { log } from '@/lib/logger';

export function seoMonitor({ page, locale }: { page: string; locale: string }): void {
  if (process.env.NODE_ENV !== 'production') return;
  log(`[SEO] ${locale.toUpperCase()} → ${page}`);
}
export default seoMonitor;
