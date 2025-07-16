'use client';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <nav aria-label="Pagination" className="flex justify-center space-x-2 my-4">
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? 'page' : undefined}
          className={`px-3 py-1 rounded ${page === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          {page}
        </button>
      ))}
    </nav>
  );
}
