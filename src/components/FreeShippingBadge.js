// ✅ /src/components/FreeShippingBadge.js (badge livraison gratuite dynamique)
export default function FreeShippingBadge({ price }) {
  const free = price >= 39;
  return free ? (
    <span className="ml-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold align-middle shadow-sm animate-bounce">
      Livraison gratuite
    </span>
  ) : null;
}
