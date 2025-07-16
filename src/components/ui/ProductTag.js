export default function ProductTag({ label }) {
  return (
    <span className="inline-block px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-full">
      {label}
    </span>
  );
}
