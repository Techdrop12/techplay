export default function PromoBadge({ text = 'Promo' }) {
  return (
    <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
      🔥 {text}
    </span>
  );
}
