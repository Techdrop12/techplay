// 📁 /src/app/login/page.js
'use client'
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-6">Connexion</h1>
      <p className="mb-4">Connectez-vous avec votre compte GitHub pour accéder à l’espace administrateur.</p>
      <button
        onClick={() => signIn('github')}
        className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
      >
        Se connecter avec GitHub
      </button>
    </div>
  )
}
