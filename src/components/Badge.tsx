export default function Badge({ text }: { text: string }) {
  return (
    <span className="bg-[hsl(var(--text))] text-[hsl(var(--surface))] text-xs px-2 py-1 rounded-full uppercase tracking-wider">
      {text}
    </span>
  );
}
