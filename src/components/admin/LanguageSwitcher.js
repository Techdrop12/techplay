'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const changeLocale = (locale) => {
    const segments = pathname.split('/');
    segments[1] = locale;
    router.push(segments.join('/'));
  };

  return (
    <div className="flex gap-2">
      <button
        className="px-3 py-1 border rounded hover:bg-gray-100 text-sm"
        onClick={() => changeLocale('fr')}
      >
        🇫🇷 Français
      </button>
      <button
        className="px-3 py-1 border rounded hover:bg-gray-100 text-sm"
        onClick={() => changeLocale('en')}
      >
        🇬🇧 English
      </button>
    </div>
  );
}
