'use client';

import { usePathname } from 'next/navigation';
import {
  useId,
  useMemo,
  useState,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import { toast } from 'react-hot-toast';
import {
  FaCcMastercard,
  FaCcPaypal,
  FaCcVisa,
  FaFacebookF,
  FaFileAlt,
  FaHeadset,
  FaInstagram,
  FaLock,
  FaShieldAlt,
  FaTruck,
  FaTwitter,
} from 'react-icons/fa';
import { SiStripe } from 'react-icons/si';

import Link from '@/components/LocalizedLink';
import { useTranslations } from 'next-intl';
import { BRAND } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { getErrorMessageWithFallback } from '@/lib/errors';
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing';

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

type NavGroup = {
  title: string;
  links: FooterLink[];
};

interface FooterProps {
  groups?: NavGroup[];
  links?: FooterLink[];
  companyName?: string;
  compact?: boolean;
  children?: ReactNode;
  subscribeEndpoint?: string;
  siteUrl?: string;
  contact?: {
    email?: string;
    phone?: string;
    address?: {
      streetAddress?: string;
      postalCode?: string;
      addressLocality?: string;
      addressCountry?: string;
    };
  };
}

type FooterWindow = Window & {
  tpOpenConsent?: () => void;
  dataLayer?: Array<Record<string, unknown>>;
};

type SubscribeResponse = {
  message?: string;
};

const T = {
  fr: {
    ariaFooter: 'Pied de page',
    footerHeading: 'Informations et navigation secondaire',
    brandText:
      'Des accessoires et packs sélectionnés pour la performance, l’innovation et le style.',
    legalTitle: 'Légal',
    defaultGroups: [
      {
        title: 'Boutique',
        links: [
          { label: 'Accueil', href: '/' },
          { label: 'Catégories', href: '/categorie' },
          { label: 'Produits', href: '/products' },
          { label: 'Packs', href: '/products/packs' },
          { label: 'Wishlist', href: '/wishlist' },
        ],
      },
      {
        title: 'Aide & contact',
        links: [
          { label: 'Suivi de commande', href: '/commande' },
          { label: 'FAQ', href: '/#faq' },
          { label: 'Nous contacter', href: '/contact' },
          { label: 'Blog', href: '/blog' },
        ],
      },
      {
        title: 'Votre commande',
        links: [
          { label: 'Livraison', href: '/cgv' },
          { label: 'Retours & échanges', href: '/cgv' },
        ],
      },
      {
        title: 'Légal',
        links: [
          { label: 'Mentions légales', href: '/mentions-legales' },
          { label: 'Conditions générales', href: '/cgv' },
          { label: 'Politique de confidentialité', href: '/confidentialite' },
          { label: 'Préférences cookies', href: '#cookies' },
        ],
      },
    ] as NavGroup[],
    badges: {
      secure: 'Paiement sécurisé',
      shipping: 'Livraison 48–72 h',
      support: 'Support réactif',
    },
    badgesAria: 'Garanties',
    newsletterTitle: 'Newsletter',
    newsletterPlaceholder: 'votre@email.com',
    newsletterButtonIdle: 'S’inscrire',
    newsletterButtonLoading: 'Envoi…',
    newsletterFormAria: 'Inscription newsletter',
    newsletterSuccess: 'Inscription confirmée. Bienvenue chez TechPlay !',
    newsletterToastSuccess: 'Vous êtes inscrit(e) 🎉',
    newsletterToastError: 'Inscription impossible pour le moment',
    invalidEmail: 'Merci d’entrer une adresse email valide.',
    consentRequired: 'Vous devez accepter la politique de confidentialité.',
    genericError: 'Une erreur est survenue. Réessayez.',
    consentTextStart: 'J’accepte de recevoir vos emails et la ',
    privacyPolicy: 'politique de confidentialité',
    consentTextEnd: '.',
    hiddenWebsiteLabel: 'Votre site web',
    recentLocale: 'FR • EUR',
    rightsReserved: 'Tous droits réservés.',
    cookiePrefs: 'Préférences cookies',
    navigationSchemaName: 'Footer Navigation',
    social: {
      facebook: 'Facebook',
      twitter: 'Twitter / X',
      instagram: 'Instagram',
    },
  },
  en: {
    ariaFooter: 'Footer',
    footerHeading: 'Information and secondary navigation',
    brandText: 'Accessories and bundles selected for performance, innovation and style.',
    legalTitle: 'Legal',
    defaultGroups: [
      {
        title: 'Shop',
        links: [
          { label: 'Home', href: '/' },
          { label: 'Categories', href: '/categorie' },
          { label: 'Products', href: '/products' },
          { label: 'Bundles', href: '/products/packs' },
          { label: 'Wishlist', href: '/wishlist' },
        ],
      },
      {
        title: 'Help & contact',
        links: [
          { label: 'Order tracking', href: '/commande' },
          { label: 'FAQ', href: '/#faq' },
          { label: 'Contact us', href: '/contact' },
          { label: 'Blog', href: '/blog' },
        ],
      },
      {
        title: 'Your order',
        links: [
          { label: 'Shipping', href: '/cgv' },
          { label: 'Returns & refunds', href: '/cgv' },
        ],
      },
      {
        title: 'Legal',
        links: [
          { label: 'Legal notice', href: '/mentions-legales' },
          { label: 'Terms & conditions', href: '/cgv' },
          { label: 'Privacy policy', href: '/confidentialite' },
          { label: 'Cookie preferences', href: '#cookies' },
        ],
      },
    ] as NavGroup[],
    badges: {
      secure: 'Secure payment',
      shipping: '48–72h delivery',
      support: 'Quick support',
    },
    badgesAria: 'Our guarantees',
    newsletterTitle: 'Newsletter',
    newsletterPlaceholder: 'your@email.com',
    newsletterButtonIdle: 'Subscribe',
    newsletterButtonLoading: 'Sending…',
    newsletterFormAria: 'Newsletter signup',
    newsletterSuccess: 'Subscription confirmed. Welcome to TechPlay!',
    newsletterToastSuccess: 'You are subscribed 🎉',
    newsletterToastError: 'Subscription is unavailable right now',
    invalidEmail: 'Please enter a valid email address.',
    consentRequired: 'You must accept the privacy policy.',
    genericError: 'Something went wrong. Please try again.',
    consentTextStart: 'I agree to receive emails and accept the ',
    privacyPolicy: 'privacy policy',
    consentTextEnd: '.',
    hiddenWebsiteLabel: 'Your website',
    recentLocale: 'EN • EUR',
    rightsReserved: 'All rights reserved.',
    cookiePrefs: 'Cookie preferences',
    navigationSchemaName: 'Footer Navigation',
    social: {
      facebook: 'Facebook',
      twitter: 'Twitter / X',
      instagram: 'Instagram',
    },
  },
} as const;

function normalizeHref(href: string): string {
  if (!href || !href.startsWith('/')) return href;

  return href
    .replace(/^\/produit(?!s)/, '/products')
    .replace(/^\/pack(?!s)/, '/products/packs')
    .replace(/^\/promo$/, '/products?promo=1')
    .replace(/^\/#?categories$/i, '/#categories')
    .replace(/^\/#?faq$/i, '/#faq');
}

function isValidEmail(value: string): boolean {
  return /^\S+@\S+\.\S+$/.test(String(value || '').trim());
}

function getSafeWindow(): FooterWindow | null {
  if (typeof window === 'undefined') return null;
  return window as FooterWindow;
}

function pushDataLayer(eventName: string, payload: Record<string, unknown> = {}): void {
  try {
    const w = getSafeWindow();
    if (!w) return;
    if (!Array.isArray(w.dataLayer)) w.dataLayer = [];
    w.dataLayer.push({ event: eventName, ...payload });
  } catch {
    // no-op
  }
}

function LegalIcon({ label, className }: { label: string; className?: string }) {
  const lower = label.toLowerCase();
  const base = cn('shrink-0 text-[hsl(var(--accent))]', className);

  if (lower.includes('mention') || lower.includes('legal')) {
    return <FaFileAlt className={base} aria-hidden="true" />;
  }

  if (lower.includes('confidential') || lower.includes('privacy')) {
    return <FaLock className={base} aria-hidden="true" />;
  }

  if (lower.includes('cgv') || lower.includes('terms')) {
    return <FaFileAlt className={base} aria-hidden="true" />;
  }

  return null;
}

export default function Footer({
  groups,
  links,
  companyName = 'TechPlay',
  compact = false,
  children,
  subscribeEndpoint = '/api/notifications/subscribe',
  siteUrl = BRAND.URL,
  contact = {
    email: 'support@techplay.fr',
    phone: '+33 1 84 80 12 34',
    address: {
      streetAddress: '12 rue de la Boutique',
      postalCode: '75000',
      addressLocality: 'Paris',
      addressCountry: 'FR',
    },
  },
}: FooterProps) {
  const pathname = usePathname() || '/';
  const locale = getCurrentLocale(pathname) === 'en' ? 'en' : 'fr';
  const tFooter = useTranslations('footer');
  const t = T[locale];
  const origin = String(siteUrl || '').replace(/\/$/, '');

  const baseGroups = useMemo<NavGroup[]>(() => {
    const source = groups ?? t.defaultGroups;

    return source.map((group) => ({
      title: group.title,
      links: group.links.map((link) => ({
        ...link,
        href: normalizeHref(link.href),
      })),
    }));
  }, [groups, t.defaultGroups]);

  const navGroups = useMemo<NavGroup[]>(() => {
    if (!links) return baseGroups;

    const normalizedLegal = links.map((link) => ({
      ...link,
      href: normalizeHref(link.href),
    }));

    const clone = [...baseGroups];
    const index = clone.findIndex((group) => {
      const value = group.title.toLowerCase();
      return value.includes('légal') || value.includes('legal');
    });

    if (index >= 0) {
      clone[index] = {
        title: clone[index].title,
        links: normalizedLegal,
      };
    } else {
      clone.push({
        title: t.legalTitle,
        links: normalizedLegal,
      });
    }

    return clone;
  }, [baseGroups, links, t.legalTitle]);

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const emailId = useId();
  const messageId = useId();
  const consentId = useId();

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [consent, setConsent] = useState(true);

  const openConsentManager = (
    e?: Pick<ReactMouseEvent<HTMLElement>, 'preventDefault'> | { preventDefault?: () => void }
  ) => {
    e?.preventDefault?.();

    try {
      const w = getSafeWindow();
      w?.tpOpenConsent?.();
    } catch {
      // no-op
    }

    try {
      window.dispatchEvent(new CustomEvent('open-consent-manager'));
    } catch {
      // no-op
    }

    pushDataLayer('open_consent_manager', { location: 'footer' });
  };

  const onSubscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (status === 'loading') return;
    if (website) return;

    if (!isValidEmail(email)) {
      setStatus('error');
      setMessage(t.invalidEmail);
      return;
    }

    if (!consent) {
      setStatus('error');
      setMessage(t.consentRequired);
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch(subscribeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale, pathname }),
      });

      if (!res.ok) {
        const maybe = (await res.json().catch(() => null)) as SubscribeResponse | null;
        throw new Error(maybe?.message || t.genericError);
      }

      pushDataLayer('newsletter_subscribe', {
        location: 'footer',
        locale,
        pathname,
      });

      setStatus('success');
      setMessage(t.newsletterSuccess);
      setEmail('');

      try {
        toast.success(t.newsletterToastSuccess);
      } catch {
        // no-op
      }
    } catch (error: unknown) {
      setStatus('error');
      setMessage(getErrorMessageWithFallback(error, t.genericError));

      try {
        toast.error(t.newsletterToastError);
      } catch {
        // no-op
      }
    }
  };

  const onSocialClick = (network: 'facebook' | 'twitter' | 'instagram') => {
    pushDataLayer('social_click', {
      network,
      location: 'footer',
      pathname,
    });
  };

  const onNavClick = (
    groupTitle: string,
    label: string,
    href: string,
    e?: ReactMouseEvent<HTMLElement>
  ) => {
    if (label.toLowerCase().includes('cookie')) {
      openConsentManager(e);
      return;
    }

    pushDataLayer('footer_nav_click', {
      group: groupTitle,
      label,
      href,
      from: pathname,
    });
  };

  const schemaLinks = navGroups.flatMap((group) =>
    group.links
      .filter((link) => !link.label.toLowerCase().includes('cookie'))
      .map((link) =>
        link.external
          ? {
              '@type': 'WebPage',
              name: link.label,
              url: link.href,
            }
          : {
              '@type': 'WebPage',
              name: link.label,
              url: `${origin}${localizePath(link.href, locale)}`,
            }
      )
  );

  return (
    <footer
      className="relative overflow-hidden border-t border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] text-[hsl(var(--text))] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      role="contentinfo"
      aria-label={t.ariaFooter}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_90%_0%,hsl(var(--accent)/0.04),transparent_50%)]"
      />

      <div className="relative mx-auto max-w-screen-xl px-6 pb-12 pt-20 sm:px-8 sm:pt-24">
        <h2 className="sr-only" id="footer-heading">
          {t.footerHeading}
        </h2>

        <div className="grid grid-cols-1 gap-14 md:grid-cols-12 lg:gap-20">
          {/* Bloc marque — présence éditoriale */}
          <div className="space-y-8 md:col-span-5">
            <header className="border-b border-[hsl(var(--border))]/60 pb-6 md:pb-8">
              <p className="text-2xl font-extrabold tracking-tight text-[hsl(var(--text))] sm:text-3xl">
                <span>{companyName}</span>
                <span className="text-[hsl(var(--accent))]">.</span>
              </p>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-token-text/80 sm:mt-5 sm:text-base">
                {t.brandText}
              </p>
            </header>

            {!compact ? (
              <>
                <div
                  className="rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--surface))]/90 p-5 dark:bg-[hsl(var(--surface))]/50"
                  aria-label={t.badgesAria}
                >
                  <ul className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3" role="list">
                    <li className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <FaShieldAlt className="text-[15px]" aria-hidden="true" />
                      </span>
                      <span className="text-[13px] font-medium text-[hsl(var(--text))]">
                        {t.badges.secure}
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]">
                        <FaTruck className="text-[15px]" aria-hidden="true" />
                      </span>
                      <span className="text-[13px] font-medium text-[hsl(var(--text))]">
                        {t.badges.shipping}
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <FaHeadset className="text-[15px]" aria-hidden="true" />
                      </span>
                      <span className="text-[13px] font-medium text-[hsl(var(--text))]">
                        {t.badges.support}
                      </span>
                    </li>
                  </ul>
                </div>

                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--text))]/70">
                  {tFooter('we_accept')}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 sm:gap-4" aria-hidden="true">
                  <span
                    className="flex h-9 w-12 items-center justify-center rounded-lg border border-[hsl(var(--border))]/80 bg-[hsl(var(--surface-2))] px-1.5 text-[hsl(var(--text))] shadow-sm dark:bg-white/10 dark:text-white"
                    title="Visa"
                  >
                    <FaCcVisa className="text-2xl" />
                  </span>
                  <span
                    className="flex h-9 w-12 items-center justify-center rounded-lg border border-[hsl(var(--border))]/80 bg-[hsl(var(--surface-2))] px-1.5 text-[hsl(var(--text))] shadow-sm dark:bg-white/10 dark:text-white"
                    title="Mastercard"
                  >
                    <FaCcMastercard className="text-2xl" />
                  </span>
                  <span
                    className="flex h-9 w-12 items-center justify-center rounded-lg border border-[hsl(var(--border))]/80 bg-[hsl(var(--surface-2))] px-1.5 text-[hsl(var(--text))] shadow-sm dark:bg-white/10 dark:text-white"
                    title="PayPal"
                  >
                    <FaCcPaypal className="text-xl" />
                  </span>
                  <span
                    className="flex h-9 w-12 items-center justify-center rounded-lg border border-[hsl(var(--border))]/80 bg-[hsl(var(--surface-2))] px-1.5 text-[hsl(var(--text))] shadow-sm dark:bg-white/10 dark:text-white"
                    title="Stripe"
                  >
                    <SiStripe className="text-xl" />
                  </span>
                </div>
              </>
            ) : null}

            {contact?.email || contact?.phone || contact?.address?.streetAddress ? (
              <>
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--text))]">
                  {tFooter('get_in_touch')}
                </h3>
                <ul className="mt-3 space-y-2 text-[14px] text-token-text/85">
                  {contact?.email ? (
                    <li>
                      <a
                        href={`mailto:${contact.email}`}
                        className="rounded-md transition-colors hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
                      >
                        {contact.email}
                      </a>
                    </li>
                  ) : null}
                  {contact?.phone ? (
                    <li>
                      <a
                        href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                        className="rounded-md transition-colors hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
                      >
                        {contact.phone}
                      </a>
                    </li>
                  ) : null}
                  {contact?.address?.streetAddress ? (
                    <li className="text-token-text/70">
                      {contact.address.streetAddress}
                      {contact.address.postalCode ? `, ${contact.address.postalCode}` : ''}
                      {contact.address.addressLocality ? ` ${contact.address.addressLocality}` : ''}
                      {contact.address.addressCountry ? ` · ${contact.address.addressCountry}` : ''}
                    </li>
                  ) : null}
                </ul>
              </>
            ) : null}
          </div>

          <div
            className="grid grid-cols-2 gap-x-6 gap-y-10 py-6 sm:gap-x-8 sm:gap-y-12 sm:py-0 md:col-span-7 lg:grid-cols-[repeat(4,minmax(0,1fr))] lg:gap-x-8 lg:border-l lg:border-[hsl(var(--border))] lg:pl-12 xl:gap-x-10"
            style={{ minWidth: 0 }}
          >
            {navGroups.map((group) => (
              <nav
                key={group.title}
                aria-label={group.title}
                className="min-w-0 space-y-5 overflow-hidden"
              >
                <h3 className="break-words text-[13px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--text))]">
                  {group.title}
                </h3>

                <ul className="space-y-3.5">
                  {group.links.map(({ href, label, external }) => {
                    const finalHref = localizePath(href, locale);
                    const active =
                      href === '/'
                        ? pathname === finalHref || pathname === '/'
                        : pathname === finalHref || pathname.startsWith(`${finalHref}/`);

                    const isCookie = label.toLowerCase().includes('cookie');
                    const isLegal =
                      group.title.toLowerCase().includes('légal') ||
                      group.title.toLowerCase().includes('legal');

                    const linkClass =
                      'inline-flex min-h-[2.5rem] min-w-0 items-center gap-2.5 rounded-md py-2 text-[14px] text-[hsl(var(--text))]/85 transition-colors hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))] sm:min-h-0 sm:py-1';
                    const content = (
                      <>
                        {isLegal ? <LegalIcon label={label} className="h-5 w-5" /> : null}
                        <span className="min-w-0 break-words">{label}</span>
                      </>
                    );

                    return (
                      <li key={`${group.title}-${href}-${label}`}>
                        {external ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={linkClass}
                            onClick={(e) => onNavClick(group.title, label, href, e)}
                            data-gtm="footer_link_external"
                          >
                            {content}
                          </a>
                        ) : isCookie ? (
                          <a
                            href="#cookies"
                            role="button"
                            aria-controls="tp-consent-panel"
                            className={linkClass}
                            onClick={(e) => onNavClick(group.title, label, '#cookies', e)}
                            data-gtm="footer_link_cookies"
                          >
                            {content}
                          </a>
                        ) : (
                          <Link
                            href={href}
                            aria-current={active ? 'page' : undefined}
                            className={linkClass}
                            onClick={(e) => onNavClick(group.title, label, href, e)}
                            data-gtm="footer_link_internal"
                          >
                            {content}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ))}

            {!compact ? (
              <div className="col-span-2 space-y-6 sm:col-span-3 lg:col-span-4 lg:mt-0 lg:rounded-xl lg:border lg:border-[hsl(var(--border))] lg:bg-[hsl(var(--surface))]/60 lg:px-6 lg:py-6 lg:dark:bg-[hsl(var(--surface))]/30">
                <form
                  onSubmit={onSubscribe}
                  noValidate
                  className="space-y-4 max-w-md"
                  aria-label={t.newsletterFormAria}
                  aria-busy={status === 'loading'}
                  aria-describedby={message ? messageId : undefined}
                >
                  <h3 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--text))]">
                    {t.newsletterTitle}
                  </h3>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      id={emailId}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.newsletterPlaceholder}
                      className="w-full rounded-xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3.5 text-[15px] text-[hsl(var(--text))] placeholder:text-[hsl(var(--text))]/50 transition-[border-color,box-shadow] focus:border-[hsl(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/0.25)] focus:ring-offset-2 focus:ring-offset-[hsl(var(--surface))]"
                      aria-required="true"
                      aria-invalid={status === 'error' && !isValidEmail(email) ? 'true' : 'false'}
                      aria-describedby={status === 'error' ? messageId : undefined}
                      autoComplete="email"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck={false}
                      inputMode="email"
                    />
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="shrink-0 rounded-xl bg-[hsl(var(--accent))] px-6 py-3.5 text-[15px] font-bold text-[hsl(var(--accent-foreground))] shadow-lg transition-all duration-200 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))] disabled:opacity-60 disabled:hover:shadow-lg"
                      aria-label={t.newsletterButtonIdle}
                      data-gtm="footer_newsletter_submit"
                    >
                      {status === 'loading' ? t.newsletterButtonLoading : t.newsletterButtonIdle}
                    </button>
                  </div>

                  <label
                    htmlFor={consentId}
                    className="flex items-start gap-2.5 text-[13px] text-token-text/80"
                  >
                    <input
                      id={consentId}
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span>
                      {t.consentTextStart}
                      <Link
                        href="/confidentialite"
                        className="underline hover:text-[hsl(var(--accent))]"
                      >
                        {t.privacyPolicy}
                      </Link>
                      {t.consentTextEnd}
                    </span>
                  </label>

                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="website">{t.hiddenWebsiteLabel}</label>
                    <input
                      id="website"
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  {message ? (
                    <p
                      id={messageId}
                      className={
                        status === 'error' ? 'text-xs text-red-600' : 'text-xs text-emerald-600'
                      }
                      role="status"
                      aria-live="polite"
                    >
                      {message}
                    </p>
                  ) : null}
                </form>

                <p className="text-[13px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--text))]/80">
                  {tFooter('follow_us')}
                </p>
                <div className="flex items-center gap-3 text-xl text-[hsl(var(--text))]/60">
                  <a
                    href="https://facebook.com/techplay"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t.social.facebook}
                    className="rounded-lg p-2 transition-all duration-200 hover:scale-110 hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
                    onClick={() => onSocialClick('facebook')}
                    data-gtm="footer_social_facebook"
                  >
                    <FaFacebookF />
                  </a>

                  <a
                    href="https://twitter.com/techplay"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t.social.twitter}
                    className="rounded-lg p-2 transition-all duration-200 hover:scale-110 hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
                    onClick={() => onSocialClick('twitter')}
                    data-gtm="footer_social_twitter"
                  >
                    <FaTwitter />
                  </a>

                  <a
                    href="https://instagram.com/techplay"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t.social.instagram}
                    className="rounded-lg p-2 transition-all duration-200 hover:scale-110 hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
                    onClick={() => onSocialClick('instagram')}
                    data-gtm="footer_social_instagram"
                  >
                    <FaInstagram />
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {children ? <div className="mt-10 text-center">{children}</div> : null}

        <div className="mt-14 flex flex-col items-center justify-between gap-6 border-t border-[hsl(var(--border))] pt-8 md:flex-row">
          <p className="text-[14px] text-[hsl(var(--text))]/80">
            © {currentYear}{' '}
            <span className="font-semibold text-[hsl(var(--text))]">{companyName}</span>
            <span className="text-[hsl(var(--text))]/65">. {t.rightsReserved}</span>
          </p>

          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[14px] text-[hsl(var(--text))]/75">
            <li className="inline-flex items-center gap-2">
              <FaLock className="h-4 w-4 shrink-0 text-[hsl(var(--text))]/60" aria-hidden="true" />
              <span className="sr-only">{tFooter('secure_payment')}</span>
              <span className="inline-flex items-center gap-2" aria-hidden="true">
                <SiStripe className="text-lg" title="Stripe" />
                <FaCcVisa className="text-lg" title="Visa" />
                <FaCcMastercard className="text-lg" title="Mastercard" />
                <FaCcPaypal className="text-base" title="PayPal" />
              </span>
            </li>
            <li className="hidden sm:inline text-[hsl(var(--text))]/45" aria-hidden="true">
              ·
            </li>
            <li>{t.recentLocale}</li>
            <li className="hidden sm:inline text-[hsl(var(--text))]/45" aria-hidden="true">
              ·
            </li>
            <li>
              <a
                href="#cookies"
                role="button"
                aria-controls="tp-consent-panel"
                onClick={(e) => openConsentManager(e)}
                className="underline decoration-dotted underline-offset-2 transition-colors hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
              >
                {t.cookiePrefs}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SiteNavigationElement',
            name: t.navigationSchemaName,
            url: origin,
            hasPart: schemaLinks,
          }),
        }}
      />
    </footer>
  );
}
