// src/components/Product/ProductBadges.tsx

type ProductBadgeLike = {
  freeShipping?: boolean
  isNew?: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getProductBadges(product: unknown): ProductBadgeLike {
  if (!isRecord(product)) return {}

  return {
    freeShipping: product.freeShipping === true,
    isNew: product.isNew === true,
  }
}

export default function ProductBadges({ product }: { product: unknown }) {
  const { freeShipping, isNew } = getProductBadges(product)

  if (!freeShipping && !isNew) return null

  return (
    <div className="mt-2 flex gap-2">
      {freeShipping && (
        <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">
          Livraison gratuite
        </span>
      )}

      {isNew && (
        <span className="rounded bg-[hsl(var(--accent)/0.15)] px-2 py-1 text-xs text-[hsl(var(--accent))]">
          Nouveau
        </span>
      )}
    </div>
  )
}