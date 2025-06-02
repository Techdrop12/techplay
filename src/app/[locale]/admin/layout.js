'use client'

import { useEffect, useState } from 'react'

export default function AdminLayout({ children }) {
  const [accessGranted, setAccessGranted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('admin_access')
    const token = stored || prompt('Mot de passe admin :')

    if (token === process.env.NEXT_PUBLIC_ADMIN_TOKEN) {
      localStorage.setItem('admin_access', token)
      setAccessGranted(true)
    } else {
      alert('Accès refusé')
      window.location.href = '/'
    }
  }, [])

  if (!accessGranted) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center text-sm text-gray-500">
        Vérification des droits d'accès...
      </div>
    )
  }

  return (
    <div className="bg-white text-black dark:bg-zinc-900 dark:text-white min-h-screen px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Espace Admin 🔐</h1>
      {children}
    </div>
  )
}
