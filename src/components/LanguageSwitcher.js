'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

/**
 * Composant switcher de langue FR / EN
 * Fonctionne avec l’App Router + next-intl
 */
export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const changeLanguage = (newLocale) => {
    if (!pathname) return;
    const segments = pathname.split('/');
    segments[1] = newLocale; // remplace la langue actuelle
    const newPath = segments.join('/');
    router.push(newPath);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => changeLanguage('fr')}
        className={`px-2 py-1 rounded ${
          locale === 'fr' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
        } text-sm`}
        aria-pressed={locale === 'fr'}
      >
        🇫🇷 FR
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2 py-1 rounded ${
          locale === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
        } text-sm`}
        aria-pressed={locale === 'en'}
      >
        🇬🇧 EN
      </button>
    </div>
  );
}
