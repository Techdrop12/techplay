'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Suspense, useState } from 'react';
import { toast } from 'react-hot-toast';

function CustomerLoginForm() {
  const t = useTranslations('auth');
  const tAccount = useTranslations('account');
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl')?.trim() || '/account';
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setHasError(false);

    const res = await signIn('customer-credentials', {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    setLoading(false);

    if (res?.ok) {
      toast.success(t('login_success'));
      router.push(callbackUrl.startsWith('/') ? callbackUrl : '/account');
      router.refresh();
    } else {
      setHasError(true);
      const detail =
        process.env.NODE_ENV !== 'production' && res?.error
          ? ` (${String(res.error)})`
          : '';
      toast.error(`${t('login_error')}${detail}`);
    }
  };

  const fieldClass = (invalid: boolean) =>
    `w-full rounded-xl border px-4 py-2.5 text-[15px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 bg-[hsl(var(--surface))] ${
      invalid ? 'border-red-500 dark:border-red-400' : 'border-[hsl(var(--border))]'
    }`;

  return (
    <main className="mx-auto max-w-sm px-4 py-10" role="main" aria-labelledby="login-title">
      <div className="overflow-hidden rounded-[var(--radius-2xl)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding shadow-[var(--shadow-md)]">
        <h1 id="login-title" className="heading-page mb-1">
          {t('client_login_title')}
        </h1>
        <p className="mb-6 text-[13px] text-token-text/70">{t('client_login_intro')}</p>

        <form onSubmit={handleSubmit} className="space-y-4" aria-label={t('login_form_label')}>
          <div>
            <label htmlFor="login-email" className="sr-only">{t('email')}</label>
            <input
              id="login-email"
              type="email"
              placeholder={t('email')}
              autoComplete="email"
              aria-invalid={hasError}
              className={fieldClass(hasError)}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setHasError(false); }}
              required
              aria-required
            />
          </div>
          <div>
            <label htmlFor="login-password" className="sr-only">{t('password')}</label>
            <input
              id="login-password"
              type="password"
              placeholder={t('password')}
              autoComplete="current-password"
              aria-invalid={hasError}
              className={fieldClass(hasError)}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setHasError(false); }}
              required
              aria-required
            />
          </div>

          {hasError && (
            <p role="alert" className="text-[13px] text-red-600 dark:text-red-400">
              {t('login_error')}
            </p>
          )}

          <div className="flex items-center justify-end -mt-1">
            <Link
              href="/forgot-password"
              className="text-[12px] text-token-text/60 underline-offset-2 hover:underline hover:text-[hsl(var(--accent))] transition"
            >
              {t('forgot_password')}
            </Link>
          </div>

          <button
            type="submit"
            className="btn-primary w-full rounded-xl bg-[hsl(var(--accent))] px-4 py-2.5 text-[15px] font-semibold text-white shadow-[var(--shadow-md)] transition hover:opacity-90 disabled:opacity-60"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? t('login_loading') : tAccount('sign_in')}
          </button>
        </form>

        <p className="mt-5 text-center text-[13px] text-token-text/65">
          {t('no_account')}{' '}
          <Link
            href="/register"
            className="font-medium text-[hsl(var(--accent))] underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
          >
            {t('register')}
          </Link>
        </p>
        <p className="mt-3 text-center text-[13px] text-token-text/65">
          <Link
            href="/admin/login"
            className="font-medium text-[hsl(var(--accent))] underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
          >
            {t('go_admin_login')}
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-sm px-4 py-16" role="status" aria-live="polite" />}>
      <CustomerLoginForm />
    </Suspense>
  );
}
