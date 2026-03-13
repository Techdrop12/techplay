'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <nav aria-label="Pagination" className="flex justify-center space-x-2 my-4">
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? 'page' : undefined}
          className={`px-3 py-1 rounded-lg ${page === currentPage ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))]' : 'bg-[hsl(var(--surface-2))]'}`}
        >
          {page}
        </button>
      ))}
    </nav>
  );
}
