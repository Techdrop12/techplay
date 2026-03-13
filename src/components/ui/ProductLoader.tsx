export default function ProductLoader() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded p-4 shadow">
          <div className="h-32 bg-gray-300 dark:bg-gray-700 mb-4" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 w-3/4 mb-2" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 w-1/2" />
        </div>
      ))}
    </div>
  );
}
