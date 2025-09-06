'use client';

import Link from '@/components/LocalizedLink'

export default function LinkButton({ href, children, className = '', ...props }) {
  return (
    <Link
      href={href}
      className={`inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
