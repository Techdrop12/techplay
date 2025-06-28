// ✅ /src/lib/useBreadcrumbSegments.js (hook pour générer les segments du fil d’Ariane)
import { useRouter } from 'next/navigation';

export default function useBreadcrumbSegments(locale, customSegments = []) {
  const router = useRouter();
  // Par défaut : Accueil > ... > Dernier segment
  let path = router?.asPath || '/';
  if (typeof window !== 'undefined') path = window.location.pathname;

  // Nettoie le path pour extraire les segments
  const segments = path
    .split('/')
    .filter((seg) => seg && seg !== locale)
    .map((seg, idx, arr) => ({
      label: seg,
      url: '/' + [locale, ...arr.slice(0, idx + 1)].join('/'),
    }));

  // Fusionne avec customSegments si fournis
  return customSegments.length > 0 ? customSegments : segments;
}
