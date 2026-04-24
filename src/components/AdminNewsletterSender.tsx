'use client';

import { useState } from 'react';
import { Send, FlaskConical } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminNewsletterSender() {
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);

  async function send(isTest: boolean) {
    if (!subject.trim() || !html.trim()) {
      toast.error('Sujet et contenu requis');
      return;
    }
    if (isTest && !testEmail.trim()) {
      toast.error('Email de test requis');
      return;
    }
    if (!isTest && !confirm('Envoyer à TOUS les abonnés newsletter ?')) return;

    setSending(true);
    try {
      const res = await fetch('/api/admin/newsletter-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          html,
          testEmail: isTest ? testEmail : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Erreur');
      toast.success(
        isTest ? `Email de test envoyé à ${testEmail}` : `Envoyé à ${data?.sent ?? 0} abonnés`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur envoi');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 space-y-4 shadow-[var(--shadow-sm)]">
        <div>
          <label className="text-xs font-semibold text-token-text/70 block mb-1.5">Sujet *</label>
          <input
            type="text"
            placeholder="Nouveau produit disponible chez TechPlay !"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-token-text/70 block mb-1.5">
            Contenu HTML *
          </label>
          <textarea
            rows={14}
            placeholder="<h1>Bonjour !</h1><p>Votre contenu ici...</p>"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-3 py-2 text-sm font-mono resize-y focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          />
        </div>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 space-y-3 shadow-[var(--shadow-sm)]">
        <p className="text-xs font-semibold text-token-text/60 uppercase tracking-wider">
          Test avant envoi
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="votre@email.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="flex-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          />
          <button
            type="button"
            onClick={() => send(true)}
            disabled={sending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm font-medium hover:bg-[hsl(var(--surface-2))] disabled:opacity-50"
          >
            <FlaskConical size={14} /> Envoyer test
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => send(false)}
          disabled={sending}
          className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--accent-fg))] hover:opacity-95 disabled:opacity-50"
        >
          <Send size={15} />
          {sending ? 'Envoi en cours...' : 'Envoyer à tous les abonnés'}
        </button>
      </div>
    </div>
  );
}
