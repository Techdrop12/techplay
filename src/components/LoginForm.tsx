'use client';

import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function LoginForm() {
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
      toast.success('Connexion réussie');
      router.push('/admin');
    } else {
      toast.error('Identifiants incorrects');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-md space-y-4 p-4"
      aria-labelledby="login-heading"
    >
      <h2 id="login-heading" className="text-xl font-bold">
        Connexion administrateur
      </h2>

      <div>
        <label htmlFor="login-email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="Email"
          className="w-full rounded border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-2 text-[hsl(var(--text))]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-required="true"
        />
      </div>

      <div>
        <label htmlFor="login-password" className="mb-1 block text-sm font-medium">
          Mot de passe
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="Mot de passe"
          className="w-full rounded border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-2 text-[hsl(var(--text))]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aria-required="true"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded bg-[hsl(var(--accent))] py-2 font-medium text-[hsl(var(--accent-fg))] hover:opacity-95 disabled:opacity-60"
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  )
}
