// src/components/LocalizedLink.js
'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function LocalizedLink({ href, children, ...props }) {
  const locale = useLocale();
  // On nettoie le href pour qu’il commence par "/"
  const cleaned = href.startsWith('/') ? href : '/' + href;
  // On préfixe par la locale courante
  const localizedHref = `/${locale}${cleaned}`;

  return (
    <Link href={localizedHref} {...props}>
      {children}
    </Link>
  );
}
