// src/lib/utils.ts
// Petit utilitaire central : ré-export du formatPrice + helpers courants

export { formatPrice } from './formatPrice';

/** Fusion de classes robuste (strings, objets, tableaux) + déduplication */
export function cn(
  ...inputs: Array<
    | string
    | null
    | false
    | undefined
    | Record<string, boolean | undefined | null>
    | Array<string | null | false | undefined>
  >
): string {
  const out = new Set<string>();
  const push = (v?: string | null | false) => { if (v) out.add(v) };

  for (const i of inputs) {
    if (!i) continue;

    if (typeof i === 'string') {
      push(i);
    } else if (Array.isArray(i)) {
      for (const s of i) push(typeof s === 'string' ? s : null);
    } else {
      for (const [k, v] of Object.entries(i)) if (v) push(k);
    }
  }
  return Array.from(out).join(' ');
}

/** Arrondi financier à 2 décimales (évite les flottants sales) */
export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Clamp utilitaire */
export const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));
