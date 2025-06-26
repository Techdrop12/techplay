// ✅ src/components/LowStockWarning.js

export default function LowStockWarning({ stock }) {
  if (!stock || stock > 7) return null;
  return (
    <div className="bg-yellow-100 text-yellow-800 rounded px-3 py-2 mb-2 text-sm font-medium animate-pulse">
      {stock <= 2
        ? "🚨 Attention, il ne reste plus que 2 exemplaires !"
        : `Stock limité : il ne reste plus que ${stock} exemplaires.`}
    </div>
  );
}
