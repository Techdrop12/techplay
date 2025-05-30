'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    const res = await signIn('credentials', {
      redirect: false,
      username,
      password,
    })

    if (res.ok) {
      toast.success('Connexion réussie')
      router.push('/admin')
    } else {
      toast.error('Identifiants invalides')
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20 p-4 border rounded shadow">
      <h1 className="text-xl font-bold mb-4 text-center">Connexion Admin</h1>
      <input
        className="w-full border p-2 mb-3 rounded"
        placeholder="Nom d’utilisateur"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="w-full border p-2 mb-3 rounded"
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="bg-black text-white w-full py-2 rounded"
        onClick={handleLogin}
      >
        Se connecter
      </button>
    </div>
  )
}
