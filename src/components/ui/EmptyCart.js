import Link from 'next/link';

export default function EmptyCart({ locale = 'fr' }) {
  return (
    <div className="text-center py-16 text-gray-500">
      <p className="mb-4">
        {locale === 'fr' ? 'Votre panier est vide.' : 'Your cart is empty.'}
      </p>
      <Link
        href={`/${locale}`}
        className="text-blue-600 hover:underline"
      >
        {locale === 'fr' ? 'Voir les produits' : 'Browse products'}
      </Link>
    </div>
  );
}
