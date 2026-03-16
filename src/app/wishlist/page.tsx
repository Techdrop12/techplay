import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { LOCALE_COOKIE, isLocale } from '@/lib/language';

/**
 * /wishlist n'existe qu'en version localisée sous [locale]/wishlist.
 * Redirection vers /fr/wishlist ou /en/wishlist selon la locale.
 */
export default async function WishlistRedirect() {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = localeCookie && isLocale(localeCookie) ? localeCookie : 'fr';
  redirect(locale === 'en' ? '/en/wishlist' : '/fr/wishlist');
}
