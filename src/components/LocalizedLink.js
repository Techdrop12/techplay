// ✅ /src/components/LocalizedLink.js (bonus i18n, navigation)
import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function LocalizedLink({ href, children, ...props }) {
  const locale = useLocale();
  const localHref = `/${locale}${href.startsWith('/') ? href : `/${href}`}`;
  return (
    <Link href={localHref} {...props}>{children}</Link>
  );
}
