'use client';

import { AlertTriangle, ImageOff, LayoutTemplate, PackageMinus, ShoppingCart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

type HealthData = {
  lowStockCount: number;
  noImageCount: number;
  draftReviewsCount: number;
  pagesCount: number;
  recentOrdersCount: number;
  generatedAt?: string;
};

type HealthItem = {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  href: string;
  count: number;
  tone: 'danger' | 'warning' | 'info';
};

export default function AdminHealthBlock() {
  const t = useTranslations('admin');
  const [data, setData] = useState<HealthData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/admin/health')
      .then((res) => res.json())
      .then((res) => {
        if (res?.ok === false) {
          setError(true);
          return;
        }
        setData(res);
      })
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/80 dark:border-red-900/60 dark:bg-red-950/40 p-4 text-sm text-red-700 dark:text-red-200">
        {t('health_error')}
      </div>
    );
  }

  if (!data) {
    return (
      <p className="text-token-text/60 text-sm animate-pulse" aria-live="polite">
        {t('health_loading')}
      </p>
    );
  }

  const items: HealthItem[] = [
    {
      id: 'low-stock',
      icon: <PackageMinus className="h-4 w-4" />,
      label: t('health_low_stock_title'),
      description: t('health_low_stock_desc'),
      href: '/admin/produits',
      count: data.lowStockCount,
      tone: data.lowStockCount > 0 ? 'warning' : 'info',
    },
    {
      id: 'no-image',
      icon: <ImageOff className="h-4 w-4" />,
      label: t('health_no_image_title'),
      description: t('health_no_image_desc'),
      href: '/admin/produits',
      count: data.noImageCount,
      tone: data.noImageCount > 0 ? 'warning' : 'info',
    },
    {
      id: 'pending-reviews',
      icon: <AlertTriangle className="h-4 w-4" />,
      label: t('health_reviews_title'),
      description: t('health_reviews_desc'),
      href: '/admin/avis',
      count: data.draftReviewsCount,
      tone: data.draftReviewsCount > 0 ? 'warning' : 'info',
    },
    {
      id: 'pages',
      icon: <LayoutTemplate className="h-4 w-4" />,
      label: t('health_pages_title'),
      description: t('health_pages_desc'),
      href: '/admin/pages',
      count: data.pagesCount,
      tone: data.pagesCount === 0 ? 'warning' : 'info',
    },
    {
      id: 'recent-orders',
      icon: <ShoppingCart className="h-4 w-4" />,
      label: t('health_recent_orders_title'),
      description: t('health_recent_orders_desc'),
      href: '/admin/commandes',
      count: data.recentOrdersCount,
      tone: 'info',
    },
  ];

  return (
    <section
      aria-label={t('health_section_aria')}
      className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 shadow-[var(--shadow-sm)]"
    >
      <header className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-token-text/60">
            {t('health_title_eyebrow')}
          </p>
          <p className="text-sm font-semibold text-[hsl(var(--text))]">
            {t('health_title')}
          </p>
        </div>
        {data.generatedAt && (
          <p className="text-[11px] text-token-text/50">
            {t('health_generated_at', {
              date: new Date(data.generatedAt).toLocaleString(),
            })}
          </p>
        )}
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const isZero = item.count === 0;
          const baseTone =
            item.tone === 'danger'
              ? 'border-red-200 bg-red-50/80 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100'
              : item.tone === 'warning'
                ? 'border-amber-200 bg-amber-50/80 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-50'
                : 'border-emerald-200 bg-emerald-50/80 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-50';

          const toneClasses = isZero ? 'border-emerald-200 bg-emerald-50/80 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-50' : baseTone;

          return (
            <a
              key={item.id}
              href={item.href}
              className={`group rounded-lg border px-3 py-2.5 text-xs transition hover:shadow-[var(--shadow-sm)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 ${toneClasses}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/70 text-xs text-current shadow-sm dark:bg-black/20">
                    {item.icon}
                  </span>
                  <span className="font-semibold">{item.label}</span>
                </div>
                <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-current dark:bg-white/10">
                  {item.count}
                </span>
              </div>
              <p className="text-[11px] leading-snug opacity-80 group-hover:opacity-100">
                {item.description}
              </p>
            </a>
          );
        })}
      </div>
    </section>
  );
}

