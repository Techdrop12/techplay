export default function PricingBadge({ discount }) {
  if (!discount || discount <= 0) return null;
  return (
    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
      −{discount}% OFF
    </span>
  );
}
