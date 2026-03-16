import type { Locale } from '@/lib/language';

export function toLocale(input: unknown): Locale | undefined {
  if (typeof input !== 'string') return undefined;
  const primary = input.toLowerCase().split(/[-_]/)[0];
  return /^[a-z]{2}$/.test(primary) ? (primary as Locale) : undefined;
}
