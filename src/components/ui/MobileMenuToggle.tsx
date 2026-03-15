'use client';

import { useTranslations } from 'next-intl';

interface MobileMenuToggleProps {
  open: boolean;
  toggle: () => void;
}

export default function MobileMenuToggle({ open, toggle }: MobileMenuToggleProps) {
  const t = useTranslations('misc');
  return (
    <button onClick={toggle} aria-label={t('menu_aria')} className="sm:hidden">
      {open ? '✖️' : '☰'}
    </button>
  );
}
