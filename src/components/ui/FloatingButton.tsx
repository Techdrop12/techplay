'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function FloatingButton({ href = '/', label }: { href?: string; label?: string }) {
  const router = useRouter();
  const t = useTranslations('common');
  const displayLabel = label ?? `⬅ ${t('back_to_home')}`;
  return (
    <button
      onClick={() => router.push(href)}
      className="fixed bottom-6 right-6 bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] px-4 py-2 rounded-full shadow-[var(--shadow-md)] hover:opacity-95 transition"
    >
      {displayLabel}
    </button>
  );
}
