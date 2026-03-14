export default function PulseLoader() {
  return (
    <div className="flex gap-2 items-center justify-center py-8">
      <span className="h-4 w-4 bg-[hsl(var(--accent))] rounded-full animate-pulse" />
      <span className="h-4 w-4 bg-[hsl(var(--accent))] rounded-full animate-pulse delay-75" />
      <span className="h-4 w-4 bg-[hsl(var(--accent))] rounded-full animate-pulse delay-150" />
    </div>
  );
}
