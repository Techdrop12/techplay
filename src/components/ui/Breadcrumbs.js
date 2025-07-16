'use client';

import Link from 'next/link';

export default function Breadcrumbs({ segments }) {
  return (
    <nav className="text-sm text-gray-500 space-x-1">
      {segments.map((segment, i) => (
        <span key={i}>
          {i > 0 && ' / '}
          {segment.href ? (
            <Link href={segment.href} className="hover:underline text-blue-600">
              {segment.label}
            </Link>
          ) : (
            <span className="text-gray-700">{segment.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
