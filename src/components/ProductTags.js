export default function ProductTags({ tags = [] }) {
  if (!tags.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {tags.map((tag) => (
        <span key={tag} className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2 py-1 rounded">
          #{tag}
        </span>
      ))}
    </div>
  );
}
