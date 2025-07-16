'use client';

import { usePathname } from 'next/navigation';

export default function useBreadcrumbSegments() {
  const pathname = usePathname();
  const segments = pathname
    .split('/')
    .filter(Boolean)
    .map((seg, i, arr) => ({
      name: decodeURIComponent(seg),
      url: '/' + arr.slice(0, i + 1).join('/'),
    }));

  return segments;
}
