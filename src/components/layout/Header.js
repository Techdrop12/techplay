'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isActive = (href) => pathname === href;

  return (
    <header className="bg-white dark:bg-gray-950 shadow sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="font-bold text-lg text-blue-600">TechPlay</Link>
        <nav className="space-x-4">
          <Link href="/fr" className={isActive('/fr') ? 'font-semibold underline' : ''}>Accueil</Link>
          <Link href="/fr/wishlist" className={isActive('/fr/wishlist') ? 'font-semibold underline' : ''}>Wishlist</Link>
          <Link href="/fr/panier" className={isActive('/fr/panier') ? 'font-semibold underline' : ''}>Panier</Link>
        </nav>
      </div>
    </header>
  );
}
