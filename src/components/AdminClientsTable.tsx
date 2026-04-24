'use client';

import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Users } from 'lucide-react';

type Client = {
  email: string;
  name: string;
  orders: number;
  totalSpent: number;
  lastOrderAt: string | null;
  firstOrderAt: string | null;
};

function fmt(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR');
}

export default function AdminClientsTable() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), search });
    fetch(`/api/admin/clients?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setClients(d?.clients ?? []);
        setPages(d?.pages ?? 1);
        setTotal(d?.total ?? 0);
      })
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, [page, search]);

  function handleSearch(v: string) {
    setSearch(v);
    setPage(1);
  }

  return (
    <div>
      <div className="flex items-center gap-3 p-4 border-b border-[hsl(var(--border))]">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-token-text/40" />
          <input
            type="search"
            placeholder="Rechercher email ou nom..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          />
        </div>
        <span className="text-xs text-token-text/50 flex items-center gap-1">
          <Users size={13} /> {total} client{total !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-[hsl(var(--surface-2))] animate-pulse" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <p className="p-8 text-center text-sm text-token-text/50">Aucun client trouvé.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] text-[11px] uppercase tracking-wider text-token-text/50">
                <th className="px-4 py-2 text-left">Client</th>
                <th className="px-4 py-2 text-right">Commandes</th>
                <th className="px-4 py-2 text-right">Total dépensé</th>
                <th className="px-4 py-2 text-right">1ère commande</th>
                <th className="px-4 py-2 text-right">Dernière commande</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr
                  key={c.email}
                  className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-2))] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-[hsl(var(--text))]">{c.name || '—'}</div>
                    <div className="text-xs text-token-text/50">{c.email}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{c.orders}</td>
                  <td className="px-4 py-3 text-right font-semibold text-[hsl(var(--accent))]">
                    {c.totalSpent.toFixed(2)} €
                  </td>
                  <td className="px-4 py-3 text-right text-token-text/60">{fmt(c.firstOrderAt)}</td>
                  <td className="px-4 py-3 text-right text-token-text/60">{fmt(c.lastOrderAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[hsl(var(--border))]">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 text-xs text-token-text/60 hover:text-[hsl(var(--text))] disabled:opacity-30"
          >
            <ChevronLeft size={14} /> Précédent
          </button>
          <span className="text-xs text-token-text/50">Page {page} / {pages}</span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages}
            className="flex items-center gap-1 text-xs text-token-text/60 hover:text-[hsl(var(--text))] disabled:opacity-30"
          >
            Suivant <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
