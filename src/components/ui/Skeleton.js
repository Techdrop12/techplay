export default function Skeleton({ width = '100%', height = '1rem', className = '' }) {
  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 animate-pulse rounded ${className}`}
      style={{ width, height }}
    />
  );
}
