export default function PricingHighlight({ oldPrice, newPrice }) {
  return (
    <div className="flex items-center gap-2">
      {oldPrice && <span className="line-through text-gray-400">{oldPrice.toFixed(2)} €</span>}
      <span className="text-lg font-bold text-green-600">{newPrice.toFixed(2)} €</span>
    </div>
  );
}
