'use client';

import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function LoginForm() {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.ok) {
      toast.success(t('login_success'));
      router.push('/admin/dashboard');
    } else {
      toast.error(t('login_error'));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-md space-y-4 p-4"
      aria-labelledby="login-heading"
    >
      <h2 id="login-heading" className="text-xl font-bold">
        {t('login_title')}
      </h2>

      <div>
        <label htmlFor="login-email" className="mb-1 block text-sm font-medium">
          {t('email')}
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder={t('email_placeholder')}
          className="w-full rounded border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-2 text-[hsl(var(--text))]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-required="true"
        />
      </div>

      <div>
        <label htmlFor="login-password" className="mb-1 block text-sm font-medium">
          {t('password')}
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder={t('password_placeholder')}
          className="w-full rounded border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-2 text-[hsl(var(--text))]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aria-required="true"
        />
      </div>

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded bg-[hsl(var(--accent))] py-2 font-medium text-[hsl(var(--accent-fg))] hover:opacity-95 disabled:opacity-60 transition-opacity"
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
            {t('login_loading')}
          </>
        ) : (
          'Se connecter'
        )}
      </button>
    </form>
  )
}
