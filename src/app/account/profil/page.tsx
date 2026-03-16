import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

import AccountProfileForm from '@/components/account/AccountProfileForm';
import Link from '@/components/LocalizedLink';
import { getSession } from '@/lib/auth';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('account');
  return {
    title: `${t('profile_page_title')} – TechPlay`,
    description: t('profile_meta_description'),
    robots: { index: false, follow: false },
  };
}

export default async function AccountProfilPage() {
  const t = await getTranslations('account');
  const session = await getSession();
  const isLoggedIn = Boolean(session?.user?.email?.trim());
  if (!isLoggedIn) {
    redirect('/login');
  }

  const name = session?.user?.name ?? '';
  const email = session?.user?.email ?? '';

  return (
    <main
      className="container-app mx-auto max-w-xl px-4 pt-24 pb-20 sm:px-6"
      role="main"
      aria-labelledby="profil-title"
    >
      <header className="mb-8">
        <Link
          href="/account"
          className="text-[14px] text-token-text/70 hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
        >
          {t('back_to_account_link')}
        </Link>
        <h1 id="profil-title" className="heading-page mt-3">
          {t('profile_page_title')}
        </h1>
        <p className="mt-1 text-[15px] text-token-text/70">{t('profile_intro')}</p>
      </header>

      <section
        className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-[var(--shadow-sm)]"
        aria-labelledby="profil-form-heading"
      >
        <h2 id="profil-form-heading" className="sr-only">
          Formulaire profil
        </h2>
        <AccountProfileForm defaultName={name} defaultEmail={email} />
      </section>
    </main>
  );
}
