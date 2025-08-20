// src/lib/utils.ts
// Utilitaires centraux : formatPrice + helpers classes/nombres

export { formatPrice } from './formatPrice';

/** Types d’entrées acceptés par cn() */
type ClassInput =
  | string
  | number
  | null
  | false
  | undefined
  | Record<string, boolean | null | undefined>
  | ClassInput[];

/** Fusion de classes Tailwind (string, objets conditionnels, tableaux imbriqués) */
export function cn(...inputs: ClassInput[]): string {
  const out: string[] = [];

  const push = (val: unknown) => {
    if (!val) return;
    if (typeof val === 'string' || typeof val === 'number') {
      const s = String(val).trim();
      if (s) out.push(s);
    } else if (Array.isArray(val)) {
      for (const v of val) push(v);
    } else if (typeof val === 'object') {
      for (const [k, v] of Object.entries(val as Record<string, any>)) {
        if (v) out.push(k);
      }
    }
  };

  for (const i of inputs) push(i);

  // Nettoyage des espaces multiples et déduplication simple
  const tokens = out.join(' ').trim().split(/\s+/);
  return Array.from(new Set(tokens)).join(' ');
}

/** Arrondi financier à 2 décimales (évite les flottants) */
export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Clamp utilitaire */
export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

/** Alias pratique si tu aimes `cx` */
export const cx = cn;
