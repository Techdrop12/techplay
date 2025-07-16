export default function SkeletonLoader({ height = 'h-4', width = 'w-full' }) {
  return (
    <div className={`bg-gray-300 dark:bg-gray-700 animate-pulse rounded ${height} ${width}`} />
  );
}
