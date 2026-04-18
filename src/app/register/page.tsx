'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Suspense, useState } from 'react';

function RegisterForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError(t('register_error_weak'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        if (data.error === 'email_taken') setError(t('register_error_email'));
        else if (data.error === 'weak_password') setError(t('register_error_weak'));
        else setError(t('register_error_generic'));
        setLoading(false);
        return;
      }

      const signInRes = await signIn('customer-credentials', {
        redirect: false,
        email,
        password,
      });

      if (signInRes?.ok) {
        router.push('/account');
        router.refresh();
      } else {
        router.push('/login');
      }
    } catch {
      setError(t('register_error_generic'));
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-sm px-4 py-10" role="main" aria-labelledby="register-title">
      <div className="overflow-hidden rounded-[var(--radius-2xl)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding shadow-[var(--shadow-md)]">
        <h1 id="register-title" className="heading-page mb-1">
          {t('register_title')}
        </h1>
        <p className="mb-6 text-[13px] text-token-text/70">{t('register_intro')}</p>

        <form onSubmit={handleSubmit} className="space-y-4" aria-label={t('register_title')}>
          <div>
            <label htmlFor="reg-name" className="sr-only">{t('register_name')}</label>
            <input
              id="reg-name"
              type="text"
              placeholder={t('register_name_placeholder')}
              autoComplete="name"
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-[15px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="reg-email" className="sr-only">{t('register_email')}</label>
            <input
              id="reg-email"
              type="email"
              placeholder={t('register_email')}
              autoComplete="email"
              aria-invalid={error === t('register_error_email')}
              className={`w-full rounded-xl border px-4 py-2.5 text-[15px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 bg-[hsl(var(--surface))] ${
                error === t('register_error_email')
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-[hsl(var(--border))]'
              }`}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              required
            />
          </div>
          <div>
            <label htmlFor="reg-password" className="sr-only">{t('register_password')}</label>
            <input
              id="reg-password"
              type="password"
              placeholder={t('register_password')}
              autoComplete="new-password"
              aria-describedby="reg-password-hint"
              aria-invalid={error === t('register_error_weak')}
              className={`w-full rounded-xl border px-4 py-2.5 text-[15px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 bg-[hsl(var(--surface))] ${
                error === t('register_error_weak')
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-[hsl(var(--border))]'
              }`}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              required
            />
            <p id="reg-password-hint" className="mt-1 text-[12px] text-token-text/50">
              {t('register_password_hint')}
            </p>
          </div>

          {error && (
            <p role="alert" className="text-[13px] text-red-600 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            className="btn-primary w-full rounded-xl bg-[hsl(var(--accent))] px-4 py-2.5 text-[15px] font-semibold text-white shadow-[var(--shadow-md)] transition hover:opacity-90 disabled:opacity-60"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? t('register_loading') : t('register_cta')}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-token-text/65">
          {t('already_account')}{' '}
          <Link
            href="/login"
            className="font-medium text-[hsl(var(--accent))] underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
          >
            {t('submit_btn')}
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-sm px-4 py-16 text-center text-sm text-token-text/60" role="status" aria-live="polite" />}>
      <RegisterForm />
    </Suspense>
  );
}
