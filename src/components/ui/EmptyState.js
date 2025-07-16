'use client';

export default function EmptyState({ message }) {
  return (
    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
      {message}
    </div>
  );
}
