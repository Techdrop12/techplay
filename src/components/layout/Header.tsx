import Link from 'next/link'
import MobileNav from './MobileNav'

export default function Header() {
  return (
    <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          TechPlay
        </Link>
        <nav className="hidden md:flex space-x-4 text-sm">
          <Link href="/produit">Produits</Link>
          <Link href="/pack">Packs</Link>
          <Link href="/wishlist">Wishlist</Link>
          <Link href="/commande">Commande</Link>
        </nav>
        <MobileNav />
      </div>
    </header>
  )
}
