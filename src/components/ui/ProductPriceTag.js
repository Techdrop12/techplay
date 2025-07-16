export default function ProductPriceTag({ price }) {
  return (
    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
      {price.toFixed(2)} €
    </div>
  );
}
