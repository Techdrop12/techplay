export default function ProductBadges({ product }: { product: any }) {
  return (
    <div className="flex gap-2 mt-2">
      {product.freeShipping && (
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
          Livraison gratuite
        </span>
      )}
      {product.isNew && (
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Nouveau</span>
      )}
    </div>
  )
}
