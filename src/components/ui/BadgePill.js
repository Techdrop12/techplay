'use client';

export default function BadgePill({ children }) {
  return (
    <span className="inline-block bg-blue-600 text-white rounded-full px-3 py-1 text-xs font-semibold">
      {children}
    </span>
  );
}
