export default function ProductScore({ score }) {
  if (!score) return null;
  const percentage = Math.round(score * 20);
  return (
    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
      Score IA : <span className="font-semibold">{percentage}%</span>
    </div>
  );
}
