'use client';

import { cn } from '@/lib/utils';

export type WhyChooseUsItem = {
  title: string;
  description: string;
};

const ICONS = {
  delivery: () => (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden="true" fill="currentColor">
      <path d="M3 6h11a1 1 0 011 1v3h3.8a1 1 0 01.9.6l1.3 3a2 2 0 01.1.8V18a2 2 0 01-2 2h-1a2.5 2.5 0 11-5 0H9.5a2.5 2.5 0 11-5 0H4a2 2 0 01-2-2V8a2 2 0 012-2zm12 4V8H4v10h.5a2.5 2.5 0 015 0H15v-5h3.7l-.8-1.9H15z" />
    </svg>
  ),
  secure: () => (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden="true" fill="currentColor">
      <path d="M12 2a5 5 0 00-5 5v2H6a3 3 0 00-3 3v7a3 3 0 003 3h12a3 3 0 003-3v-7a3 3 0 00-3-3h-1V7a5 5 0 00-5-5zm-3 7V7a3 3 0 116 0v2H9z" />
    </svg>
  ),
  returns: () => (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden="true" fill="currentColor">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10h-2c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8c2.2 0 4.2.9 5.6 2.3L13 11h7V4l-2.4 2.4C16.2 4.3 14.2 3.5 12 3.5z" />
    </svg>
  ),
  support: () => (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden="true" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
    </svg>
  ),
} as const;

const ICON_ORDER: (keyof typeof ICONS)[] = ['delivery', 'secure', 'returns', 'support'];

interface WhyChooseUsSectionProps {
  kicker: string;
  title: string;
  sub?: string;
  items: WhyChooseUsItem[];
  className?: string;
  /** Optional section id for aria-labelledby */
  id?: string;
}

export default function WhyChooseUsSection({
  kicker,
  title,
  sub,
  items,
  className,
  id = 'why-choose-us',
}: WhyChooseUsSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn('section-spacing-sm', className)}
    >
      <header className="mx-auto max-w-2xl text-center">
        <p className="heading-kicker">{kicker}</p>
        <h2 id={`${id}-heading`} className="heading-section mt-3">
          {title}
        </h2>
        {sub ? <p className="heading-section-sub mt-4">{sub}</p> : null}
      </header>
      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.slice(0, 4).map((item, index) => {
          const Icon = ICONS[ICON_ORDER[index] ?? 'delivery'];
          return (
            <div
              key={index}
              className="group flex flex-col gap-3 rounded-2xl border border-[hsl(var(--border))]/50 bg-[hsl(var(--surface))]/80 px-4 py-4 text-left shadow-[0_12px_32px_rgba(15,23,42,0.22)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[hsl(var(--accent)/0.4)] hover:shadow-[0_20px_60px_rgba(15,23,42,0.18)] dark:hover:border-[hsl(var(--accent)/0.5)] sm:px-5 sm:py-5"
            >
              <span className="text-[hsl(var(--accent))] transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
                <Icon />
              </span>
              <p className="text-[15px] font-semibold leading-tight text-[hsl(var(--text))] sm:text-base">
                {item.title}
              </p>
              <p className="text-[13px] leading-relaxed text-[hsl(var(--text))]/70">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
