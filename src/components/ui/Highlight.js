'use client';

export default function Highlight({ children }) {
  return (
    <span className="bg-yellow-200 text-yellow-900 px-1 rounded">
      {children}
    </span>
  );
}
