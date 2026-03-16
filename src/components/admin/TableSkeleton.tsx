'use client';

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  ariaLabel?: string;
}

export default function TableSkeleton({
  rows = 5,
  cols = 5,
  ariaLabel = 'Chargement du tableau',
}: TableSkeletonProps) {
  return (
    <div
      className="overflow-x-auto p-4 animate-pulse"
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      <table className="w-full min-w-[400px] border-collapse">
        <thead>
          <tr className="border-b border-[hsl(var(--border))]">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-3 py-3 text-left">
                <div className="h-4 w-20 rounded bg-[hsl(var(--border))]" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx} className="border-b border-[hsl(var(--border))]">
              {Array.from({ length: cols }).map((_, colIdx) => (
                <td key={colIdx} className="px-3 py-3">
                  <div
                    className="h-4 rounded bg-[hsl(var(--border))]"
                    style={{ width: colIdx === 0 ? '60%' : colIdx === cols - 1 ? '80px' : '40%' }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
