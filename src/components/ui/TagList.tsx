export default function TagList({ tags = [] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, i) => (
        <span
          key={i}
          className="bg-[hsl(var(--surface-2))] px-2 py-1 rounded text-xs text-[hsl(var(--text))]"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}
