interface LowStockWarningProps {
  stock: number | null | undefined;
}

export default function LowStockWarning({ stock }: LowStockWarningProps) {
  if (stock == null || stock > 10) return null;
  return (
    <div className="my-2 text-sm text-red-600 font-semibold animate-pulse">
      {stock > 1 ? `Plus que ${stock} articles en stock !` : `Dernier article disponible !`}
    </div>
  );
}
