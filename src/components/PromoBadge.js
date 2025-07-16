export default function PromoBadge({ discount }) {
  if (!discount || discount <= 0) return null;

  return (
    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded shadow">
      −{discount}%
    </div>
  );
}
