import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { Suspense, type CSSProperties } from 'react';

import type { Product } from '@/types/product';
import type { Metadata } from 'next';

import BestProducts from '@/components/BestProducts';
import ClientTrackingScript from '@/components/ClientTrackingScript';
import FAQ from '@/components/FAQ';
import Link from '@/components/LocalizedLink';
import BundleBuilder from '@/components/BundleBuilder';
import SectionHeader from '@/components/SectionHeader';
import TrustBadges from '@/components/TrustBadges';
import WhyChooseUsSection from '@/components/WhyChooseUsSection';
import { getPosts } from '@/lib/blog';
import { BRAND } from '@/lib/constants';
import { getAllProducts, getBestProducts } from '@/lib/data';
import { localizePath } from '@/lib/i18n-routing';
import { isLocale } from '@/lib/language';
import { getTranslations, setRequestLocale } from 'next-intl/server';

const HeroCarousel = dynamic(() => import('@/components/HeroCarousel'), {
  ssr: true,
  loading: () => (
    <div
      className="h-full min-h-[280px] w-full rounded-[var(--radius-2xl)] bg-[hsl(var(--surface-2))]/60 sm:min-h-[320px] lg:min-h-[380px]"
      aria-hidden
    />
  ),
});
const BlogCard = dynamic(() => import('@/components/blog/BlogCard').then((m) => m.default), {
  loading: () => <div className="skeleton aspect-[16/10] rounded-2xl" />,
});

const SITE_URL = BRAND.URL;

const lazySectionStyle600: CSSProperties = {
  contentVisibility: 'auto',
  containIntrinsicSize: '600px',
};
const lazySectionStyle500: CSSProperties = {
  contentVisibility: 'auto',
  containIntrinsicSize: '500px',
};
const lazySectionStyle300: CSSProperties = {
  contentVisibility: 'auto',
  containIntrinsicSize: '300px',
};

const STR = {
  fr: {
    metaTitle: 'TechPlay – Boutique high-tech & packs exclusifs',
    metaDescription:
      'Découvrez les meilleures offres TechPlay : accessoires high-tech, gaming, audio et packs exclusifs sélectionnés pour la performance, le style et la fiabilité.',
    heroAria: 'Carrousel des produits en vedette',
    heroBadge: 'Par des passionnés · Pour les joueurs',
    heroTitle: 'Ton setup gaming, enfin bien choisi.',
    heroSubtitle:
      "On teste chaque produit pour toi. Fini les mauvais achats — seulement ce qui vaut vraiment le coup.",
    heroPrimaryCta: 'Voir les meilleurs produits',
    heroSecondaryCta: 'Créer mon bundle',
    catsKicker: 'Explorer',
    catsTitle: 'Catégories incontournables',
    catsSub: 'Des sélections ciblées pour trouver vite le bon setup.',
    bestKicker: 'Top ventes',
    bestTitle: 'Nos meilleures ventes',
    bestSub: 'Déjà plébiscités par +500 clients satisfaits.',
    packsKicker: 'Bundles',
    packsTitle: 'Packs recommandés',
    packsSub:
      'Sélections expertes : plusieurs produits ensemble à prix pack. Économisez plus, livraison offerte.',
    faqTitle: 'Questions fréquentes',
    faqKicker: 'FAQ',
    faqViewAll: 'Voir toute la FAQ',
    bundleKicker: 'Économisez 10 %',
    bundleTitle: 'Construis ton setup idéal',
    bundleAria: 'Constructeur de bundle personnalisé',
    ctaTitle: "Appel à l'action",
    ctaOffer: 'Offre du moment',
    ctaHeadline: 'Boostez votre setup, ',
    ctaSpan: 'économisez 10 %',
    ctaText: 'Composez votre setup sur mesure et économisez automatiquement grâce aux bundles.',
    ctaPacks: 'Créer mon bundle',
    ctaProducts: 'Voir les produits',
    noscriptProducts: 'Voir les produits',
    productsSectionLabel: 'Sélection de produits populaires',
    packsSectionLabel: 'Sélection de packs recommandés',
    storyKicker: 'Notre philosophie',
    storyTitle: 'Pourquoi TechPlay existe',
    storyText: "On en avait assez des sites qui vendent n'importe quoi. TechPlay ne référence que ce qu'on utiliserait soi-même — des produits testés, validés, qui valent vraiment le coup.",
    storyStat1: '+500',
    storyStat1Label: 'clients satisfaits',
    storyStat2: '100%',
    storyStat2Label: 'produits testés',
    storyStat3: '24h',
    storyStat3Label: 'support réactif',
    whyKicker: 'Pourquoi TechPlay',
    whyTitle: 'Ce qui nous différencie vraiment',
    whySub: 'Sélection rigoureuse, prix juste et support humain — pas de compromis.',
    why1Title: 'Sélection rigoureuse',
    why1Desc: "Chaque produit est testé et validé avant d'intégrer le catalogue. Pas de remplissage.",
    why2Title: 'Paiement 100 % sécurisé',
    why2Desc: 'Stripe, Apple Pay, Google Pay. Vos données ne sont jamais partagées.',
    why3Title: 'Retours sans tracas',
    why3Desc: "30 jours pour changer d'avis, remboursement rapide et sans complication.",
    why4Title: 'Support humain & réactif',
    why4Desc: 'Une vraie équipe disponible. Réponse garantie sous 24 h — pas un bot.',
    blogKicker: 'Guides & SEO',
    blogTitle: 'Blog gaming & setup',
    blogSub:
      'Meilleurs claviers 2026, guides setup, astuces FPS — pour ramener du trafic et convertir.',
    blogCta: 'Voir tout le blog',
    blogSectionLabel: 'Derniers articles du blog',
  },
  en: {
    metaTitle: 'TechPlay – High-tech store & exclusive bundles',
    metaDescription:
      'Discover the best TechPlay offers: high-tech accessories, gaming, audio gear and exclusive bundles selected for performance, style and reliability.',
    heroAria: 'Featured products carousel',
    heroBadge: 'By enthusiasts · For gamers',
    heroTitle: 'Your gaming setup, finally done right.',
    heroSubtitle:
      "We test every product for you. No more bad buys — only what's truly worth it.",
    heroPrimaryCta: 'See the best products',
    heroSecondaryCta: 'Build my bundle',
    catsKicker: 'Explore',
    catsTitle: 'Must-have categories',
    catsSub: 'Curated selections to find the right setup faster.',
    bestKicker: 'Best sellers',
    bestTitle: 'Our best sellers',
    bestSub: 'Already trusted by 500+ satisfied customers.',
    packsKicker: 'Bundles',
    packsTitle: 'Recommended bundles',
    packsSub: 'Expert picks: multiple products together at bundle price. Save more, free delivery.',
    faqTitle: 'Frequently asked questions',
    faqKicker: 'FAQ',
    faqViewAll: 'View all questions',
    bundleKicker: 'Save 10%',
    bundleTitle: 'Build your perfect setup',
    bundleAria: 'Custom bundle builder',
    ctaTitle: 'Call to action',
    ctaOffer: 'Deal of the moment',
    ctaHeadline: 'Boost your setup, ',
    ctaSpan: 'save 10%',
    ctaText: 'Build your custom setup and automatically save on every bundle combination.',
    ctaPacks: 'Build my bundle',
    ctaProducts: 'View products',
    noscriptProducts: 'View products',
    productsSectionLabel: 'Popular products selection',
    packsSectionLabel: 'Recommended bundles selection',
    storyKicker: 'Our philosophy',
    storyTitle: 'Why TechPlay exists',
    storyText: "We were tired of sites selling anything and everything. TechPlay only lists what we'd use ourselves — tested products that are truly worth it.",
    storyStat1: '500+',
    storyStat1Label: 'happy customers',
    storyStat2: '100%',
    storyStat2Label: 'tested products',
    storyStat3: '24h',
    storyStat3Label: 'support reply',
    whyKicker: 'Why TechPlay',
    whyTitle: 'What truly sets us apart',
    whySub: 'Rigorous curation, fair pricing, human support — zero shortcuts.',
    why1Title: 'Rigorous selection',
    why1Desc: 'Every product is tested and validated before joining our catalog. No filler.',
    why2Title: '100% secure payment',
    why2Desc: 'Stripe, Apple Pay, Google Pay. Your data is never shared.',
    why3Title: 'Hassle-free returns',
    why3Desc: '30 days to change your mind, fast refund, no complications.',
    why4Title: 'Human & responsive support',
    why4Desc: 'A real team available. Guaranteed reply within 24h — not a bot.',
    blogKicker: 'Guides & SEO',
    blogTitle: 'Gaming blog & guides',
    blogSub:
      'Best gaming keyboards 2026, setup guides, how to improve aim in FPS — drive Google traffic and convert.',
    blogCta: 'View all articles',
    blogSectionLabel: 'Latest blog posts',
  },
} as const;

type HomeLocale = keyof typeof STR;

export const revalidate = 300;

function buildHomeMetadata(locale: HomeLocale): Metadata {
  const t = STR[locale];
  const pathPrefix = locale === 'en' ? '/en' : '/fr';
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: pathPrefix,
      languages: {
        fr: '/fr',
        en: '/en',
        'x-default': '/fr',
      },
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url: `${SITE_URL}${pathPrefix}`,
      type: 'website',
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: t.metaTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.metaTitle,
      description: t.metaDescription,
      images: ['/og-image.jpg'],
    },
  };
}

function getProductUrl(product: Product): string {
  return product.slug ? `${SITE_URL}/products/${product.slug}` : `${SITE_URL}/products`;
}

function getProductName(product: Product): string {
  return product.title?.trim() || 'Produit';
}

function SplitCTA({ locale }: { locale: HomeLocale }) {
  const t = STR[locale];
  return (
    <section
      aria-label={t.ctaTitle}
      className="motion-section motion-section-delay-4 section-spacing-sm relative overflow-hidden rounded-[var(--radius-3xl)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding shadow-sm sm:px-12 sm:py-14 md:px-16 md:py-20"
      style={lazySectionStyle300}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-[hsl(var(--accent)/.06)] blur-3xl"
      />
      <div className="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="heading-kicker">{t.ctaOffer}</p>
          <h3 className="mt-4 heading-section sm:[font-size:var(--step-4)] md:text-[2.5rem]">
            {t.ctaHeadline}
            <span className="text-[hsl(var(--accent))]">{t.ctaSpan}</span>
          </h3>
          <p className="mt-5 max-w-lg text-[var(--step-0)] leading-relaxed text-token-text/75">
            {t.ctaText}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="#builder"
              className="btn btn-premium btn-lg inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[var(--step-0)] focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.4)] sm:w-auto"
              data-gtm="home_cta_bundle"
            >
              {t.ctaPacks}
            </Link>
            <Link
              href="/products"
              className="btn btn-outline btn-lg inline-flex w-full items-center justify-center gap-2 rounded-full border-[hsl(var(--border))] px-8 py-3.5 text-[var(--step-0)] hover:bg-[hsl(var(--surface-2))] focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.3)] sm:w-auto"
              data-gtm="home_cta_products"
            >
              {t.ctaProducts}
            </Link>
          </div>
        </div>
        <div
          aria-hidden
          className="relative hidden min-h-[220px] overflow-hidden rounded-[var(--radius-2xl)] sm:block sm:min-h-[280px]"
          style={{
            background:
              'radial-gradient(ellipse 80% 80% at 60% 50%, hsl(var(--accent)/.18) 0%, hsl(var(--accent)/.06) 50%, transparent 80%), hsl(var(--surface-2))',
          }}
        >
          <div className="absolute inset-0 grid grid-cols-2 gap-4 p-8 opacity-30">
            {/* Casque */}
            <div className="flex items-center justify-center rounded-2xl bg-[hsl(var(--accent)/0.15)]">
              <svg viewBox="0 0 24 24" className="h-12 w-12" fill="currentColor"><path d="M12 3a9 9 0 00-9 9v4a3 3 0 003 3h1a1 1 0 001-1v-5a1 1 0 00-1-1H5v-1a7 7 0 0114 0v1h-2a1 1 0 00-1 1v5a1 1 0 001 1h1a3 3 0 003-3v-4a9 9 0 00-9-9z"/></svg>
            </div>
            {/* Souris */}
            <div className="flex items-center justify-center rounded-2xl bg-[hsl(var(--accent)/0.12)]">
              <svg viewBox="0 0 24 24" className="h-12 w-12" fill="currentColor"><path d="M11 1.07C7.06 1.56 4 4.92 4 9v1h7V1.07zM13 1.07V10h7V9c0-4.08-3.06-7.44-7-7.93zM4 13v2a8 8 0 0016 0v-2H4z"/></svg>
            </div>
            {/* Clavier */}
            <div className="flex items-center justify-center rounded-2xl bg-[hsl(var(--accent)/0.12)]">
              <svg viewBox="0 0 24 24" className="h-12 w-12" fill="currentColor"><path d="M20 5H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2zM7 9H5V7h2v2zm4 0H9V7h2v2zm4 0h-2V7h2v2zm4 0h-2V7h2v2zm-1 4H6v2h12v-2zm-5-4h-2V7h2v2z"/></svg>
            </div>
            {/* Manette */}
            <div className="flex items-center justify-center rounded-2xl bg-[hsl(var(--accent)/0.15)]">
              <svg viewBox="0 0 24 24" className="h-12 w-12" fill="currentColor"><path d="M21 6H3a2 2 0 00-2 2v8a2 2 0 002 2h18a2 2 0 002-2V8a2 2 0 00-2-2zm-10 7H9v2H7v-2H5v-2h2V9h2v2h2v2zm4.5 1a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm3-3a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/></svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

async function HomePageView({ locale }: { locale: HomeLocale }) {
  setRequestLocale(locale);
  const t = STR[locale];
  const tHome = await getTranslations('home');
  const [bestProductsResult, blogResult, allProductsResult] =
    await Promise.allSettled([
      getBestProducts(),
      getPosts({ limit: 3, sort: 'newest', publishedOnly: true }),
      getAllProducts(),
    ]);
  const bestProducts: Product[] =
    bestProductsResult.status === 'fulfilled' ? bestProductsResult.value : [];
  const allProducts: Product[] =
    allProductsResult.status === 'fulfilled' ? allProductsResult.value : [];
  const blogData = blogResult.status === 'fulfilled' ? blogResult.value : null;
  const blogItems = blogData?.items ?? [];
  const blogPostsForCards = (blogItems as Record<string, unknown>[])
    .slice(0, 3)
    .map((item: Record<string, unknown>) => ({
      _id: String(item._id ?? item.id ?? ''),
      slug: String(item.slug ?? ''),
      title: String(item.title ?? ''),
      content: '',
      description: String(item.description ?? item.excerpt ?? ''),
      createdAt:
        item.createdAt instanceof Date
          ? item.createdAt.toISOString()
          : String(item.createdAt ?? new Date().toISOString()),
      updatedAt: item.updatedAt
        ? item.updatedAt instanceof Date
          ? item.updatedAt.toISOString()
          : String(item.updatedAt)
        : undefined,
      image: String(item.image ?? item.coverImage ?? '/og-image.jpg'),
      author: String(item.author ?? 'TechPlay'),
      tags: Array.isArray(item.tags) ? item.tags : [],
    }));

  const itemListJsonLd =
    bestProducts.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: t.bestTitle,
          itemListElement: bestProducts.slice(0, 8).map((product, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            url: getProductUrl(product),
            name: getProductName(product),
          })),
        }
      : null;

  const pathPrefix = locale === 'en' ? '/en' : '/fr';
  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t.metaTitle,
    description: t.metaDescription,
    url: `${SITE_URL}${pathPrefix}`,
    inLanguage: locale === 'en' ? 'en-US' : 'fr-FR',
  };

  return (
    <>
      <h1 className="sr-only">{t.metaTitle}</h1>
      <ClientTrackingScript event="homepage_view" />
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-gradient-mesh" />
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-0 h-[520px] w-[760px] -translate-x-1/2 -translate-y-1/3 rounded-[999px] bg-[hsl(var(--accent)/.22)] blur-3xl"
      />
      <div className="scroll-smooth rhythm-sections py-0">
        <section
          id="hero"
          aria-label={t.heroAria}
          className="motion-section relative w-full overflow-hidden rounded-b-[var(--radius-3xl)] border-0 border-b border-[hsl(var(--border))] bg-[length:120%_120%] shadow-[var(--shadow-xl)]"
          style={{ backgroundImage: 'var(--gradient-hero)' }}
        >
          <div className="container-app relative z-10 mx-auto grid max-w-screen-2xl gap-6 px-5 py-8 sm:gap-10 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)] lg:items-center lg:gap-14 lg:py-14">
            <div className="space-y-5 sm:space-y-8">
              <span className="inline-block text-[var(--step-subtitle)] font-bold uppercase tracking-[0.22em] text-[hsl(var(--accent))] drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                {t.heroBadge}
              </span>
              <h2 className="heading-section text-balance max-w-xl font-extrabold leading-[1.12] drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)] sm:[font-size:var(--step-5)] md:text-5xl lg:text-[2.75rem] lg:leading-tight">
                {t.heroTitle}
              </h2>
              <p className="max-w-lg text-[14px] font-medium leading-relaxed text-token-text/90 sm:text-[15px]">
                {t.heroSubtitle}
              </p>
              <div className="flex flex-col items-stretch gap-4 pt-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <Link
                  href="/products"
                  className="group hero-cta-primary inline-flex w-full items-center justify-center gap-2.5 rounded-full px-8 py-4 text-[var(--step-0)] font-bold shadow-[var(--shadow-lg),0_0_24px_hsl(var(--accent)/0.25)] transition-all duration-200 hover:shadow-[var(--shadow-lg),0_0_32px_hsl(var(--accent)/0.35)] focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)] sm:w-auto"
                  data-gtm="home_hero_primary"
                >
                  <span className="inline-flex items-center gap-2">
                    {t.heroPrimaryCta}
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M13 6l6 6-6 6"/>
                    </svg>
                  </span>
                </Link>
                <Link
                  href="#builder"
                  className="btn btn-ghost inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-[hsl(var(--border))] px-6 py-3 text-[14px] font-semibold text-token-text/90 hover:border-[hsl(var(--accent)/.3)] hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--text))] focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.25)] sm:w-auto"
                  data-gtm="home_hero_secondary"
                >
                  {t.heroSecondaryCta}
                </Link>
              </div>
              <TrustBadges
                variant="pill"
                compact
                truncateLabels={false}
                className="!mt-5 !border-0 !bg-transparent !py-2 sm:!mt-8 sm:!py-4 [&_ul]:!max-w-none [&_ul]:grid-cols-2 sm:[&_ul]:grid-cols-4 [&_ul]:gap-2 sm:[&_ul]:gap-3 [&_.flex]:!min-h-0 [&_.flex]:px-2 [&_.flex]:py-2 [&_.flex]:sm:px-3 [&_.flex]:sm:py-3 [&_svg]:!w-4 [&_svg]:!h-4 [&_svg]:sm:!w-7 [&_svg]:sm:!h-7 [&_span]:text-[11px] [&_span]:leading-tight [&_span]:sm:text-[12px]"
                badges={[
                  { icon: 'rocket', label: locale === 'en' ? '500+ happy customers' : '+500 clients satisfaits' },
                  { icon: 'truck', label: tHome('trust_fast_delivery') },
                  { icon: 'shield', label: tHome('trust_returns') },
                  { icon: 'lock', label: tHome('trust_secure') },
                ]}
              />
            </div>
            <div className="relative min-h-[280px] sm:min-h-[320px] lg:min-h-[380px]">
              <div className="pointer-events-none absolute -inset-4 rounded-[var(--radius-3xl)] bg-[radial-gradient(ellipse_80%_80%_at_50%_0%,hsl(var(--accent)/.12),transparent_55%)]" />
              <div className="relative h-full min-h-[280px] overflow-hidden rounded-[var(--radius-2xl)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/95 shadow-[var(--shadow-xl)] sm:min-h-[320px] lg:min-h-[380px]">
                <Suspense
                  fallback={
                    <div className="skeleton h-full min-h-[280px] rounded-[var(--radius-2xl)] sm:min-h-[320px] lg:min-h-[380px]" />
                  }
                >
                  <HeroCarousel overlayOpacity={0.25} />
                  <noscript>
                    <p className="px-4 py-3 text-sm text-token-text/80">
                      <a
                        href={localizePath('/products', locale)}
                        className="underline underline-offset-4"
                      >
                        {t.noscriptProducts}
                      </a>
                    </p>
                  </noscript>
                </Suspense>
              </div>
            </div>
          </div>
        </section>

        <div className="container-app mx-auto max-w-screen-xl rhythm-sections py-6 sm:py-10">
          {bestProducts.length >= 4 && (
          <section
            id="best-products"
            aria-label={t.productsSectionLabel}
            className="motion-section motion-section-delay-1"
            style={lazySectionStyle600}
          >
            <SectionHeader kicker={t.bestKicker} title={t.bestTitle} sub={t.bestSub} />
            <div className="rhythm-content">
              <BestProducts products={bestProducts} showTitle={false} />
            </div>
          </section>
          )}
          <WhyChooseUsSection
            kicker={t.whyKicker}
            title={t.whyTitle}
            sub={t.whySub}
            items={[
              { title: t.why1Title, description: t.why1Desc },
              { title: t.why2Title, description: t.why2Desc },
              { title: t.why3Title, description: t.why3Desc },
              { title: t.why4Title, description: t.why4Desc },
            ]}
          />
          <TrustBadges variant="premium" />

          {/* Section storytelling humain */}
          <section
            aria-label={t.storyTitle}
            className="motion-section motion-section-delay-2 overflow-hidden rounded-[var(--radius-3xl)] border border-[hsl(var(--border))]/60 bg-gradient-to-br from-[hsl(var(--surface))] via-[hsl(var(--surface-2))]/60 to-[hsl(var(--surface))] px-6 py-10 shadow-sm sm:px-10 sm:py-12"
          >
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
              <div>
                <p className="heading-kicker">{t.storyKicker}</p>
                <div className="mx-auto mt-1.5 h-0.5 w-8 rounded-full bg-[hsl(var(--accent))] opacity-60" aria-hidden="true" />
                <h2 className="heading-section mt-4">{t.storyTitle}</h2>
                <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-token-text/75">
                  {t.storyText}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: t.storyStat1, label: t.storyStat1Label },
                  { value: t.storyStat2, label: t.storyStat2Label },
                  { value: t.storyStat3, label: t.storyStat3Label },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-[hsl(var(--border))]/50 bg-[hsl(var(--surface))]/80 px-4 py-5 text-center">
                    <p className="text-2xl font-extrabold tabular-nums text-[hsl(var(--accent))] sm:text-3xl">{stat.value}</p>
                    <p className="mt-1.5 text-[12px] font-medium leading-tight text-token-text/65">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {blogPostsForCards.length > 0 && (
            <section
              id="blog"
              aria-label={t.blogSectionLabel}
              className="motion-section motion-section-delay-2"
              style={lazySectionStyle500}
            >
              <SectionHeader kicker={t.blogKicker} title={t.blogTitle} sub={t.blogSub} />
              <div className="rhythm-content grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {blogPostsForCards.map((post) => (
                  <BlogCard key={post._id} article={post} />
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link
                  href="/blog"
                  className="btn btn-outline inline-flex items-center gap-2 rounded-full border-[hsl(var(--border))] px-6 py-2.5 text-[14px] font-semibold hover:bg-[hsl(var(--surface-2))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                >
                  {t.blogCta}
                </Link>
              </div>
            </section>
          )}
          <section
            id="faq"
            aria-label={t.faqTitle}
            className="motion-section motion-section-delay-3"
            style={lazySectionStyle500}
          >
            <SectionHeader kicker={t.faqKicker} title={t.faqTitle} />
            <div className="rhythm-content space-y-4">
              <FAQ showSectionHeading={false} limit={4} showTools={false} />
              <div className="text-center">
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-2.5 text-[13px] font-semibold text-token-text/80 transition hover:bg-[hsl(var(--surface-2))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
                >
                  {t.faqViewAll}
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </section>
          {allProducts.length > 0 && (
            <section
              id="builder"
              aria-label={t.bundleAria}
              className="motion-section motion-section-delay-3"
            >
              <SectionHeader kicker={t.bundleKicker} title={t.bundleTitle} />
              <div className="rhythm-content">
                <BundleBuilder products={allProducts} />
              </div>
            </section>
          )}
          <SplitCTA locale={locale} />
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      {itemListJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      ) : null}
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return buildHomeMetadata('fr');
  return buildHomeMetadata(locale as HomeLocale);
}

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <HomePageView locale={locale as HomeLocale} />;
}
