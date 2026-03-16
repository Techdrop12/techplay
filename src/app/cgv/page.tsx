import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import BackToHomeLink from '@/components/BackToHomeLink';
import Link from '@/components/LocalizedLink';
import { generateMeta } from '@/lib/seo';

const ARTICLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('cgv');
  return generateMeta({
    title: t('title'),
    description: t('meta_description'),
    url: '/cgv',
    image: '/og-image.jpg',
  });
}

export default async function CGVPage() {
  const t = await getTranslations('cgv');

  return (
    <main className="container-app mx-auto max-w-3xl py-10" role="main" aria-labelledby="cgv-title">
      <div className="overflow-hidden rounded-[var(--radius-2xl)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding shadow-[var(--shadow-md)]">
        <h1 id="cgv-title" className="heading-page mb-2">
          {t('title')}
        </h1>
        <p className="mb-6 text-[13px] text-token-text/60">{t('last_updated')}</p>

        <p className="mb-8 leading-relaxed text-[15px] text-token-text/85">{t('intro')}</p>

        <nav
          aria-label={t('toc_title')}
          className="mb-10 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))]/50 px-5 py-4"
        >
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-token-text/70">
            {t('toc_title')}
          </h2>
          <ul className="grid grid-cols-1 gap-1.5 text-[14px] sm:grid-cols-2">
            {ARTICLES.map((n) => {
              const title = t(`art${n}_title`);
              return (
                <li key={n}>
                  <a
                    href={`#article-${n}`}
                    className="text-[hsl(var(--accent))] underline-offset-2 hover:underline"
                  >
                    {title}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="content-readability space-y-10 text-[15px] text-token-text/85">
          {ARTICLES.map((n) => {
            const title = t(`art${n}_title`);
            const content = t(`art${n}_content`);
            const paragraphs = splitParagraphs(content);
            return (
              <section key={n} id={`article-${n}`} className="scroll-mt-24 space-y-3">
                <h2 className="heading-subsection text-[1.1rem] font-semibold text-[hsl(var(--text))]">
                  {title}
                </h2>
                <div className="space-y-2">
                  {paragraphs.map((para, i) => (
                    <p key={i} className="leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
                {n === 9 && (
                  <p className="mt-3">
                    <Link
                      href="/contact"
                      className="font-medium text-[hsl(var(--accent))] underline-offset-2 hover:underline"
                    >
                      → {t('link_contact')}
                    </Link>
                  </p>
                )}
                {(n === 11 || n === 12) && (
                  <p className="mt-3">
                    <Link
                      href="/mentions-legales"
                      className="font-medium text-[hsl(var(--accent))] underline-offset-2 hover:underline"
                    >
                      → {t('link_mentions')}
                    </Link>
                  </p>
                )}
              </section>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-[hsl(var(--border))] pt-8">
          <BackToHomeLink variant="outline" className="focus-visible:ring-offset-2" />
          <span className="text-[14px] text-token-text/60">{t('see_also')} :</span>
          <Link
            href="/mentions-legales"
            className="text-[14px] font-medium text-[hsl(var(--accent))] underline-offset-2 hover:underline"
          >
            {t('link_mentions')}
          </Link>
          <span className="text-token-text/40">·</span>
          <Link
            href="/contact"
            className="text-[14px] font-medium text-[hsl(var(--accent))] underline-offset-2 hover:underline"
          >
            {t('link_contact')}
          </Link>
        </div>
      </div>
    </main>
  );
}
