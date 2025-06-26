// ✅ src/lib/abTestVariants.js

export function getUserVariant() {
  if (typeof window === 'undefined') return 'A';
  let variant = localStorage.getItem('ab_variant');
  if (!variant) {
    variant = Math.random() < 0.5 ? 'A' : 'B';
    localStorage.setItem('ab_variant', variant);
  }
  return variant;
}
