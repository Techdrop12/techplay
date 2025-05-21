'use client';

import Link from 'next/link';
import { useCart } from '../context/cartContext';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslations } from 'next-intl';

export default function Header() {
  const { cart } = useCart();
  const t = useTranslations(); // Par défaut, on peut utiliser les clés globales
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-black text-white">
      <div className="flex items-center justify-between w-full sm:w-auto">
        <Link href="/">
          <img src="/logo.png" alt="TechPlay logo" className="h-10" />
        </Link>
        <div className="sm:hidden mt-2">
          <LanguageSwitcher />
        </div>
      </div>

      <nav className="flex items-center space-x-4 mt-4 sm:mt-0">
        {/* Panier */}
        <Link href="/panier" className="relative">
          🛒
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full px-1">
              {totalItems}
            </span>
          )}
        </Link>

        {/* Wishlist */}
        <Link href="/wishlist" className="hover:underline text-sm text-white">
          💖 {t('home.your_cart')}
        </Link>

        {/* Admin */}
        <Link href="/admin" className="text-sm text-white hover:underline">
          {t('admin.dashboard')}
        </Link>

        {/* Langue */}
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>
      </nav>
    </header>
  );
}
