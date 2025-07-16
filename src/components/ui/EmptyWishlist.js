import Link from 'next/link';

export default function EmptyWishlist({ locale = 'fr' }) {
  return (
    <div className="text-center py-16 text-gray-500">
      <p className="mb-4">
        {locale === 'fr' ? 'Votre liste de souhaits est vide.' : 'Your wishlist is empty.'}
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
