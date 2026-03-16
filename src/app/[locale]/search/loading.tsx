import { getTranslations } from 'next-intl/server';

export default async function SearchLoading() {
  const t = await getTranslations('search');
  return (
    <div
      className="container-app mx-auto max-w-4xl py-8"
      role="status"
      aria-live="polite"
      aria-label={t('loading_aria')}
    >
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-2/3 rounded-lg bg-[hsl(var(--border))]" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4 rounded-xl border border-[hsl(var(--border))] p-4">
              <div className="h-20 w-20 shrink-0 rounded-lg bg-[hsl(var(--border))]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-full rounded bg-[hsl(var(--border))]" />
                <div className="h-3 w-3/4 rounded bg-[hsl(var(--border))]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
