export default function ProductHighlightBadge({ label = 'Nouveauté' }) {
  return (
    <span className="inline-block px-2 py-1 text-xs bg-red-600 text-white rounded-full">
      {label}
    </span>
  );
}
