export default function ProductTagBadge({ label }) {
  return (
    <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full mr-1">
      {label}
    </span>
  );
}
