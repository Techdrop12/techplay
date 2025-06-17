'use client';

export const getUserVariant = () => {
  if (typeof window === 'undefined') return 'A';

  try {
    const cached = window.localStorage.getItem('ab_variant');
    if (cached) return cached;

    const variants = ['A', 'B', 'C'];
    const assigned = variants[Math.floor(Math.random() * variants.length)];
    window.localStorage.setItem('ab_variant', assigned);
    return assigned;
  } catch (e) {
    console.warn('Erreur abTestVariants:', e);
    return 'A';
  }
};
