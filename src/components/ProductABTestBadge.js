export default function ProductABTestBadge({ variant }) {
  return (
    <span className="text-xs ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 rounded">
      Variante {variant}
    </span>
  );
}
