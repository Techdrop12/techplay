'use client';

import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';

type Props = {
  className?: string;
  children?: React.ReactNode;
};

export default function AccountLogoutButton({ className = '', children }: Props) {
  const t = useTranslations('admin');
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/account' })}
      className={className}
      aria-label={t('logout_aria')}
    >
      {children ?? t('logout_aria')}
    </button>
  );
}
