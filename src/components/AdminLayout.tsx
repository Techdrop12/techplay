'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { ReactNode } from 'react';

import AdminHeader from '@/components/AdminHeader';
import AdminSidebar from '@/components/AdminSidebar';
import { ToastSystem } from '@/components/ToastSystem';

interface AdminLayoutProps {
  children?: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [accessGranted, setAccessGranted] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkAdmin() {
      try {
        const res = await fetch('/api/admin/verify', { credentials: 'include' });
        if (cancelled) return;
        if (res.ok) {
          setAccessGranted(true);
        } else {
          router.replace('/login?callbackUrl=/admin');
        }
      } catch {
        if (!cancelled) router.replace('/login?callbackUrl=/admin');
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    checkAdmin();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center text-sm text-token-text/60">
        Vérification des droits d'accès...
      </div>
    );
  }

  if (!accessGranted) return null;

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <AdminHeader />
        <ToastSystem />
        {children}
      </main>
    </div>
  );
}
