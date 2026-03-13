interface TitleWithLineProps {
  title: string;
}

export default function TitleWithLine({ title }: TitleWithLineProps) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="h-px flex-1 bg-[hsl(var(--border))]" />
      <h3 className="text-lg font-semibold text-[hsl(var(--text))]">{title}</h3>
      <div className="h-px flex-1 bg-[hsl(var(--border))]" />
    </div>
  );
}
