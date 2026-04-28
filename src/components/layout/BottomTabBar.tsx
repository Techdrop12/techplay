'use client';

import { memo, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from '@/components/LocalizedLink';
import { useCart } from '@/hooks/useCart';
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing';

type CartItemLike = { quantity?: number };
type CartCollection =
  | CartItemLike[]
  | { items?: CartItemLike[]; count?: number; size?: number }
  | null
  | undefined;
type CartStoreLike = { cart?: CartCollection };

function getQty(item: unknown): number {
  if (typeof item !== 'object' || item === null) return 1;
  const q = Number((item as CartItemLike).quantity);
  return Number.isFinite(q) && q > 0 ? q : 1;
}

const STR = {
  fr: { home: 'Accueil', shop: 'Boutique', cart: 'Panier', account: 'Compte' },
  en: { home: 'Home', shop: 'Shop', cart: 'Cart', account: 'Account' },
} as const;

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
    />
  </svg>
);

const ShopIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm0 10c-1.66 0-3-1.34-3-3h2c0 .55.45 1 1 1s1-.45 1-1h2c0 1.66-1.34 3-3 3z"
    />
  </svg>
);

const CartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM6 5h14l-1.5 8.5a2 2 0 0 1-2 1.6H9a2 2 0 0 1-2-1.6L5.3 3H2V1h4a2 2 0 0 1 2 1.7L8.3 5Z"
    />
  </svg>
);

const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5Z"
    />
  </svg>
);

function BottomTabBar() {
  const pathname = usePathname() || '/';
  const locale = getCurrentLocale(pathname) === 'en' ? 'en' : 'fr';
  const t = STR[locale];
  const L = (path: string) => localizePath(path, locale);

  const cartStore = useCart() as CartStoreLike;
  const cart = cartStore?.cart;

  const cartCount = useMemo(() => {
    if (Array.isArray(cart)) return cart.reduce((s, i) => s + getQty(i), 0);
    if (cart && typeof cart === 'object' && Array.isArray(cart.items)) {
      return cart.items.reduce((s, i) => s + getQty(i), 0);
    }
    const n = Number(cart?.count ?? cart?.size ?? 0);
    return Number.isFinite(n) ? n : 0;
  }, [cart]);

  const isActive = (href: string) => {
    const loc = L(href);
    if (href === '/') return pathname === loc || pathname === '/' || pathname === `/${locale}`;
    return pathname === loc || pathname.startsWith(`${loc}/`);
  };

  const tabs = [
    { href: '/', label: t.home, Icon: HomeIcon, badge: 0 },
    { href: '/products', label: t.shop, Icon: ShopIcon, badge: 0 },
    { href: '/commande', label: t.cart, Icon: CartIcon, badge: cartCount },
    { href: '/account', label: t.account, Icon: UserIcon, badge: 0 },
  ] as const;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-[70] lg:hidden"
      aria-label={locale === 'fr' ? 'Navigation principale' : 'Main navigation'}
    >
      <div className="border-t border-[hsl(var(--border))]/50 bg-[hsl(var(--surface))]/96 shadow-[0_-4px_24px_rgba(0,0,0,0.10)] backdrop-blur-xl">
        <div className="flex h-[3.75rem] items-stretch">
          {tabs.map(({ href, label, Icon, badge }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-label={badge > 0 ? `${label} (${badge})` : label}
                aria-current={active ? 'page' : undefined}
                className={[
                  'relative flex flex-1 flex-col items-center justify-center gap-1',
                  'transition-all duration-150 focus:outline-none focus-visible:bg-[hsl(var(--accent))]/10',
                  active
                    ? 'text-[hsl(var(--accent))]'
                    : 'text-token-text/45 active:scale-90 active:text-token-text/70',
                ].join(' ')}
              >
                <span className="relative">
                  <Icon />
                  {badge > 0 ? (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-2.5 -top-2 flex min-w-[1.1rem] items-center justify-center rounded-full bg-[hsl(var(--accent))] px-[0.28rem] py-0.5 text-[10px] font-bold tabular-nums leading-none text-white shadow-sm"
                    >
                      {badge > 99 ? '99+' : badge}
                    </span>
                  ) : null}
                </span>

                <span
                  className={[
                    'text-[11px] leading-tight tracking-normal',
                    active ? 'font-semibold' : 'font-medium',
                  ].join(' ')}
                >
                  {label}
                </span>

                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-1/2 h-[2.5px] w-8 -translate-x-1/2 rounded-t-full bg-[hsl(var(--accent))]"
                  />
                ) : null}
              </Link>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </nav>
  );
}

export default memo(BottomTabBar);
