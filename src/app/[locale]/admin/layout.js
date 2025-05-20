'use client'

import { useEffect, useState } from 'react'

export default function AdminLayout({ children }) {
  const [accessGranted, setAccessGranted] = useState(false)

  useEffect(() => {
    const token = prompt("Mot de passe admin :")
    if (token === process.env.NEXT_PUBLIC_ADMIN_TOKEN) {
      setAccessGranted(true)
    } else {
      alert('Accès refusé')
      window.location.href = '/'
    }
  }, [])

  if (!accessGranted) return null

  return <>{children}</>
}
