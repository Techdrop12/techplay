// src/lib/utils.ts
// Petit utilitaire central : ré-export du formatPrice + helpers courants

export { formatPrice } from './formatPrice';

/** Fusion de classes (supporte string et objets { 'class': condition }) */
export function cn(
  ...inputs: Array<
    | string
    | null
    | false
    | undefined
    | Record<string, boolean | undefined | null>
  >
): string {
  const out: string[] = [];
  for (const i of inputs) {
    if (!i) continue;
    if (typeof i === 'string') {
      if (i) out.push(i);
    } else {
      for (const [k, v] of Object.entries(i)) {
        if (v) out.push(k);
      }
    }
  }
  return out.join(' ');
}

/** Arrondi financier à 2 décimales (évite les flottants sales) */
export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Clamp utilitaire */
export const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));
