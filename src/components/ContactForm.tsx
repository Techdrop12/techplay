'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

import { contactSchema } from '@/lib/zodSchemas';

type FieldErrors = Partial<Record<string, string>>;

export default function ContactForm() {
  const t = useTranslations('contact');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
    consent: false,
    // Honeypot anti-bot: champ caché qui doit rester vide
    website: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setFieldErrors({});
    const payload = {
      name: form.name.trim() || undefined,
      email: form.email.trim(),
      message: form.message.trim(),
      consent: form.consent,
      website: form.website.trim(),
    };
    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0] as string;
        if (path && !errors[path]) errors[path] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error || t('toast_error');
        setApiError(msg);
        toast.error(msg);
        return;
      }
      setSent(true);
      setForm({ name: '', email: '', message: '', consent: false, website: '' });
      toast.success(t('toast_success'));
    } catch {
      const msg = t('toast_error');
      setApiError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div
        className="rounded-2xl border border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/20 p-6 text-center"
        role="status"
        aria-live="polite"
      >
        <p className="font-semibold text-green-800 dark:text-green-200">{t('message_received')}</p>
        <p className="mt-2 text-[14px] text-green-700 dark:text-green-300">
          {t('message_received_detail')}
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-4 text-sm font-medium text-green-700 dark:text-green-300 underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
        >
          {t('send_another')}
        </button>
      </div>
    );
  }

  const inputErrorClass = 'border-red-500 dark:border-red-400 focus-visible:ring-red-500';
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 overflow-hidden rounded-[var(--radius-2xl)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-sm"
      aria-labelledby="contact-form-heading"
      noValidate
    >
      <h2 id="contact-form-heading" className="heading-subsection">
        {t('form_heading')}
      </h2>
      <p className="text-[14px] text-token-text/75">{t('form_intro')}</p>

      {apiError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200"
        >
          {apiError}
        </div>
      )}

      <div>
        <label
          htmlFor="contact-name"
          className="block text-sm font-medium text-[hsl(var(--text))] mb-1"
        >
          {t('name_label')}
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          className={`w-full rounded-xl border bg-[hsl(var(--surface))] px-4 py-2.5 text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${fieldErrors.name ? inputErrorClass : 'border-[hsl(var(--border))] focus-visible:ring-[hsl(var(--accent))]'}`}
          placeholder={t('name_placeholder')}
          aria-invalid={!!fieldErrors.name}
          aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
        />
        {fieldErrors.name && (
          <p
            id="contact-name-error"
            role="alert"
            className="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {fieldErrors.name}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="contact-email"
          className="block text-sm font-medium text-[hsl(var(--text))] mb-1"
        >
          Email *
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          className={`w-full rounded-xl border bg-[hsl(var(--surface))] px-4 py-2.5 text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${fieldErrors.email ? inputErrorClass : 'border-[hsl(var(--border))] focus-visible:ring-[hsl(var(--accent))]'}`}
          placeholder={t('email_placeholder_contact')}
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
        />
        {fieldErrors.email && (
          <p
            id="contact-email-error"
            role="alert"
            className="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="block text-sm font-medium text-[hsl(var(--text))] mb-1"
        >
          Message *
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          minLength={10}
          value={form.message}
          onChange={handleChange}
          className={`w-full rounded-xl border bg-[hsl(var(--surface))] px-4 py-2.5 text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${fieldErrors.message ? inputErrorClass : 'border-[hsl(var(--border))] focus-visible:ring-[hsl(var(--accent))]'}`}
          placeholder={t('message_placeholder')}
          aria-invalid={!!fieldErrors.message}
          aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
        />
        {fieldErrors.message ? (
          <p
            id="contact-message-error"
            role="alert"
            className="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {fieldErrors.message}
          </p>
        ) : (
          <p className="mt-1 text-[12px] text-token-text/60">{t('min_chars')}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          id="contact-consent"
          name="consent"
          type="checkbox"
          checked={form.consent}
          onChange={handleChange}
          className="rounded border-[hsl(var(--border))] text-[hsl(var(--accent))] focus:ring-[hsl(var(--accent))]"
        />
        <label htmlFor="contact-consent" className="text-sm text-token-text/80">
          J&apos;accepte que mes données soient utilisées pour me recontacter.
        </label>
      </div>

      {/* Champ honeypot discret pour piéger les bots (non visible pour l'utilisateur) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-website">Votre site web</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          autoComplete="off"
          value={form.website}
          onChange={handleChange}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="btn-primary w-full rounded-xl px-5 py-3 text-[15px] font-semibold shadow-[var(--shadow-md)] disabled:opacity-60"
      >
        {loading ? t('sending_btn') : t('submit_btn')}
      </button>
    </form>
  );
}
