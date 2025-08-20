// src/app/produit/[slug]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductBySlug, getAllProductSlugs } from '@/lib/data'
import ProductDetail from '@/components/ProductDetail'
import type { Product } from '@/types/product'
import { getLocale } from 'next-intl/server'

/**
 * ISR – bon compromis SEO / fraîcheur
 */
export const revalidate = 1800
// Laisse Next générer aussi des slugs non listés (fallback côté serveur)
export const dynamicParams = true

/**
 * Helpers robustes (ne jettent jamais pendant le build)
 */
function absoluteUrl(path: string, base: string) {
  try {
    return new URL(path, base).toString()
  } catch {
    return path
  }
}

async function safeGetLocale() {
  try {
    return (await getLocale()) || 'fr'
  } catch {
    return 'fr'
  }
}

async function safeGetProduct(slug: string): Promise<Product | null> {
  // slug minimalement nettoyé
  const s = String(slug || '').trim()
  if (!s) return null
  try {
    const p = (await getProductBySlug(s)) as any
    if (!p) return null

    // garde-fou de sérialisation et rendu
    const prod: Product = {
      ...(p as object),
      slug: String(p.slug || s),
      title: String(p.title || 'Produit'),
      description: typeof p.description === 'string' ? p.description : '',
      image: p.image ? String(p.image) : '/placeholder.png',
      price: Number(p.price ?? 0),
      // Ajoute ici d’autres champs requis par <ProductDetail /> si nécessaire
    } as Product

    // Ex : si un champ critique est manquant/corrompu → notFound
    if (!prod.slug || !prod.title) return null

    return prod
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[product:getBySlug] failed for', slug, e)
    }
    return null
  }
}

/**
 * Pré-génère une liste “safe” de slugs (ISR). N’échoue jamais.
 */
export async function generateStaticParams() {
  try {
    const slugs = await getAllProductSlugs().catch(() => []) as any[]
    const uniq = Array.from(
      new Set(
        (slugs || [])
          .map((s) => String(s ?? '').trim())
          .filter(Boolean)
      )
    )
    // Sécurité: limite raisonnable si jamais la source en retourne trop
    return uniq.slice(0, 5000).map((slug) => ({ slug }))
  } catch {
    return []
  }
}

/**
 * Metadata robuste (aucun throw)
 */
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const baseUrl =
    (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ?? 'https://techplay.example.com')
  const locale = await safeGetLocale()
  const product = await safeGetProduct(params.slug)

  if (!product) {
    return {
      title: 'Produit introuvable – TechPlay',
      robots: { index: false, follow: true },
    }
  }

  const url = absoluteUrl(`/${locale}/produit/${product.slug}`, baseUrl)
  const absImage = absoluteUrl(product.image || '/placeholder.png', baseUrl)
  const title = `${product.title} | TechPlay`
  const description =
    (product.description && product.description.slice(0, 160)) ||
    'Découvrez ce produit TechPlay.'

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        fr: absoluteUrl(`/fr/produit/${product.slug}`, baseUrl),
        en: absoluteUrl(`/en/produit/${product.slug}`, baseUrl),
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'TechPlay',
      type: 'website', // (Next n’accepte pas "product")
      images: [{ url: absImage, alt: product.title || 'Produit TechPlay', width: 1200, height: 630 }],
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absImage],
    },
    robots: { index: true, follow: true },
  }
}

/**
 * Page produit (tolérante aux erreurs)
 */
export default async function ProductPage({ params }: { params: { slug: string } }) {
  const locale = await safeGetLocale()
  const product = await safeGetProduct(params.slug)
  if (!product) return notFound()

  const baseUrl =
    (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ?? 'https://techplay.example.com')
  const productUrl = absoluteUrl(`/${locale}/produit/${product.slug}`, baseUrl)

  // JSON-LD Breadcrumb minimal, jamais cassant
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil',  item: absoluteUrl(`/${locale}`, baseUrl) },
      { '@type': 'ListItem', position: 2, name: 'Produits', item: absoluteUrl(`/${locale}/produit`, baseUrl) },
      { '@type': 'ListItem', position: 3, name: product.title, item: productUrl },
    ],
  }

  return (
    <main
      id="main"
      className="max-w-7xl mx-auto px-4 py-10"
      aria-label={`Page produit : ${product.title}`}
    >
      <ProductDetail product={product} locale={locale} />

      {/* JSON-LD Breadcrumb */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </main>
  )
}
