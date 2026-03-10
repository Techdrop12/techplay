import type { Product } from '@/types/product'

type ProductReview = {
  rating?: number
  title?: string
  author?: string
  comment?: string
  createdAt?: string | number | Date
}

type ProductAggregateRating = {
  average?: number
  total?: number
  breakdownCount?: Partial<Record<1 | 2 | 3 | 4 | 5, number>>
}

type ProductJsonLdModel = Omit<
  Product,
  'price' | 'image' | 'reviews' | 'aggregateRating' | 'brand' | 'rating' | 'category' | 'stock' | 'sku'
> & {
  price?: number | string
  brand?: string
  rating?: number
  reviewCount?: number
  reviewsCount?: number
  availability?: string
  currency?: string
  image?: string | string[]
  _id?: string
  gtin13?: string
  mpn?: string
  sku?: string
  stock?: number
  promo?: { endDate?: string | number | Date }
  aggregateRating?: ProductAggregateRating
  reviews?: ProductReview[]
}

type Props = {
  product: ProductJsonLdModel
  maxReviews?: number
}

const RAW_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com'
const ORIGIN = RAW_ORIGIN.replace(/\/+$/, '')
const DEF_AVAIL = 'https://schema.org/InStock'
const SELLER_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'TechPlay'

function absUrl(u?: string): string | undefined {
  if (!u) return undefined
  return /^https?:\/\//i.test(u) ? u : `${ORIGIN}${u.startsWith('/') ? '' : '/'}${u}`
}

function clamp01to5(n: number) {
  return Math.max(0, Math.min(5, n))
}

function toIso(value: string | number | Date | undefined): string | undefined {
  if (!value) return undefined
  const d = value instanceof Date ? value : new Date(value)
  return Number.isFinite(d.getTime()) ? d.toISOString() : undefined
}

export default function ProductJsonLd({ product, maxReviews = 0 }: Props) {
  if (!product) return null

  const {
    _id,
    slug = '',
    title = 'Produit',
    description = 'Découvrez ce produit sur notre boutique.',
    image,
    category = 'Produit',
    brand,
    availability,
    currency: currencyProp = 'EUR',
  } = product

  const productPath = `/products/${slug}`
  const productUrl = absUrl(productPath) ?? `${ORIGIN}/products/${slug}`
  const sku = String(_id || product.sku || slug || '')

  const imagesInput = Array.isArray(image) ? image : [image ?? '/placeholder.png']
  const images = imagesInput
    .map((src) => absUrl(src))
    .filter((src): src is string => Boolean(src))

  const finalImages = images.length > 0 ? images : [`${ORIGIN}/placeholder.png`]

  const priceRaw: string | number | undefined = product.price
  const priceNumber =
    typeof priceRaw === 'string'
      ? Number.parseFloat(priceRaw.replace(',', '.')) || 0
      : Number(priceRaw) || 0

  const avail =
    availability ||
    (typeof product.stock === 'number'
      ? product.stock > 0
        ? DEF_AVAIL
        : 'https://schema.org/OutOfStock'
      : DEF_AVAIL)

  const priceValidUntil = toIso(product.promo?.endDate)?.slice(0, 10)
  const apiAgg = product.aggregateRating

  let aggAverage = 0
  let aggTotal = 0

  if (apiAgg && typeof apiAgg.average === 'number' && typeof apiAgg.total === 'number') {
    aggAverage = clamp01to5(apiAgg.average)
    aggTotal = Math.max(0, apiAgg.total)
  } else if (Array.isArray(product.reviews) && product.reviews.length > 0) {
    let sum = 0
    let count = 0

    for (const r of product.reviews) {
      const v = Number(r?.rating ?? 0)
      if (v >= 1 && v <= 5) {
        sum += v
        count += 1
      }
    }

    aggTotal = count
    aggAverage = count ? clamp01to5(sum / count) : 0
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

  let reviewNodes: Array<Record<string, unknown>> | undefined
  if (maxReviews > 0 && Array.isArray(product.reviews) && product.reviews.length > 0) {
    reviewNodes = product.reviews.slice(0, maxReviews).map((r) => {
      const datePublished = toIso(r?.createdAt)

      return {
        '@type': 'Review',
        ...(r?.title ? { name: r.title } : {}),
        ...(r?.author ? { author: { '@type': 'Person', name: r.author } } : {}),
        ...(datePublished ? { datePublished } : {}),
        reviewBody: String(r?.comment ?? ''),
        reviewRating: {
          '@type': 'Rating',
          ratingValue: Number(r?.rating ?? 0),
          bestRating: 5,
          worstRating: 1,
        },
      }
    })
  }

  const currency = (currencyProp || 'EUR').toUpperCase()

  const structuredData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': productUrl,
    url: productUrl,
    name: title,
    description,
    image: finalImages,
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
        shippingRate: { '@type': 'MonetaryAmount', value: 0, currency },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'FR' },
      },
    },
  }

  const json = JSON.stringify(structuredData, (_k, v) => (v === undefined ? undefined : v))

  return (
    <script
      id={`jsonld-product-${slug}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}