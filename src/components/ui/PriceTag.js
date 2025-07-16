'use client';

export default function PriceTag({ price }) {
  return (
    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
      {price.toFixed(2)} €
    </span>
  );
}
