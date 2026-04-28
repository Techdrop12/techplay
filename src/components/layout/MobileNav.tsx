'use client';

/* eslint-disable react-hooks/exhaustive-deps */

import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { startTransition, useEffect, useId, useMemo, useReducer, useRef } from 'react';
import * as ReactDOM from 'react-dom';

import { useTranslations } from 'next-intl';

import Link from '@/components/LocalizedLink';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { getCategories } from '@/lib/categories';
import { event as gaEvent } from '@/lib/ga';
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing';

// Suggestions de recherche par locale (exemples produits, pas des chaînes traduisibles)
const TRENDS = {
  fr: ['écouteurs bluetooth', 'casque gaming', 'chargeur rapide USB-C', 'pack starter', 'power bank', 'souris sans fil'],
  en: ['bluetooth earbuds', 'gaming headset', 'USB-C fast charger', 'starter pack', 'power bank', 'wireless mouse'],
} as const;

export type MobileNavUi = {
  openMenu: string;
  closeMenu: string;
  menu: string;
  searchAria: string;
  searchBtn: string;
  placeholderPrefix: string;
  recent: string;
  clear: string;
  categories: string;
  wishlist: (n: number) => string;
  account: string;
  cart: (n: number) => string;
  installApp: string;
  installAppTitle: string;
  mobileNavAria: string;
  shopLabel: string;
  quickAccessLabel: string;
};

export type MobileNavItem = { href: string; label: string };

const Icon = {
  Menu: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" />
    </svg>
  ),
  Close: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4Z"
      />
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5-5-5ZM10 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"
      />
    </svg>
  ),
  Heart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 21s-7-4.6-9.3-8.3C1.3 9.9 3 6 6.9 6c2.2 0 3.4 1.2 4.1 2 0.7-0.8 1.9-2 4.1-2C19 6 20.7 9.9 21.3 12.7 19 16.4 12 21 12 21z"
      />
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5Z"
      />
    </svg>
  ),
  Cart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM6 5h14l-1.5 8.5a2 2 0 0 1-2 1.6H9a2 2 0 0 1-2-1.6L5.3 3H2V1h4a2 2 0 0 1 2 1.7L8.3 5Z"
      />
    </svg>
  ),
  Chevron: ({ open = false }: { open?: boolean }) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <path fill="currentColor" d="M12 15.5 4.5 8 6 6.5l6 6 6-6L19.5 8 12 15.5z" />
    </svg>
  ),
  Flame: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2s5 4 5 9a5 5 0 1 1-10 0c0-2 1-4 3-6-1 3 2 4 2 6 0 1.7-1 3-2.5 3.5A4.5 4.5 0 0 0 16.5 9C16.5 5.5 12 2 12 2Z"
      />
    </svg>
  ),
  Download: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 3v9l3.5-3.5 1.4 1.4L12 15.8 7.1 9.9l1.4-1.4L12 12V3Zm-7 16h14v2H5v-2Z"
      />
    </svg>
  ),
};

const NavIcon = {
  Products: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  Builder: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  Grid: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  Wishlist: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Blog: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  Contact: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  ),
};

const NAV_ICON_MAP = {
  '/products': NavIcon.Products,
  '/#builder': NavIcon.Builder,
  '/categorie': NavIcon.Grid,
  '/wishlist': NavIcon.Wishlist,
  '/blog': NavIcon.Blog,
  '/contact': NavIcon.Contact,
};

type CartItemLike = { quantity?: number };
type CartCollection =
  | CartItemLike[]
  | { items?: CartItemLike[]; count?: number; size?: number }
  | null
  | undefined;
type WishlistCollection =
  | unknown[]
  | { items?: unknown[]; count?: number; size?: number }
  | null
  | undefined;
type CartStoreLike = { cart?: CartCollection };
type WishlistStoreLike = { wishlist?: WishlistCollection };

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

type InertHTMLElement = HTMLElement & { inert?: boolean };

const PLACEHOLDER_MS = 4000;

type NavState = {
  open: boolean;
  catsOpen: boolean;
  placeholder: string;
  searchFocused: boolean;
  recentQs: string[];
  canInstall: boolean;
  portalMounted: boolean;
  searching: boolean;
};

type NavAction =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'TOGGLE_CATS' }
  | { type: 'SET_CATS'; payload: boolean }
  | { type: 'SET_PLACEHOLDER'; payload: string }
  | { type: 'SET_SEARCH_FOCUSED'; payload: boolean }
  | { type: 'SET_RECENT_QS'; payload: string[] }
  | { type: 'SET_CAN_INSTALL'; payload: boolean }
  | { type: 'PORTAL_MOUNTED' }
  | { type: 'SET_SEARCHING'; payload: boolean };

function navReducer(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case 'OPEN':
      return { ...state, open: true, portalMounted: true };
    case 'CLOSE':
      return { ...state, open: false, catsOpen: false, searching: false };
    case 'TOGGLE_CATS':
      return { ...state, catsOpen: !state.catsOpen };
    case 'SET_CATS':
      return { ...state, catsOpen: action.payload };
    case 'SET_PLACEHOLDER':
      return { ...state, placeholder: action.payload };
    case 'SET_SEARCH_FOCUSED':
      return { ...state, searchFocused: action.payload };
    case 'SET_RECENT_QS':
      return { ...state, recentQs: action.payload };
    case 'SET_CAN_INSTALL':
      return { ...state, canInstall: action.payload };
    case 'PORTAL_MOUNTED':
      return { ...state, portalMounted: true };
    case 'SET_SEARCHING':
      return { ...state, searching: action.payload };
    default:
      return state;
  }
}

const safeParseArray = <T,>(raw: string | null): T[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
};

const norm = (value: string) => value.trim().replace(/\s+/g, ' ');
const same = (a: string, b: string) => a.toLocaleLowerCase() === b.toLocaleLowerCase();

function getQuantity(item: unknown): number {
  if (typeof item !== 'object' || item === null) return 1;
  const quantity = Number((item as CartItemLike).quantity);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

function track(args: {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: unknown;
}) {
  const { action, category, label, value, ...rest } = args;
  try {
    gaEvent?.({
      action,
      category: category ?? 'navigation',
      label: label ?? action,
      value: value ?? 1,
      ...rest,
    });
  } catch {
    // no-op
  }
}

/* ── Sub-components ─────────────────────────────────────────────────── */

type SearchProps = {
  searchAction: string;
  ui: MobileNavUi;
  trends: readonly string[];
  placeholder: string;
  searching: boolean;
  recentQs: string[];
  searchRef: React.RefObject<HTMLInputElement | null>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onSearch: (q: string) => void;
  onClearRecent: () => void;
  onFocusSearch: () => void;
  onBlurSearch: () => void;
};

function MobileNavSearch({
  searchAction, ui, trends, placeholder, searching, recentQs,
  searchRef, onSubmit, onSearch, onClearRecent, onFocusSearch, onBlurSearch,
}: SearchProps) {
  return (
    <>
      <form
        action={searchAction}
        method="get"
        role="search"
        aria-label={ui.searchAria}
        onSubmit={onSubmit}
        className="px-5 pb-4 pt-4"
      >
        <div className="relative">
          <input
            ref={searchRef}
            type="search"
            name="q"
            placeholder={`${ui.placeholderPrefix} ${placeholder}`}
            list="mobile-search-suggestions"
            className="min-h-[3rem] w-full rounded-2xl border border-[hsl(var(--border))]/60 bg-[hsl(var(--surface))]/95 px-4 py-2.5 pr-12 text-[16px] sm:text-[15px] placeholder:text-token-text/55 shadow-sm focus:border-[hsl(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/.26)]"
            autoComplete="off"
            enterKeyHint="search"
            inputMode="search"
            aria-keyshortcuts="/ Control+K Meta+K"
            onFocus={onFocusSearch}
            onBlur={onBlurSearch}
          />
          <datalist id="mobile-search-suggestions">
            {trends.map((item) => <option value={item} key={item} />)}
          </datalist>
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--accent))]/6 text-token-text/80 hover:bg-[hsl(var(--accent))]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))/0.4]"
            aria-label={ui.searchBtn}
            aria-busy={searching ? 'true' : 'false'}
            title={ui.searchBtn}
          >
            {searching ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" fill="none" />
                <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
              </svg>
            ) : (
              <Icon.Search />
            )}
          </button>
        </div>
      </form>

      {recentQs.length > 0 ? (
        <div className="px-5 pb-4 pt-1.5">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-token-text/60">
            {ui.recent}
          </div>
          <div className="flex flex-wrap gap-2">
            {recentQs.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => onSearch(q)}
                className="focus-ring min-h-[2.5rem] rounded-full border border-[hsl(var(--border))]/60 bg-[hsl(var(--surface))]/95 px-3.5 py-1.5 text-[13px] hover:bg-[hsl(var(--surface-2))]/80"
                aria-label={`${ui.searchBtn}: ${q}`}
              >
                {q.length > 26 ? `${q.slice(0, 24)}…` : q}
              </button>
            ))}
            <button
              type="button"
              onClick={onClearRecent}
              className="focus-ring min-h-[2.5rem] rounded-full bg-[hsl(var(--surface))]/70 px-3.5 py-1.5 text-[12px] text-token-text/70 hover:bg-[hsl(var(--surface-2))]/80"
              aria-label={ui.clear}
            >
              {ui.clear}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

type QuickAccessProps = {
  ui: MobileNavUi;
  wishlistCount: number;
  canInstall: boolean;
  locale: string;
  onClose: (reason: string) => void;
  onInstall: () => Promise<void>;
  prefetch: (href: string) => void;
};

function MobileNavQuickAccess({
  ui, wishlistCount, canInstall, locale, onClose, onInstall, prefetch,
}: QuickAccessProps) {
  return (
    <section
      className="border-t border-[hsl(var(--border))]/40 bg-[hsl(var(--surface))]/92 px-5 py-4"
      aria-label={ui.quickAccessLabel}
    >
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-token-text/60">
        {ui.quickAccessLabel}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <ThemeToggle size="md" />
        <Link
          href="/wishlist"
          onPointerDown={() => { prefetch('/wishlist'); onClose('quick_wishlist'); }}
          onFocus={() => prefetch('/wishlist')}
          onClick={() => { track({ action: 'mobile_nav_quick_wishlist' }); onClose('quick_wishlist'); }}
          className="focus-ring inline-flex min-h-[2.5rem] items-center gap-2 rounded-xl border border-[hsl(var(--border))]/60 bg-[hsl(var(--surface))]/95 px-3.5 py-2 text-[13px] font-medium transition active:scale-[0.97] hover:bg-[hsl(var(--surface-2))]/80"
          aria-label={ui.wishlist(wishlistCount)}
        >
          <Icon.Heart />
          <span>{locale === 'fr' ? 'Wishlist' : 'Wishlist'}</span>
          {wishlistCount > 0 ? (
            <span className="rounded-full bg-fuchsia-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
              {wishlistCount}
            </span>
          ) : null}
        </Link>
        <Link
          href="/account"
          onPointerDown={() => { prefetch('/account'); onClose('quick_account'); }}
          onFocus={() => prefetch('/account')}
          onClick={() => { track({ action: 'mobile_nav_quick_account' }); onClose('quick_account'); }}
          className="focus-ring inline-flex min-h-[2.5rem] items-center gap-2 rounded-xl border border-[hsl(var(--border))]/60 bg-[hsl(var(--surface))]/95 px-3.5 py-2 text-[13px] font-medium transition active:scale-[0.97] hover:bg-[hsl(var(--surface-2))]/80"
          aria-label={ui.account}
        >
          <Icon.User />
          <span>{ui.account}</span>
        </Link>
        {canInstall ? (
          <button
            onClick={() => void onInstall()}
            type="button"
            className="ml-auto inline-flex min-h-[2.5rem] items-center gap-2 rounded-full bg-gradient-to-r from-lime-500 to-emerald-500 px-4 py-2 text-[13px] font-semibold text-white shadow-md transition active:scale-[0.97] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            aria-label={ui.installAppTitle}
            title={ui.installAppTitle}
          >
            <Icon.Download /> {ui.installApp}
          </button>
        ) : null}
      </div>
    </section>
  );
}

type NavLinksProps = {
  nav: readonly MobileNavItem[];
  ui: MobileNavUi;
  categories: ReturnType<typeof getCategories>;
  locale: string;
  catsOpen: boolean;
  catsPanelId: string;
  reducedMotion: boolean | null;
  isActive: (href: string) => boolean;
  onClose: (reason: string) => void;
  onToggleCats: () => void;
  prefetch: (href: string) => void;
};

function MobileNavLinks({
  nav, ui, categories, catsOpen, catsPanelId, reducedMotion,
  isActive, onClose, onToggleCats, prefetch,
}: NavLinksProps) {
  return (
    <section
      className="border-t border-[hsl(var(--border))]/40 bg-[hsl(var(--surface))]/94 px-5 pt-5 pb-5"
      aria-label={ui.mobileNavAria}
    >
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-token-text/60">
        {ui.shopLabel}
      </p>
      <ul className="grid grid-cols-1 gap-2 text-[15px]">
        {nav.map((item) => {
          const { href, label } = item;
          const promo = ('promo' in item && item.promo === true) || href.includes('promo=1');

          if (href === '/categorie') {
            return (
              <li key={href}>
                <button
                  type="button"
                  onClick={onToggleCats}
                  aria-expanded={catsOpen}
                  aria-controls={catsPanelId}
                  className="focus-ring flex min-h-[2.75rem] w-full items-center gap-3 justify-between rounded-2xl border border-transparent px-4 py-3 text-left transition active:scale-[0.98] hover:bg-[hsl(var(--surface-2))]/80 active:bg-[hsl(var(--surface-2))]/70"
                >
                  <span className="flex items-center gap-3">
                    <span className="shrink-0 text-token-text/55"><NavIcon.Grid /></span>
                    {label}
                  </span>
                  <Icon.Chevron open={catsOpen} />
                </button>
                <AnimatePresence initial={false}>
                  {catsOpen ? (
                    <motion.div
                      id={catsPanelId}
                      role="region"
                      aria-label={ui.categories}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reducedMotion ? 0 : 0.22, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <ul className="mb-1 mt-2 grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:grid-cols-3">
                        {categories.map((category) => (
                          <li key={category.href}>
                            <Link
                              href={category.href}
                              onPointerDown={() => { prefetch(category.href); onClose('cat_click'); }}
                              onFocus={() => prefetch(category.href)}
                              onClick={() => { track({ action: 'mobile_nav_cat', label: category.href }); onClose('cat_click'); }}
                              className="focus-ring group flex min-h-[3rem] items-center gap-3 rounded-2xl border border-[hsl(var(--border))]/35 bg-[hsl(var(--surface))]/92 p-3 shadow-[0_6px_18px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent)/.35)] hover:bg-[hsl(var(--surface-2))]/95 hover:shadow-[0_12px_30px_rgba(15,23,42,0.3)]"
                            >
                              <category.Icon className="opacity-80" />
                              <span className="flex-1">
                                <span className="block text-sm font-semibold">{category.label}</span>
                                <span className="block text-xs text-token-text/60">{category.desc}</span>
                              </span>
                              <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-50 group-hover:opacity-90" aria-hidden="true">
                                <path fill="currentColor" d="M9 18l6-6-6-6v12z" />
                              </svg>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </li>
            );
          }

          const active = isActive(href);
          const NavIconComp = NAV_ICON_MAP[href as keyof typeof NAV_ICON_MAP];

          return (
            <li key={href}>
              <Link
                href={href}
                onPointerDown={() => { prefetch(href); onClose('nav_link'); }}
                onFocus={() => prefetch(href)}
                onClick={() => { track({ action: 'mobile_nav_link_click', label: href }); onClose('nav_link'); }}
                aria-current={active ? 'page' : undefined}
                className={[
                  'focus-ring flex min-h-[2.75rem] items-center gap-3 rounded-2xl px-4 py-3 transition active:scale-[0.98] active:bg-[hsl(var(--surface-2))]/70',
                  promo
                    ? 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 font-semibold text-white shadow-md hover:shadow-lg'
                    : active
                      ? 'border border-[hsl(var(--accent)/.30)] bg-[hsl(var(--accent)/.06)] font-semibold text-[hsl(var(--accent))]'
                      : 'border border-transparent hover:bg-[hsl(var(--surface-2))]/80',
                ].join(' ')}
              >
                {NavIconComp ? (
                  <span className={['shrink-0', active ? 'text-[hsl(var(--accent))]' : promo ? 'text-white/80' : 'text-token-text/50'].join(' ')}>
                    <NavIconComp />
                  </span>
                ) : null}
                {label}
                {promo ? <span className="ml-auto inline-flex align-middle"><Icon.Flame /></span> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */

export default function MobileNav() {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const locale = getCurrentLocale(pathname) === 'en' ? 'en' : 'fr';
  const tRaw = useTranslations('mobile_nav');
  const L = (path: string) => localizePath(path, locale);
  const searchAction = L('/search');

  const trends = TRENDS[locale];

  const ui = useMemo((): MobileNavUi => ({
    openMenu: tRaw('open_menu'),
    closeMenu: tRaw('close_menu'),
    menu: tRaw('menu'),
    searchAria: tRaw('search_aria'),
    searchBtn: tRaw('search_btn'),
    placeholderPrefix: tRaw('placeholder_prefix'),
    recent: tRaw('recent'),
    clear: tRaw('clear'),
    categories: tRaw('categories'),
    wishlist: (n) => n > 0 ? tRaw('wishlist_label_count', { count: n }) : tRaw('wishlist_label'),
    account: tRaw('account'),
    cart: (n) => n > 0 ? tRaw('cart_label_count', { count: n }) : tRaw('cart_label'),
    installApp: tRaw('install_app'),
    installAppTitle: tRaw('install_app_title'),
    mobileNavAria: tRaw('nav_aria'),
    shopLabel: tRaw('shop_label'),
    quickAccessLabel: tRaw('quick_access_label'),
  }), [tRaw]);

  const nav = useMemo((): MobileNavItem[] => [
    { href: '/products', label: tRaw('nav_all_products') },
    { href: '/#builder', label: tRaw('nav_builder') },
    { href: '/categorie', label: tRaw('nav_categories') },
    { href: '/wishlist', label: tRaw('nav_wishlist') },
    { href: '/blog', label: tRaw('nav_blog') },
    { href: '/contact', label: tRaw('nav_contact') },
  ], [tRaw]);

  const categories = useMemo(() => getCategories(locale), [locale]);
  const reducedMotion = useReducedMotion();
  const dialogId = useId();
  const titleId = `${dialogId}-title`;
  const catsPanelId = useId();

  const cartStore = useCart() as CartStoreLike;
  const wishlistStore = useWishlist() as WishlistStoreLike;

  const cart = cartStore?.cart;
  const wishlist = wishlistStore?.wishlist;

  const cartCount = useMemo(() => {
    if (Array.isArray(cart)) {
      return cart.reduce((total, item) => total + getQuantity(item), 0);
    }

    if (cart && typeof cart === 'object' && Array.isArray(cart.items)) {
      return cart.items.reduce((total, item) => total + getQuantity(item), 0);
    }

    const count = Number(cart?.count ?? cart?.size ?? 0);
    return Number.isFinite(count) ? count : 0;
  }, [cart]);

  const wishlistCount = useMemo(() => {
    if (Array.isArray(wishlist)) return wishlist.length;
    if (wishlist && typeof wishlist === 'object' && Array.isArray(wishlist.items)) {
      return wishlist.items.length;
    }

    const count = Number(wishlist?.count ?? wishlist?.size ?? 0);
    return Number.isFinite(count) ? count : 0;
  }, [wishlist]);

  const [state, dispatch] = useReducer(navReducer, {
    open: false,
    catsOpen: false,
    placeholder: TRENDS[locale === 'en' ? 'en' : 'fr'][0] ?? '',
    searchFocused: false,
    recentQs: [],
    canInstall: false,
    portalMounted: false,
    searching: false,
  });

  const { open, catsOpen, placeholder, searchFocused, recentQs, canInstall, portalMounted, searching } = state;

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<InertHTMLElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const savedScrollY = useRef(0);
  const startY = useRef<number | null>(null);

  const overlayTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const };
  const overlayExitTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.14, ease: [0.16, 1, 0.3, 1] as const };

  const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: overlayTransition },
    exit: { opacity: 0, transition: overlayExitTransition },
  };

  const sheetTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.26, ease: [0.16, 1, 0.3, 1] as const };
  const sheetExitTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.18, ease: [0.16, 1, 0.3, 1] as const };

  const sheetVariants: Variants = {
    hidden: {
      y: reducedMotion ? 0 : '12%',
      opacity: reducedMotion ? 1 : 0.6,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: sheetTransition,
    },
    exit: {
      y: reducedMotion ? 0 : '12%',
      opacity: reducedMotion ? 1 : 0.6,
      transition: sheetExitTransition,
    },
  };

  const isActive = (href: string) => {
    if (href === '/categorie') return false;
    const localizedHref = L(href);
    return pathname === localizedHref || pathname.startsWith(`${localizedHref}/`);
  };

  const prefetchOnPointer = (href: string) => {
    try {
      const localizedHref = L(href);
      if (href !== '/categorie' && localizedHref && !isActive(href)) {
        router.prefetch(localizedHref);
      }
    } catch {
      // no-op
    }
  };

  const lockScroll = () => {
    const html = document.documentElement;
    if (html.classList.contains('scroll-locked')) return;

    const scrollY = window.scrollY ?? window.pageYOffset ?? document.documentElement.scrollTop ?? 0;
    savedScrollY.current = scrollY;

    const scrollbarWidth = window.innerWidth - html.clientWidth;

    html.classList.add('scroll-locked');
    html.style.setProperty('--scroll-y', `-${scrollY}px`);
    document.body.style.top = `-${scrollY}px`;
    if (scrollbarWidth > 0) {
      html.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const main = document.getElementById('main') as InertHTMLElement | null;
    if (main) {
      mainRef.current = main;
      try { main.inert = true; } catch { /* no-op */ }
      main.setAttribute('aria-hidden', 'true');
    }
  };

  const unlockScroll = () => {
    const html = document.documentElement;
    if (!html.classList.contains('scroll-locked')) return;

    const scrollY = savedScrollY.current;

    html.classList.remove('scroll-locked');
    html.style.paddingRight = '';
    document.body.style.top = '';
    document.body.style.paddingRight = '';

    if (mainRef.current) {
      try { mainRef.current.inert = false; } catch { /* no-op */ }
      mainRef.current.removeAttribute('aria-hidden');
      mainRef.current = null;
    }

    window.scrollTo(0, scrollY);
  };

  const openedByPointerRef = useRef(false);
  const prevPathnameRef = useRef(pathname);

  const openMenu = (e?: React.PointerEvent | React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === 'pointerdown') {
      openedByPointerRef.current = true;
    }
    if (!e && openedByPointerRef.current) {
      openedByPointerRef.current = false;
      return;
    }
    lockScroll();
    startTransition(() => dispatch({ type: 'OPEN' }));
    try {
      navigator.vibrate?.(8);
    } catch {
      // no-op
    }
    track({ action: 'mobile_nav_open', label: 'hamburger' });
  };

  const closeMenu = (reason = 'close_btn') => {
    unlockScroll();
    startTransition(() => dispatch({ type: 'CLOSE' }));
    track({ action: 'mobile_nav_close', label: reason });
  };

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      const e = event as BeforeInstallPromptEvent;
      e.preventDefault();
      deferredPrompt.current = e;
      dispatch({ type: 'SET_CAN_INSTALL', payload: true });
    };

    const onInstalled = () => dispatch({ type: 'SET_CAN_INSTALL', payload: false });

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  useEffect(() => {
    try {
      const arr = safeParseArray<string>(localStorage.getItem('recent:q'));
      if (arr.length) dispatch({ type: 'SET_RECENT_QS', payload: arr.slice(0, 6) });
    } catch {
      // no-op
    }
  }, []);

  useEffect(() => {
    const localTrends = [...trends];
    dispatch({ type: 'SET_PLACEHOLDER', payload: localTrends[0] ?? '' });

    let index = 0;
    let intervalId: number | null = null;

    const start = () => {
      if (intervalId || searchFocused || document.visibilityState !== 'visible') return;
      intervalId = window.setInterval(() => {
        index = (index + 1) % localTrends.length;
        dispatch({ type: 'SET_PLACEHOLDER', payload: localTrends[index] ?? '' });
      }, PLACEHOLDER_MS);
    };

    const stop = () => {
      if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !searchFocused) start();
      else stop();
    };

    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      stop();
    };
  }, [searchFocused, trends]);

  useEffect(() => {
    const onAltM = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        if (open) closeMenu('alt_m');
        else openMenu();
      }
    };
    window.addEventListener('keydown', onAltM);
    return () => window.removeEventListener('keydown', onAltM);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu('escape');
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'
        );

        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    if (open) {
      lockScroll();
      window.addEventListener('keydown', onKey);
      const isNarrow = typeof window !== 'undefined' && window.innerWidth < 768;
      if (!isNarrow) {
        window.setTimeout(() => {
          searchRef.current?.focus();
        }, 0);
      }
    } else {
      unlockScroll();
      window.removeEventListener('keydown', onKey);
      triggerRef.current?.focus();
    }

    return () => {
      window.removeEventListener('keydown', onKey);
      unlockScroll();
    };
  }, [open]);

  useEffect(() => {
    const prev = prevPathnameRef.current;
    if (prev !== pathname && open) {
      closeMenu('route_change');
    }
    prevPathnameRef.current = pathname;
  }, [pathname, open, closeMenu]);

  const handleInstall = async () => {
    try {
      track({ action: 'pwa_install_click', label: 'mobile_nav' });
      const promptEvent = deferredPrompt.current;
      if (!promptEvent) return;
      await promptEvent.prompt();
      await promptEvent.userChoice;
      deferredPrompt.current = null;
      dispatch({ type: 'SET_CAN_INSTALL', payload: false });
    } catch {
      // no-op
    }
  };

  const pushRecent = (q: string) => {
    const cleaned = norm(q);
    if (!cleaned) return;

    try {
      const arr = safeParseArray<string>(localStorage.getItem('recent:q'));
      const next = [cleaned, ...arr.filter((item) => !same(item, cleaned))].slice(0, 6);
      localStorage.setItem('recent:q', JSON.stringify(next));
      dispatch({ type: 'SET_RECENT_QS', payload: next });
    } catch {
      // no-op
    }
  };

  const onSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const data = new FormData(form);
    const q = norm(String(data.get('q') || ''));

    if (!q) {
      e.preventDefault();
      searchRef.current?.focus();
      return;
    }

    try {
      localStorage.setItem('last:q', q);
    } catch {
      // no-op
    }

    pushRecent(q);
    track({ action: 'search_submit', label: q });
    dispatch({ type: 'SET_SEARCHING', payload: true });
  };

  const goSearch = (q: string) => {
    const cleaned = norm(q);
    if (!cleaned) return;

    pushRecent(cleaned);
    track({ action: 'search_chip_click', label: cleaned });
    closeMenu('search_chip');
    router.push(`${searchAction}?q=${encodeURIComponent(cleaned)}`);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0]?.clientY ?? null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current == null) return;
    const currentY = e.touches[0]?.clientY ?? startY.current;
    const delta = currentY - startY.current;
    if (delta > 70) {
      startY.current = null;
      closeMenu('swipe_down');
    }
  };

  const onTouchEnd = () => {
    startY.current = null;
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => openMenu()}
        onPointerDown={openMenu}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        aria-label={open ? ui.closeMenu : ui.openMenu}
        aria-keyshortcuts="Alt+M"
        className="touch-manipulation grid shrink-0 min-h-[2.75rem] min-w-[2.75rem] place-items-center rounded-xl hover:bg-[hsl(var(--surface))]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 lg:hidden"
        style={{ touchAction: 'manipulation' }}
      >
        <Icon.Menu />
      </button>

      {portalMounted && typeof document !== 'undefined' && document.body
        ? ReactDOM.createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  key="mobile-nav"
                  id={dialogId}
                  ref={dialogRef}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={titleId}
                  className="fixed inset-0 z-[9999] isolate flex min-h-[100dvh] items-end justify-center overscroll-contain sm:items-center"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
            <motion.div
              className="absolute inset-0 z-0 bg-black/55 backdrop-blur-md"
              style={{ top: 0, left: 0, right: 0, bottom: 0, minHeight: '100dvh' }}
              variants={overlayVariants}
              onClick={() => closeMenu('backdrop')}
              aria-hidden="true"
            />

            <motion.div
              className="relative z-10 flex max-h-[92dvh] w-full max-w-[100vw] flex-col rounded-t-3xl border-t border-[hsl(var(--border))]/60 bg-[hsl(var(--surface))]/98 shadow-[0_-18px_40px_rgba(15,23,42,0.55)] sm:max-h-[92vh] sm:max-w-md sm:rounded-2xl sm:border sm:border-[hsl(var(--border))]/60 sm:bg-[radial-gradient(circle_at_top,_hsl(var(--surface-2))/65,_hsl(var(--surface))_52%)] [@media(orientation:landscape)]:max-h-[90dvh]"
              variants={sheetVariants}
              drag={reducedMotion ? false : 'y'}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.04}
              onDragEnd={(_, info) => {
                if (info.offset.y > 80) closeMenu('drag_close');
              }}
            >
              <div className="shrink-0 pt-[env(safe-area-inset-top)]" />
              <div
                className="mx-auto mt-4 h-1 w-12 shrink-0 rounded-full bg-token-text/15"
                aria-hidden="true"
              />

              <div className="flex shrink-0 items-center justify-between gap-3 px-5 py-3.5">
                <h2
                  id={titleId}
                  className="text-[15px] font-semibold leading-tight tracking-tight text-[hsl(var(--text))]/85"
                >
                  {ui.menu}
                </h2>

                <button
                  onClick={() => closeMenu('close_btn')}
                  type="button"
                  className="flex min-h-[2.5rem] min-w-[2.5rem] shrink-0 items-center justify-center rounded-full hover:bg-[hsl(var(--surface-2))]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))/0.9] focus-visible:ring-offset-2"
                  aria-label={ui.closeMenu}
                >
                  <Icon.Close />
                </button>
              </div>

              <div
                ref={scrollAreaRef}
                className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-0 py-0"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
              <MobileNavSearch
                searchAction={searchAction}
                ui={ui}
                trends={trends}
                placeholder={placeholder}
                searching={searching}
                recentQs={recentQs}
                searchRef={searchRef}
                onSubmit={onSearchSubmit}
                onSearch={goSearch}
                onClearRecent={() => {
                  try { localStorage.removeItem('recent:q'); } catch { /* no-op */ }
                  dispatch({ type: 'SET_RECENT_QS', payload: [] });
                }}
                onFocusSearch={() => dispatch({ type: 'SET_SEARCH_FOCUSED', payload: true })}
                onBlurSearch={() => dispatch({ type: 'SET_SEARCH_FOCUSED', payload: false })}
              />

              <MobileNavQuickAccess
                ui={ui}
                wishlistCount={wishlistCount}
                canInstall={canInstall}
                locale={locale}
                onClose={closeMenu}
                onInstall={handleInstall}
                prefetch={prefetchOnPointer}
              />

              <MobileNavLinks
                nav={nav}
                ui={ui}
                categories={categories}
                locale={locale}
                catsOpen={catsOpen}
                catsPanelId={catsPanelId}
                reducedMotion={reducedMotion}
                isActive={isActive}
                onClose={closeMenu}
                onToggleCats={() => dispatch({ type: 'TOGGLE_CATS' })}
                prefetch={prefetchOnPointer}
              />

              <div className="flex items-center gap-2.5 border-t border-[hsl(var(--border))]/40 bg-[hsl(var(--surface))]/94 px-5 py-3.5">
                <Link
                  href="/commande"
                  onPointerDown={() => {
                    prefetchOnPointer('/commande');
                    closeMenu('cart_btn');
                  }}
                  onFocus={() => prefetchOnPointer('/commande')}
                  onClick={() => {
                    track({
                      action: 'mobile_nav_cart_click',
                      label: 'cart',
                      value: cartCount || 1,
                    });
                    closeMenu('cart_btn');
                  }}
                  className="focus-ring flex min-h-[2.85rem] flex-1 items-center justify-center gap-2 rounded-full border border-[hsl(var(--accent)/.45)] bg-[hsl(var(--accent)/.10)] px-4 py-2.5 text-[15px] font-semibold hover:bg-[hsl(var(--accent)/.18)] focus-visible:ring-[hsl(var(--accent)/.5)]"
                  aria-label={ui.cart(cartCount)}
                >
                  <Icon.Cart />
                  {cartCount > 0 ? (
                    <span className="rounded-full bg-[hsl(var(--accent))] px-2 py-0.5 text-[12px] font-bold tabular-nums text-white">
                      {cartCount}
                    </span>
                  ) : null}
                </Link>

                <button
                  onClick={() => closeMenu('footer_close')}
                  type="button"
                  className="min-h-[2.75rem] min-w-[2.75rem] shrink-0 rounded-full px-3 text-[12px] font-medium text-token-text/65 hover:bg-[hsl(var(--surface-2))]/80 hover:text-token-text/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))/0.9] focus-visible:ring-offset-2"
                  aria-label={ui.closeMenu}
                >
                  {ui.closeMenu}
                </button>
              </div>

              <div className="shrink-0 pb-[env(safe-area-inset-bottom)]" />
              </div>
            </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body
          )
        : null}
    </>
  );
}
