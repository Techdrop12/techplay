// ✅ /src/lib/abTestVariants.js (logique attribution variant A/B universel, stable SSR/CSR)
export function getUserVariant() {
  if (typeof window !== 'undefined') {
    let variant = localStorage.getItem('ab_variant');
    if (!variant) {
      variant = Math.random() < 0.5 ? 'A' : 'B';
      localStorage.setItem('ab_variant', variant);
    }
    return variant;
  }
  // fallback SSR : tire au hasard, mais côté serveur, ne persiste pas
  return Math.random() < 0.5 ? 'A' : 'B';
}
