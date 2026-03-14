interface ProductLabelProps {
  text: string;
}

export default function ProductLabel({ text }: ProductLabelProps) {
  return (
    <span className="inline-block bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] px-2 py-1 text-xs font-semibold rounded">
      {text}
    </span>
  );
}
