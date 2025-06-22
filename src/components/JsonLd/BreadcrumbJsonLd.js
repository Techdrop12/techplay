// ✅ src/components/JsonLd/BreadcrumbJsonLd.js

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function BreadcrumbJsonLd({ pathSegments = [] }) {
  const pathname = usePathname();

  const itemListElements = pathSegments.map((segment, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: segment.label,
    item: segment.url,
  }));

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: itemListElements,
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [pathname]);

  return null;
}
