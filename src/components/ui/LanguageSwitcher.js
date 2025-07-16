'use client';
import { usePathname, useRouter } from 'next/navigation';

export default function LanguageSwitcher() {
  const router = useRouter();
  const path = usePathname();

  const switchLocale = () => {
    const segments = path.split('/');
    const current = segments[1];
    const newLocale = current === 'fr' ? 'en' : 'fr';
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  return (
    <button onClick={switchLocale} className="text-sm text-gray-700 hover:underline">
      🌍 Changer de langue
    </button>
  );
}
