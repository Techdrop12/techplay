import Link from '@/components/LocalizedLink'

export default function EmptyWishlist({ locale = 'fr' }) {
  const isFr = String(locale || '').toLowerCase().startsWith('fr')

  return (
    <div className="text-center py-16 text-token-text/70">
      <p className="mb-4">
        {isFr ? 'Votre liste de souhaits est vide.' : 'Your wishlist is empty.'}
      </p>
      <Link
        href="/products"
        prefetch={false}
        className="text-[hsl(var(--accent))] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
      >
        {isFr ? 'Voir les produits' : 'Browse products'}
      </Link>
    </div>
  )
}
