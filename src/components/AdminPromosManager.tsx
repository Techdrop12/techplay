'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag } from 'lucide-react';
import { toast } from 'react-hot-toast';

type Coupon = {
  _id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
};

const empty = {
  code: '',
  type: 'percent' as 'percent' | 'fixed',
  value: '',
  minOrder: '',
  maxUses: '',
  expiresAt: '',
};

export default function AdminPromosManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/promos')
      .then((r) => r.json())
      .then((d) => setCoupons(Array.isArray(d?.coupons) ? d.coupons : []))
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code || !form.value) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          value: Number(form.value),
          minOrder: form.minOrder ? Number(form.minOrder) : 0,
          maxUses: form.maxUses ? Number(form.maxUses) : null,
          expiresAt: form.expiresAt || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Erreur');
      setCoupons((prev) => [data, ...prev]);
      setForm(empty);
      setShowForm(false);
      toast.success('Code promo créé');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(c: Coupon) {
    try {
      const res = await fetch(`/api/admin/promos/${c._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !c.active }),
      });
      if (res.ok) {
        setCoupons((prev) => prev.map((x) => (x._id === c._id ? { ...x, active: !c.active } : x)));
      }
    } catch {
      toast.error('Erreur');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce code promo ?')) return;
    try {
      await fetch(`/api/admin/promos/${id}`, { method: 'DELETE' });
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      toast.success('Supprimé');
    } catch {
      toast.error('Erreur');
    }
  }

  function fmtValue(c: Coupon) {
    return c.type === 'percent' ? `${c.value}%` : `${c.value} €`;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[hsl(var(--accent))] px-4 py-2 text-sm font-semibold text-[hsl(var(--accent-fg))] hover:opacity-95"
        >
          <Plus size={15} /> Nouveau code
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 space-y-4 shadow-[var(--shadow-sm)]"
        >
          <h2 className="font-semibold text-sm">Créer un code promo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-token-text/70 block mb-1">Code *</label>
              <input
                type="text"
                required
                placeholder="SUMMER20"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-3 py-2 text-sm uppercase focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-token-text/70 block mb-1">Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'percent' | 'fixed' }))}
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
              >
                <option value="percent">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (€)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-token-text/70 block mb-1">Valeur *</label>
              <input
                type="number"
                required
                min={0}
                placeholder={form.type === 'percent' ? '20' : '10'}
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-token-text/70 block mb-1">Commande min (€)</label>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={form.minOrder}
                onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))}
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-token-text/70 block mb-1">Utilisations max</label>
              <input
                type="number"
                min={1}
                placeholder="Illimité"
                value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-token-text/70 block mb-1">Expiration</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-sm hover:bg-[hsl(var(--surface-2))]"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[hsl(var(--accent))] px-4 py-2 text-sm font-semibold text-[hsl(var(--accent-fg))] hover:opacity-95 disabled:opacity-50"
            >
              {saving ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[var(--shadow-sm)] overflow-hidden">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-[hsl(var(--surface-2))] animate-pulse" />
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-10 text-center text-sm text-token-text/50">
            <Tag size={32} className="mx-auto mb-2 opacity-30" />
            Aucun code promo. Créez-en un ci-dessus.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-[11px] uppercase tracking-wider text-token-text/50">
                  <th className="px-4 py-2 text-left">Code</th>
                  <th className="px-4 py-2 text-left">Réduction</th>
                  <th className="px-4 py-2 text-right">Min commande</th>
                  <th className="px-4 py-2 text-right">Utilisations</th>
                  <th className="px-4 py-2 text-right">Expiration</th>
                  <th className="px-4 py-2 text-center">Actif</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr
                    key={c._id}
                    className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-2))] transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-[hsl(var(--accent))]">
                      {c.code}
                    </td>
                    <td className="px-4 py-3 font-semibold">{fmtValue(c)}</td>
                    <td className="px-4 py-3 text-right text-token-text/60">
                      {c.minOrder > 0 ? `${c.minOrder} €` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-token-text/60">
                      {c.usedCount} / {c.maxUses ?? '∞'}
                    </td>
                    <td className="px-4 py-3 text-right text-token-text/60">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleActive(c)}
                        className={c.active ? 'text-green-500' : 'text-token-text/30'}
                        title={c.active ? 'Désactiver' : 'Activer'}
                      >
                        {c.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDelete(c._id)}
                        className="text-red-500 hover:text-red-700 rounded p-1"
                        title="Supprimer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
