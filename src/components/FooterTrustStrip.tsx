'use client';

import { useTranslations } from 'next-intl';

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      />
    </svg>
  );
}

export default function FooterTrustStrip() {
  const t = useTranslations('footer');
  const label = t('trust_strip');

  return (
    <section
      aria-label={label}
      className="border-t border-token-border/70 bg-gradient-to-b from-token-surface/95 to-token-surface/75 text-token-text backdrop-blur-sm"
    >
      <div className="mx-auto max-w-screen-xl px-4 py-3.5 sm:px-6 sm:py-4">
        <p className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-medium tracking-wide text-token-text/80 sm:text-xs">
          <StarIcon className="h-3.5 w-3.5 text-amber-500 sm:h-4 sm:w-4" />
          <span>{label}</span>
        </p>
      </div>
    </section>
  );
}
