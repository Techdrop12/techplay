'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Suspense, useState } from 'react';

function ForgotPasswordForm() {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setSent(true);
  };

  return (
    <main className="mx-auto max-w-sm px-4 py-10" role="main" aria-labelledby="forgot-title">
      <div className="overflow-hidden rounded-[var(--radius-2xl)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding shadow-[var(--shadow-md)]">
        <h1 id="forgot-title" className="heading-page mb-1">
          {t('forgot_password_title')}
        </h1>
        <p className="mb-6 text-[13px] text-token-text/70">{t('forgot_password_intro')}</p>

        {sent ? (
          <div role="status" aria-live="polite" className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--accent)/0.08)] px-4 py-4 text-[14px] text-token-text/80">
            {t('forgot_password_sent')}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="forgot-email" className="sr-only">{t('email')}</label>
              <input
                id="forgot-email"
                type="email"
                placeholder={t('email')}
                autoComplete="email"
                className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-[15px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full rounded-xl bg-[hsl(var(--accent))] px-4 py-2.5 text-[15px] font-semibold text-white shadow-[var(--shadow-md)] transition hover:opacity-90 disabled:opacity-60"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? t('login_loading') : t('forgot_password_cta')}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-[13px] text-token-text/65">
          <Link
            href="/login"
            className="font-medium text-[hsl(var(--accent))] underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
          >
            {t('back_to_login')}
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-sm px-4 py-16" role="status" aria-live="polite" />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
