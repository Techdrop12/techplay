export default function SkeletonLoader({ lines = 4 }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-300 dark:bg-gray-700 rounded" />
      ))}
    </div>
  );
}
