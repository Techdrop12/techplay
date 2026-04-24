'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Settings, User, Shield, Globe, Wrench } from 'lucide-react';

type EnvStatus = {
  MONGODB_URI: boolean;
  NEXTAUTH_SECRET: boolean;
  BREVO_API_KEY: boolean;
  STRIPE_SECRET_KEY: boolean;
  FIREBASE_PROJECT_ID: boolean;
  NODE_ENV: string;
  MAINTENANCE: string;
};

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[var(--shadow-sm)] overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--surface-2))]">
        <span className="text-[hsl(var(--accent))]">{icon}</span>
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="p-5 space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[hsl(var(--border))] last:border-0">
      <span className="text-sm text-token-text/60">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function EnvRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[hsl(var(--border))] last:border-0">
      <span className="text-sm text-token-text/60 font-mono text-xs">{label}</span>
      <span className={`text-xs font-semibold ${ok ? 'text-green-500' : 'text-red-500'}`}>
        {ok ? '✓ Configuré' : '✗ Manquant'}
      </span>
    </div>
  );
}

export default function AdminParametres() {
  const { data: session } = useSession();
  const [env, setEnv] = useState<EnvStatus | null>(null);

  useEffect(() => {
    fetch('/api/admin/env-status')
      .then((r) => r.json())
      .then((d) => setEnv(d ?? null))
      .catch(() => setEnv(null));
  }, []);

  return (
    <div className="grid gap-5 max-w-2xl">
      <Section icon={<User size={16} />} title="Compte admin">
        <Row label="Email" value={session?.user?.email ?? '—'} />
        <Row label="Rôle" value={(session?.user as { role?: string })?.role ?? '—'} />
        <Row label="Nom" value={session?.user?.name ?? '—'} />
      </Section>

      <Section icon={<Globe size={16} />} title="Site">
        <Row label="URL" value={process.env.NEXT_PUBLIC_SITE_URL ?? '—'} />
        <Row label="Environnement" value={env?.NODE_ENV ?? '…'} />
      </Section>

      <Section icon={<Wrench size={16} />} title="Maintenance">
        <Row
          label="Mode maintenance"
          value={env ? (env.MAINTENANCE === 'true' ? 'Activé' : 'Désactivé') : '…'}
        />
        <p className="text-xs text-token-text/50">
          Pour activer/désactiver, modifiez{' '}
          <code className="bg-[hsl(var(--surface-2))] px-1 py-0.5 rounded text-[11px]">MAINTENANCE</code>{' '}
          dans Vercel → Environment Variables, puis redéployez.
        </p>
      </Section>

      <Section icon={<Shield size={16} />} title="Sécurité">
        <p className="text-sm text-token-text/60">
          Pour changer le mot de passe admin, générez un nouveau hash bcrypt et mettez à jour{' '}
          <code className="bg-[hsl(var(--surface-2))] px-1 py-0.5 rounded text-[11px]">ADMIN_PASSWORD_HASH</code>{' '}
          dans Vercel puis redéployez.
        </p>
        <p className="text-sm text-token-text/60">
          Pour changer l'email admin, mettez à jour{' '}
          <code className="bg-[hsl(var(--surface-2))] px-1 py-0.5 rounded text-[11px]">ADMIN_EMAIL</code>{' '}
          dans Vercel.
        </p>
      </Section>

      <Section icon={<Settings size={16} />} title="Variables d'environnement">
        {env ? (
          <>
            <EnvRow label="MONGODB_URI" ok={env.MONGODB_URI} />
            <EnvRow label="NEXTAUTH_SECRET" ok={env.NEXTAUTH_SECRET} />
            <EnvRow label="BREVO_API_KEY" ok={env.BREVO_API_KEY} />
            <EnvRow label="STRIPE_SECRET_KEY" ok={env.STRIPE_SECRET_KEY} />
            <EnvRow label="FIREBASE_PROJECT_ID" ok={env.FIREBASE_PROJECT_ID} />
          </>
        ) : (
          <div className="h-32 rounded-lg bg-[hsl(var(--surface-2))] animate-pulse" />
        )}
      </Section>
    </div>
  );
}
