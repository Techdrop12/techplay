'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();

  const changeLanguage = (newLocale: string) => {
    if (!pathname) return;
    const segments = pathname.split('/');
    segments[1] = newLocale; // remplace la langue actuelle
    const newPath = segments.join('/');
    router.push(newPath);
  };

  return (
    <div className="flex gap-2">
      {['fr', 'en'].map((lang) => (
        <button
          key={lang}
          onClick={() => changeLanguage(lang)}
          className={`px-2 py-1 rounded text-sm transition ${
            locale === lang
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
          }`}
          aria-pressed={locale === lang}
          aria-label={`Changer la langue vers ${lang === 'fr' ? 'français' : 'anglais'}`}
        >
          {lang === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
        </button>
      ))}
    </div>
  );
}
