// src/components/JsonLd/ProductJsonLd.tsx
import type { Product } from '@/types/product'

type Props = {
  product: Product & {
    brand?: string
    rating?: number
    /** certains back renvoient reviewCount (singulier) */
    reviewCount?: number
    availability?: string // ex: 'https://schema.org/InStock'
    currency?: string
    image?: string | string[]
    _id?: string
    gtin13?: string
    mpn?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [k: string]: any
  }
  /** Nombre d'avis à inclure dans le JSON-LD (0 = aucun). Par défaut: 0 */
  maxReviews?: number
}

const RAW_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com'
const ORIGIN = RAW_ORIGIN.replace(/\/+$/, '') // sans trailing slash
const DEF_AVAIL = 'https://schema.org/InStock'
const SELLER_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'TechPlay'

function absUrl(u?: string) {
  if (!u) return undefined
  return /^https?:\/\//i.test(u) ? u : `${ORIGIN}${u.startsWith('/') ? '' : '/'}${u}`
}

function clamp01to5(n: number) {
  return Math.max(0, Math.min(5, n))
}

export default function ProductJsonLd({ product, maxReviews = 0 }: Props) {
  if (!product) return null

  const {
    _id,
    slug = '',
    title = 'Produit',
    description = 'Découvrez ce produit sur notre boutique.',
    price = 0,
    image,
    category = 'Produit',
    brand,
    availability,
    currency: currencyProp = 'EUR',
  } = product

  const productPath = `/products/${slug}`
  const productUrl = absUrl(productPath)
  const sku = String(_id || product.sku || slug || '')
  const imagesInput = Array.isArray(image) ? image : [image ?? '/placeholder.png']
  const images = imagesInput.map((src) => absUrl(src)!).filter(Boolean)

  const priceNumber =
    typeof price === 'string' ? Number.parseFloat(price) || 0 : Number(price) || 0

  // disponibilité (fallback via stock si présent)
  const avail =
    availability ||
    (typeof product.stock === 'number'
      ? product.stock > 0
        ? DEF_AVAIL
        : 'https://schema.org/OutOfStock'
      : DEF_AVAIL)

  // si promo avec date de fin, expose priceValidUntil (YYYY-MM-DD)
  const priceValidUntil =
    product?.promo?.endDate ? new Date(product.promo.endDate).toISOString().slice(0, 10) : undefined

  // -------- AggregateRating (priorité API -> reviews -> fallback rating/count) --------
  const apiAgg = product.aggregateRating as
    | { average?: number; total?: number; breakdownCount?: Record<1 | 2 | 3 | 4 | 5, number> }
    | undefined

  let aggAverage = 0
  let aggTotal = 0

  if (apiAgg && typeof apiAgg.average === 'number' && typeof apiAgg.total === 'number') {
    aggAverage = clamp01to5(apiAgg.average)
    aggTotal = Math.max(0, apiAgg.total)
  } else if (Array.isArray(product.reviews) && product.reviews.length > 0) {
    const counts: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let sum = 0
    for (const r of product.reviews) {
      const v = Number(r?.rating ?? 0)
      if (v >= 1 && v <= 5) {
        counts[v as 1 | 2 | 3 | 4 | 5]++
        sum += v
      }
    }
    aggTotal = product.reviews.length
    aggAverage = aggTotal ? clamp01to5(sum / aggTotal) : 0
  } else {
    const ratingNum = typeof product.rating === 'number' ? product.rating : 0
    const count =
      typeof product.reviewCount === 'number'
        ? product.reviewCount
        : typeof product.reviewsCount === 'number'
        ? product.reviewsCount
        : 0
    aggAverage = clamp01to5(ratingNum)
    aggTotal = Math.max(0, count)
  }

  const aggregateRating =
    aggTotal > 0 && aggAverage > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: Number(aggAverage.toFixed(1)),
          reviewCount: aggTotal,
          ratingCount: aggTotal,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined

  // -------- Reviews (optionnels, limités) --------
  let reviewNodes: Array<Record<string, any>> | undefined
  if (maxReviews > 0 && Array.isArray(product.reviews) && product.reviews.length > 0) {
    reviewNodes = product.reviews.slice(0, maxReviews).map((r) => ({
      '@type': 'Review',
      ...(r?.title ? { name: r.title } : {}),
      ...(r?.author ? { author: { '@type': 'Person', name: r.author } } : {}),
      ...(r?.createdAt ? { datePublished: new Date(r.createdAt as any).toISOString() } : {}),
      reviewBody: String(r?.comment ?? ''),
      reviewRating: {
        '@type': 'Rating',
        ratingValue: Number(r?.rating ?? 0),
        bestRating: 5,
        worstRating: 1,
      },
    }))
  }

  const currency = currencyProp || 'EUR'

  const structuredData: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': productUrl,
    url: productUrl,
    name: title,
    description,
    image: images,
    category,
    sku,
    ...(product.gtin13 ? { gtin13: String(product.gtin13) } : {}),
    ...(product.mpn ? { mpn: String(product.mpn) } : {}),
    ...(brand ? { brand: { '@type': 'Brand', name: String(brand) } } : {}),
    ...(aggregateRating ? { aggregateRating } : {}),
    ...(reviewNodes ? { review: reviewNodes } : {}),
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: currency,
      price: priceNumber.toFixed(2),
      availability: avail,
      itemCondition: 'https://schema.org/NewCondition',
      ...(priceValidUntil ? { priceValidUntil } : {}),
      seller: { '@type': 'Organization', name: SELLER_NAME },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'FR',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30,
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'EUR' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'FR' },
      },
    },
  }

  // stringify propre (supprime undefined)
  const json = JSON.stringify(structuredData, (_k, v) => (v === undefined ? undefined : v))

  return (
    <script
      id={`jsonld-product-${slug}`}
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}
