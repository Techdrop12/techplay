// ✅ src/components/AdminLayout.js
'use client'

import { useEffect, useState } from 'react'
import ToastContainer from '@/components/ToastContainer'
import AdminSidebar from '@/components/AdminSidebar'
import AdminHeader from '@/components/AdminHeader'

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
    <div className="min-h-screen bg-zinc-900 text-white flex">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <AdminHeader />
        <ToastContainer />
        {children}
      </div>
    </div>
  )
}
