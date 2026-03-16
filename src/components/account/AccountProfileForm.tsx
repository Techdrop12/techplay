'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface AccountProfileFormProps {
  defaultName: string;
  defaultEmail: string;
}

export default function AccountProfileForm({ defaultName, defaultEmail }: AccountProfileFormProps) {
  const t = useTranslations('account');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erreur');
      toast.success(t('profile_updated'));
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" aria-labelledby="profile-form-heading">
      <h2 id="profile-form-heading" className="sr-only">
        {t('profile')}
      </h2>
      <div>
        <label
          htmlFor="profil-email"
          className="block text-sm font-medium text-[hsl(var(--text))] mb-1"
        >
          {t('profile_email_label')}
        </label>
        <input
          id="profil-email"
          type="email"
          value={defaultEmail}
          readOnly
          className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-4 py-2.5 text-[15px] text-token-text/70 cursor-not-allowed"
          aria-describedby="profil-email-note"
        />
        <p id="profil-email-note" className="mt-1 text-[13px] text-token-text/60">
          {t('profile_email_note')}
        </p>
      </div>
      <div>
        <label
          htmlFor="profil-name"
          className="block text-sm font-medium text-[hsl(var(--text))] mb-1"
        >
          {t('profile_display_name')}
        </label>
        <input
          id="profil-name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
          placeholder={t('profile_display_name_placeholder')}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="rounded-xl bg-[hsl(var(--accent))] px-5 py-2.5 text-[15px] font-semibold text-[hsl(var(--accent-fg))] shadow-[var(--shadow-sm)] transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 disabled:opacity-60"
      >
        {loading ? tCommon('saving') : tCommon('save')}
      </button>
    </form>
  );
}
