export default function StockWarning({ stock }) {
  if (stock > 10) return null;

  return (
    <p className="text-sm text-yellow-600 mt-1">
      {stock <= 0
        ? 'Rupture de stock imminente'
        : `⚠️ Plus que ${stock} en stock !`}
    </p>
  );
}
