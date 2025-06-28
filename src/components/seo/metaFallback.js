// ✅ /src/components/seo/useBreadcrumbSegments.js (générateur segments pour breadcrumb)
export function useBreadcrumbSegments({ locale, category, product, slug }) {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL || '';

  const segments = [
    { label: locale === 'fr' ? 'Accueil' : 'Home', url: `${baseUrl}/${locale}` },
  ];
  if (category) {
    segments.push({
      label: category,
      url: `${baseUrl}/${locale}/categorie/${category}`
    });
  }
  if (product && slug) {
    segments.push({
      label: product,
      url: `${baseUrl}/${locale}/produit/${slug}`
    });
  }
  return segments;
}
