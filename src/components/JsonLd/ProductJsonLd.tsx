// src/components/JsonLd/ProductJsonLd.tsx
import type { Product } from '@/types/product'

type Props = {
  product: Product & {
    brand?: string
    rating?: number
    reviewCount?: number
    availability?: string // ex: 'https://schema.org/InStock'
    currency?: string
    image?: string | string[]
    _id?: string
    // on lit ces champs s'ils existent sans les imposer dans le type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [k: string]: any
  }
}

const RAW_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com'
const ORIGIN = RAW_ORIGIN.replace(/\/+$/, '') // sans trailing slash
const DEF_AVAIL = 'https://schema.org/InStock'

function absUrl(u?: string) {
  if (!u) return undefined
  return /^https?:\/\//i.test(u) ? u : `${ORIGIN}${u.startsWith('/') ? '' : '/'}${u}`
}

export default function ProductJsonLd({ product }: Props) {
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
    rating,
    reviewCount,
    availability,
    currency = 'EUR',
  } = product

  const productPath = `/products/${slug}`
  const productUrl = absUrl(productPath)
  const sku = String(_id || slug || '')
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

  // si promo avec date de fin, expose priceValidUntil
  const priceValidUntil =
    product?.promo?.endDate ? new Date(product.promo.endDate).toISOString().slice(0, 10) : undefined

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
    ...(brand ? { brand: { '@type': 'Brand', name: String(brand) } } : {}),
    ...(typeof rating === 'number' && typeof reviewCount === 'number'
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: Number(rating.toFixed(1)),
            reviewCount: reviewCount,
          },
        }
      : {}),
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: currency,
      price: priceNumber.toFixed(2),
      availability: avail,
      itemCondition: 'https://schema.org/NewCondition',
      ...(priceValidUntil ? { priceValidUntil } : {}),
      seller: { '@type': 'Organization', name: 'TechPlay' },
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

  // stringify propre (enlève undefined)
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
