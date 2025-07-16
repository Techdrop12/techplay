export default function RatingSummary({ average = 0, total = 0 }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <strong>{average.toFixed(1)} ★</strong>
      <span>({total} avis)</span>
    </div>
  );
}
