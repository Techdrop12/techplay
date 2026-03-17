import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import ContactBottomLinks from '@/components/ContactBottomLinks';
import ContactForm from '@/components/ContactForm';
import Link from '@/components/LocalizedLink';
import { generateMeta } from '@/lib/seo';

const SUPPORT_EMAIL = 'support@techplay.fr';
const SUPPORT_PHONE = '+33 1 84 80 12 34';
const ADDRESS = {
  street: '12 rue de la Boutique',
  postalCode: '75000',
  city: 'Paris',
  country: 'France',
};

const MAILTO_SUBJECT_KEYS = [
  { labelKey: 'subject_order' as const, subject: 'Question commande' },
  { labelKey: 'subject_return' as const, subject: 'Retour / SAV' },
  { labelKey: 'subject_tech' as const, subject: 'Question technique' },
  { labelKey: 'subject_other' as const, subject: 'Contact TechPlay' },
] as const;

const HOURS_KEYS = [
  { joursKey: 'hours_mon_fri' as const, heuresKey: 'hours_9_18' as const },
  { joursKey: 'hours_sat' as const, heuresKey: 'hours_10_16' as const },
  { joursKey: 'hours_sun' as const, heuresKey: 'hours_closed' as const },
] as const;

function mailtoHref(subject: string): string {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('contact');
  return generateMeta({
    title: t('page_title'),
    description: t('page_subtitle'),
    url: '/contact',
    image: '/og-image.jpg',
  });
}

export default async function ContactPage() {
  const t = await getTranslations('contact');
  return (
    <main
      className="container-app mx-auto w-full max-w-3xl pt-24 pb-20 overflow-x-hidden"
      role="main"
      aria-labelledby="contact-title"
    >
      <header className="mb-10 text-center sm:mb-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[hsl(var(--accent))]">
          {t('page_badge')}
        </p>
        <h1 id="contact-title" className="heading-page mt-2">
          {t('page_title')}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-token-text/75">
          {t('page_subtitle')}
        </p>
      </header>

      <div className="space-y-6">
        <section
          className="overflow-hidden rounded-[var(--radius-2xl)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding shadow-sm"
          aria-labelledby="contact-subject-heading"
        >
          <h2 id="contact-subject-heading" className="heading-subsection">
            {t('subject_heading')}
          </h2>
          <p className="mt-2 text-[14px] text-token-text/75">{t('subject_intro')}</p>
          <ul className="mt-4 flex flex-wrap gap-3" role="list">
            {MAILTO_SUBJECT_KEYS.map(({ labelKey, subject }) => (
              <li key={subject}>
                <a
                  href={mailtoHref(subject)}
                  className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-4 py-3 text-[14px] font-medium transition hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <path d="m22 6-10 7L2 6" />
                  </svg>
                  {t(labelKey)}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <ContactForm />

        <section
          className="overflow-hidden rounded-[var(--radius-2xl)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding shadow-sm"
          aria-labelledby="contact-email-heading"
        >
          <h2 id="contact-email-heading" className="text-base font-semibold text-[hsl(var(--text))]">
            {t('email_heading')}
          </h2>
          <p className="mt-2 text-[13px] text-token-text/75">{t('email_intro')}</p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="mt-3 inline-flex w-fit items-center gap-2 rounded-lg border border-[hsl(var(--accent))] bg-[hsl(var(--surface))] px-4 py-2 text-[13px] font-medium text-[hsl(var(--accent))] shadow-sm transition hover:bg-[hsl(var(--accent)/0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <path d="m22 6-10 7L2 6" />
            </svg>
            {SUPPORT_EMAIL}
          </a>
        </section>

        {/* Téléphone + Adresse + Horaires — headings must remain fully readable */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 2xl:grid-cols-3 items-stretch">
          <section
            className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[hsl(var(--border))]/75 bg-[hsl(var(--surface))]/82 px-3.5 py-3.5 sm:px-4 sm:py-4"
            aria-labelledby="contact-phone-heading"
          >
            <h2
              id="contact-phone-heading"
            className="min-w-0 break-normal text-[10px] font-medium uppercase leading-snug tracking-[0.08em] text-token-text/60"
            >
              {t('phone_heading')}
            </h2>
            <a
              href={`tel:${SUPPORT_PHONE.replace(/\s+/g, '')}`}
              className="mt-1.5 inline-flex w-fit max-w-full items-center gap-1.5 text-[12px] font-semibold text-[hsl(var(--accent))] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 rounded break-all"
            >
              <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span className="min-w-0 truncate">{SUPPORT_PHONE}</span>
            </a>
            <p className="mt-1 text-[10px] leading-snug text-token-text/65">{t('phone_hours')}</p>
          </section>

          <section
            className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[hsl(var(--border))]/75 bg-[hsl(var(--surface))]/82 px-3.5 py-3.5 sm:px-4 sm:py-4"
            aria-labelledby="contact-address-heading"
          >
            <h2
              id="contact-address-heading"
              className="min-w-0 break-normal text-[11px] font-medium uppercase leading-snug tracking-[0.12em] text-token-text/60"
            >
              {t('address_heading')}
            </h2>
            <address className="mt-1.5 min-w-0 flex-1 break-words not-italic text-[11px] leading-relaxed text-token-text/75">
              {ADDRESS.street}
              <br />
              {ADDRESS.postalCode} {ADDRESS.city}
              <br />
              {ADDRESS.country}
            </address>
          </section>

          <section
            className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[hsl(var(--border))]/75 bg-[hsl(var(--surface))]/82 px-3.5 py-3.5 sm:px-4 sm:py-4"
            aria-labelledby="contact-hours-heading"
          >
            <h2
              id="contact-hours-heading"
            className="min-w-0 break-normal text-[10px] font-medium uppercase leading-snug tracking-[0.08em] text-token-text/60"
            >
              {t('hours_heading')}
            </h2>
            <dl className="mt-1.5 min-w-0 flex-1 space-y-1.5 text-[11px] text-token-text/78">
              {HOURS_KEYS.map(({ joursKey, heuresKey }) => (
                <div key={joursKey} className="flex min-w-0 justify-between gap-2">
                  <dt className="min-w-0 shrink text-token-text/70">{t(joursKey)}</dt>
                  <dd className="shrink-0 text-right font-medium">{t(heuresKey)}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex min-w-0 gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/60 px-4 py-4">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]"
              aria-hidden="true"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[hsl(var(--text))]">
                {t('reassurance_fast')}
              </p>
              <p className="mt-0.5 text-[12px] text-token-text/70">{t('reassurance_fast_desc')}</p>
            </div>
          </div>
          <div className="flex min-w-0 gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/60 px-4 py-4">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))]"
              aria-hidden="true"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[hsl(var(--text))]">
                {t('reassurance_data')}
              </p>
              <p className="mt-0.5 text-[12px] text-token-text/70">{t('reassurance_data_desc')}</p>
            </div>
          </div>
          <div className="flex min-w-0 gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/60 px-4 py-4">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]"
              aria-hidden="true"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[hsl(var(--text))]">
                {t('reassurance_team')}
              </p>
              <p className="mt-0.5 text-[12px] text-token-text/70">{t('reassurance_team_desc')}</p>
            </div>
          </div>
        </div>

        <section className="overflow-hidden rounded-[var(--radius-2xl)] border border-[hsl(var(--border))]/80 bg-[hsl(var(--surface))]/40 px-5 py-5 sm:px-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-token-text/60">
            {t('waiting_heading')}
          </h2>
          <p className="mt-2 text-[14px] text-token-text/75">
            {t('waiting_intro')}{' '}
            <Link
              href="/#faq"
              className="font-medium text-[hsl(var(--accent))] underline-offset-2 hover:underline"
              prefetch={false}
            >
              {t('faq_link')}
            </Link>{' '}
            {t('waiting_outro')}
          </p>
          <ContactBottomLinks />
        </section>
      </div>
    </main>
  );
}
