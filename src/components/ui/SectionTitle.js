'use client';

export default function SectionTitle({ children }) {
  return (
    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
      {children}
    </h2>
  );
}
