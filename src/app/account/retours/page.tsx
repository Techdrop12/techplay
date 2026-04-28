'use client';

import { useEffect, useState, useId } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

type ReturnItem = { productName: string; quantity: number };
type ReturnRecord = {
  _id: string;
  orderRef: string;
  reason: string;
  details?: string;
  status: 'pending' | 'approved' | 'refused' | 'refunded';
  items?: ReturnItem[];
  createdAt: string;
};

const REASON_LABELS: Record<string, string> = {
  defective: 'Produit défectueux',
  wrong_item: 'Mauvais article reçu',
  changed_mind: 'Changement d\'avis',
  damaged: 'Produit endommagé',
  other: 'Autre raison',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:  { label: 'En attente', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  approved: { label: 'Approuvé',   color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
  refused:  { label: 'Refusé',     color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  refunded: { label: 'Remboursé',  color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
};

const REASONS = [
  { value: 'defective',    label: 'Produit défectueux' },
  { value: 'wrong_item',  label: 'Mauvais article reçu' },
  { value: 'changed_mind', label: 'Changement d\'avis' },
  { value: 'damaged',     label: 'Produit endommagé à la livraison' },
  { value: 'other',       label: 'Autre raison' },
] as const;

export default function RetoursPage() {
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [orderRef, setOrderRef] = useState('');
  const [reason, setReason] = useState<string>('defective');
  const [details, setDetails] = useState('');

  const formId = useId();

  useEffect(() => {
    fetch('/api/account/returns', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d: { returns?: ReturnRecord[] }) => setReturns(d.returns ?? []))
      .catch(() => toast.error('Impossible de charger vos retours.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderRef.trim()) { toast.error('Référence de commande requise.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/account/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderRef: orderRef.trim(), reason, details }),
      });
      const data = (await res.json()) as { return?: ReturnRecord; error?: string };
      if (!res.ok) { toast.error(data.error ?? 'Erreur lors de la demande.'); return; }
      setReturns((prev) => [data.return!, ...prev]);
      setShowForm(false);
      setOrderRef(''); setReason('defective'); setDetails('');
      toast.success('Demande de retour envoyée !');
    } catch {
      toast.error('Erreur réseau. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mes retours</h1>
          <p className="mt-1 text-sm text-token-text/65">
            Échanges & remboursements sous 30 jours après réception.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-5 py-2.5 text-[14px] font-semibold text-white shadow transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
        >
          {showForm ? '✕ Annuler' : '+ Nouvelle demande'}
        </button>
      </div>

      {showForm && (
        <form
          id={formId}
          onSubmit={handleSubmit}
          className="mb-8 space-y-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/80 p-5 shadow-sm"
        >
          <h2 className="font-semibold">Nouvelle demande de retour</h2>

          <div>
            <label htmlFor={`${formId}-ref`} className="mb-1 block text-[13px] font-medium">
              Référence de commande <span aria-hidden>*</span>
            </label>
            <input
              id={`${formId}-ref`}
              type="text"
              value={orderRef}
              onChange={(e) => setOrderRef(e.target.value)}
              required
              maxLength={100}
              placeholder="ex. CMD-2025-XXXX"
              className="min-h-[2.75rem] w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/90 px-3.5 py-2.5 text-[14px] focus:border-[hsl(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/.25)]"
            />
            <p className="mt-1 text-[11px] text-token-text/55">
              Retrouvez-la dans votre email de confirmation ou{' '}
              <Link href="/account/mes-commandes" className="underline underline-offset-2">
                dans vos commandes
              </Link>.
            </p>
          </div>

          <div>
            <label htmlFor={`${formId}-reason`} className="mb-1 block text-[13px] font-medium">
              Motif <span aria-hidden>*</span>
            </label>
            <select
              id={`${formId}-reason`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[2.75rem] w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/90 px-3.5 py-2.5 text-[14px] focus:border-[hsl(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/.25)]"
            >
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={`${formId}-details`} className="mb-1 block text-[13px] font-medium">
              Détails (facultatif)
            </label>
            <textarea
              id={`${formId}-details`}
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={1000}
              placeholder="Décrivez le problème ou précisez votre demande…"
              className="min-h-[80px] w-full resize-y rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/90 px-3.5 py-2.5 text-[14px] focus:border-[hsl(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/.25)]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="min-h-[44px] w-full rounded-xl bg-[hsl(var(--accent))] px-5 py-3 text-[15px] font-semibold text-white shadow transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] disabled:opacity-60"
          >
            {submitting ? 'Envoi…' : 'Envoyer la demande'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      ) : returns.length === 0 ? (
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/60 px-6 py-12 text-center">
          <p className="text-sm font-semibold text-token-text">Aucune demande de retour</p>
          <p className="mt-1 text-[13px] text-token-text/60">
            Vous pouvez initier un retour sous 30 jours après réception.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {returns.map((r) => {
            const s = STATUS_LABELS[r.status] ?? STATUS_LABELS.pending;
            return (
              <li
                key={r._id}
                className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/80 px-5 py-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[15px]">Commande : {r.orderRef}</p>
                    <p className="mt-0.5 text-[13px] text-token-text/65">
                      {REASON_LABELS[r.reason] ?? r.reason}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${s.color}`}>
                    {s.label}
                  </span>
                </div>
                {r.details ? (
                  <p className="mt-2 text-[13px] text-token-text/70">{r.details}</p>
                ) : null}
                <p className="mt-2 text-[11px] text-token-text/45">
                  {new Date(r.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
