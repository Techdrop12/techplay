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
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingName(true);
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
      setSavingName(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t('password_mismatch'));
      return;
    }
    setSavingPwd(true);
    try {
      const res = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erreur');
      toast.success(t('password_updated'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleNameSubmit} className="space-y-5" aria-labelledby="profile-form-heading">
        <h2 id="profile-form-heading" className="text-base font-semibold text-[hsl(var(--text))]">
          {t('profile_section_identity')}
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
          disabled={savingName}
          aria-busy={savingName}
          className="btn-primary rounded-xl px-5 py-2.5 text-[15px] font-semibold shadow-[var(--shadow-sm)] disabled:opacity-60"
        >
          {savingName ? tCommon('saving') : tCommon('save')}
        </button>
      </form>

      <hr className="border-[hsl(var(--border))]" />

      <form
        onSubmit={handlePasswordSubmit}
        className="space-y-5"
        aria-labelledby="password-form-heading"
      >
        <h2 id="password-form-heading" className="text-base font-semibold text-[hsl(var(--text))]">
          {t('profile_section_password')}
        </h2>
        <div>
          <label
            htmlFor="current-password"
            className="block text-sm font-medium text-[hsl(var(--text))] mb-1"
          >
            {t('password_current')}
          </label>
          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
          />
        </div>
        <div>
          <label
            htmlFor="new-password"
            className="block text-sm font-medium text-[hsl(var(--text))] mb-1"
          >
            {t('password_new')}
          </label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            aria-describedby="pwd-hint"
            className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
          />
          <p id="pwd-hint" className="mt-1 text-[13px] text-token-text/60">
            {t('password_hint')}
          </p>
        </div>
        <div>
          <label
            htmlFor="confirm-password"
            className="block text-sm font-medium text-[hsl(var(--text))] mb-1"
          >
            {t('password_confirm')}
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
          />
        </div>
        <button
          type="submit"
          disabled={savingPwd}
          aria-busy={savingPwd}
          className="btn-primary rounded-xl px-5 py-2.5 text-[15px] font-semibold shadow-[var(--shadow-sm)] disabled:opacity-60"
        >
          {savingPwd ? tCommon('saving') : t('password_save_btn')}
        </button>
      </form>
    </div>
  );
}
