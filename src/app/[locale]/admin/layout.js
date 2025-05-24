'use client'

import { useEffect, useState } from 'react'

export default function AdminLayout({ children }) {
  const [accessGranted, setAccessGranted] = useState(false)

  useEffect(() => {
    const token = prompt('Mot de passe admin :')
    if (token === process.env.NEXT_PUBLIC_ADMIN_TOKEN) {
      setAccessGranted(true)
    } else {
      alert('Accès refusé')
      window.location.href = '/'
    }
  }, [])

  if (!accessGranted) return null

  return (
    <div className="bg-white text-black dark:bg-zinc-900 dark:text-white min-h-screen px-4 py-4">
      {children}
    </div>
  )
}
