// ✅ src/components/FreeShippingBadge.js

export default function FreeShippingBadge({ price, locale = 'fr' }) {
  const threshold = 50; // exemple
  if (price < threshold) return null;

  return (
    <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold shadow">
      {locale === 'fr'
        ? 'Livraison gratuite'
        : 'Free Shipping'}
    </span>
  );
}
