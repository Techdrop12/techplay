'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await signIn('credentials', { email, password, callbackUrl: '/' })
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-10" role="main" aria-labelledby="login-title">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding shadow-[var(--shadow-md)]">
        <h1 id="login-title" className="heading-page mb-6">
          Connexion admin
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Formulaire de connexion">
          <div>
            <label htmlFor="login-email" className="sr-only">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="Email"
              autoComplete="email"
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-[15px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required
            />
          </div>
          <div>
            <label htmlFor="login-password" className="sr-only">
              Mot de passe
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="Mot de passe"
              autoComplete="current-password"
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-[15px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-[hsl(var(--accent))] px-4 py-2.5 text-[15px] font-semibold text-[hsl(var(--accent-fg))] shadow-[var(--shadow-md)] transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
          >
            Se connecter
          </button>
        </form>
      </div>
    </main>
  )
}
