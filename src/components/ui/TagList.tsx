export default function TagList({ tags = [] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, i) => (
        <span key={i} className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
          #{tag}
        </span>
      ))}
    </div>
  );
}
