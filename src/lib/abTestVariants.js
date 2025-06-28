'use client';

export function getUserVariant() {
  if (typeof window === 'undefined') {
    // En SSR, ne peut pas accéder au localStorage → fallback pseudo-aléatoire (non persistant)
    return Math.random() < 0.5 ? 'A' : 'B';
  }

  try {
    let variant = localStorage.getItem('ab_variant');

    if (!variant || !['A', 'B', 'C'].includes(variant)) {
      const variants = ['A', 'B']; // ajoute 'C' si nécessaire
      variant = variants[Math.floor(Math.random() * variants.length)];
      localStorage.setItem('ab_variant', variant);
    }

    return variant;
  } catch (e) {
    console.warn('Erreur attribution AB test :', e);
    return 'A'; // fallback de sécurité
  }
}
