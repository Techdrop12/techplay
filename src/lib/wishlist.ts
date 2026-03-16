// src/lib/wishlist.ts
import { UI } from './constants';

const STORAGE_KEY = 'wishlist';
const MAX_ITEMS = UI.WISHLIST_LIMIT;

type WishlistRecord = { id: string } & Record<string, unknown>;

const isBrowser = () => typeof window !== 'undefined';

function normalizeId(idLike: unknown): string {
  return String(idLike ?? '').trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getRecordId(value: unknown): string {
  if (!isRecord(value)) return '';
  return normalizeId(value.id ?? value._id);
}

function toCanonical(product: unknown): WishlistRecord | null {
  if (!isRecord(product)) return null;
  const id = getRecordId(product);
  if (!id) return null;
  return { ...product, id };
}

export function getWishlist(): WishlistRecord[] {
  if (!isBrowser()) return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    const raw = Array.isArray(parsed) ? parsed : [];

    const seen = new Set<string>();
    const out: WishlistRecord[] = [];

    for (const item of raw) {
      const canonical = toCanonical(item);
      if (!canonical) continue;
      if (seen.has(canonical.id)) continue;

      seen.add(canonical.id);
      out.push(canonical);

      if (out.length >= MAX_ITEMS) break;
    }

    return out;
  } catch {
    return [];
  }
}

export function isInWishlist(productId: string): boolean {
  if (!isBrowser()) return false;

  const cid = normalizeId(productId);
  if (!cid) return false;

  return getWishlist().some((item) => getRecordId(item) === cid);
}

export function toggleWishlistItem(product: unknown): void {
  if (!isBrowser()) return;

  const canonical = toCanonical(product);
  if (!canonical) return;

  try {
    let list = getWishlist();
    const exists = list.some((item) => getRecordId(item) === canonical.id);

    if (exists) {
      list = list.filter((item) => getRecordId(item) !== canonical.id);
    } else {
      list = [canonical, ...list].slice(0, MAX_ITEMS);
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: list }));
  } catch {}
}
