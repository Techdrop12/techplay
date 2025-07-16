export default function PriceWithPromo({ price, promo }) {
  const discounted = promo ? price - price * (promo / 100) : price;

  return (
    <div className="flex items-center gap-2">
      {promo > 0 && (
        <span className="line-through text-sm text-gray-400">
          {price.toFixed(2)} €
        </span>
      )}
      <span className="text-lg font-bold text-blue-600">{discounted.toFixed(2)} €</span>
    </div>
  );
}
