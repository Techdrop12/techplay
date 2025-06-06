'use client'; // ← Nécessaire pour utiliser le hook useTranslations()
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function NotFound() {
  const t = useTranslations();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">{t('error.404_title')}</h1>
      <p className="mt-4 text-gray-600">{t('error.404_message')}</p>
      <Link href="/fr">
        <button className="mt-8 px-4 py-2 bg-black text-white rounded">
          {t('error.back_home')}
        </button>
      </Link>
    </div>
  );
}
