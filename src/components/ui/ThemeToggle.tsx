'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useTheme } from '@/context/themeContext';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-15a1 1 0 0 1 1 1v2h-2V4a1 1 0 0 1 1-1Zm0 15a1 1 0 0 1 1 1v2h-2v-2a1 1 0 0 1 1-1Zm9-7v2h-2v-2h2ZM5 11v2H3v-2h2Zm11.95-5.536 1.414 1.414-1.414 1.414-1.414-1.414 1.414-1.414ZM8.464 15.536l1.414 1.414-1.414 1.414-1.414-1.414 1.414-1.414Zm8.486 2.828-1.414-1.414 1.414-1.414 1.414 1.414-1.414 1.414ZM8.464 8.464 7.05 7.05l1.414-1.414 1.414 1.414-1.414 1.414Z"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M20.742 13.045A8.5 8.5 0 0 1 10.955 3.258 9 9 0 1 0 20.742 13.045Z"
      />
    </svg>
  );
}

export default function ThemeToggle({ className, iconOnly = true, size = 'md' }: Props) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';
  const t = useTranslations('theme');

  if (!mounted) return null;

  const label = isDark ? t('switch_to_light') : t('switch_to_dark');

  const sizeMap = {
    sm: {
      button: 'h-9 min-w-9 px-2 text-sm',
      icon: 'h-4 w-4',
    },
    md: {
      button: 'h-10 min-w-10 px-2.5 text-sm',
      icon: 'h-5 w-5',
    },
    lg: {
      button: 'h-12 min-w-12 px-3 text-base',
      icon: 'h-6 w-6',
    },
  } as const;

  const currentSize = sizeMap[size];

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      aria-pressed={isDark}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full border border-[hsl(var(--border))]',
        'bg-[hsl(var(--surface))]/80 text-token-text backdrop-blur transition',
        'hover:-translate-y-[1px] hover:shadow-md active:translate-y-0 active:scale-[0.98]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2',
        currentSize.button,
        className
      )}
    >
      {isDark ? (
        <SunIcon className={currentSize.icon} />
      ) : (
        <MoonIcon className={currentSize.icon} />
      )}
      {iconOnly ? null : <span className="font-medium">{isDark ? t('light') : t('dark')}</span>}
    </button>
  );
}
