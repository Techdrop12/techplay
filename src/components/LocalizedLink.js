'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function LocalizedLink({ href = '/', children, ...props }) {
  const locale = useLocale();

  let finalHref = href;
  if (typeof href === 'string') {
    // Nettoyage : retire la locale si elle est déjà incluse
    const localePattern = new RegExp(`^/${locale}(?=/|$)`);
    finalHref = href.replace(localePattern, '');
    // Force le / initial et ajoute locale
    finalHref = `/${locale}${finalHref.startsWith('/') ? finalHref : '/' + finalHref}`;
  }

  return (
    <Link href={finalHref} {...props}>
      {children}
    </Link>
  );
}
