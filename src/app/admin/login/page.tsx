'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function AdminLoginPage() {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn('admin-credentials', {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.ok) {
      toast.success(t('login_success'));
      router.push('/admin/dashboard');
      router.refresh();
    } else {
      const detail =
        process.env.NODE_ENV !== 'production' && res?.error
          ? ` (${String(res.error)})`
          : '';
      toast.error(`${t('login_error')}${detail}`);
    }
  };

  return (
    <main
      className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12"
      role="main"
      aria-labelledby="admin-login-title"
    >
      <div className="overflow-hidden rounded-[var(--radius-2xl)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-[var(--shadow-md)] sm:p-8">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--accent))]">
          TechPlay
        </p>
        <h1 id="admin-login-title" className="heading-page mb-2">
          {t('login_admin_title')}
        </h1>
        <p className="mb-6 text-[13px] text-token-text/70">{t('admin_login_intro')}</p>

        <form onSubmit={handleSubmit} className="space-y-4" aria-label={t('login_form_label')}>
          <div>
            <label htmlFor="admin-login-email" className="mb-1 block text-sm font-medium">
              {t('email')}
            </label>
            <input
              id="admin-login-email"
              type="email"
              autoComplete="username"
              placeholder={t('email_placeholder')}
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-[15px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="admin-login-password" className="mb-1 block text-sm font-medium">
              {t('password')}
            </label>
            <input
              id="admin-login-password"
              type="password"
              autoComplete="current-password"
              placeholder={t('password_placeholder')}
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-[15px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-required="true"
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full rounded-xl bg-[hsl(var(--accent))] px-4 py-2.5 text-[15px] font-semibold text-white shadow-[var(--shadow-md)] transition hover:opacity-90 disabled:opacity-60"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? t('login_loading') : t('submit_btn')}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-token-text/65">
          <Link
            href="/login"
            className="font-medium text-[hsl(var(--accent))] underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
          >
            {t('go_client_login')}
          </Link>
        </p>
      </div>
    </main>
  );
}
