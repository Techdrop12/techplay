export default function ProductTags({ tags = [] }) {
  if (!tags.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {tags.map((tag, i) => (
        <span
          key={i}
          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}
