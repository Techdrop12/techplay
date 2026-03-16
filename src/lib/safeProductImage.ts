/**
 * Fallback URL for product images when the source is broken (e.g. fakestoreapi.com 404).
 * Used to avoid runtime image errors from deprecated external APIs.
 */
const FALLBACK_PRODUCT_IMAGE = '/og-image.jpg';

/**
 * Returns a safe image URL for product images. Replaces known broken or deprecated
 * remote URLs (e.g. fakestoreapi.com) with a local fallback to avoid 404s.
 */
export function safeProductImageUrl(url: string | undefined): string {
  if (typeof url !== 'string' || !url.trim()) return FALLBACK_PRODUCT_IMAGE;
  const trimmed = url.trim();
  if (/fakestoreapi\.com/i.test(trimmed)) return FALLBACK_PRODUCT_IMAGE;
  return trimmed;
}
