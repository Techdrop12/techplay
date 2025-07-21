export function formatPrice(price: number): string {
  return price.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  });
}

/**
 * Fusionne des classes conditionnelles (utile pour Tailwind).
 * @example cn('text-lg', condition && 'text-red-500') → 'text-lg text-red-500'
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
