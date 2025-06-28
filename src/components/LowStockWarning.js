// ✅ /src/components/LowStockWarning.js (alerte stock bas, bonus urgence)
export default function LowStockWarning({ stock }) {
  if (stock == null || stock > 10) return null;
  return (
    <div className="my-2 text-sm text-red-600 font-semibold animate-pulse">
      {stock > 1
        ? `Plus que ${stock} articles en stock !`
        : `Dernier article disponible !`}
    </div>
  );
}
