'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';

type Log = {
  _id: string;
  userEmail?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ip?: string;
  createdAt: string;
};

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-500/15 text-green-600',
  update: 'bg-blue-500/15 text-blue-600',
  delete: 'bg-red-500/15 text-red-600',
  login: 'bg-purple-500/15 text-purple-600',
};

function badge(action: string) {
  const key = Object.keys(ACTION_COLORS).find((k) => action.toLowerCase().includes(k));
  const cls = key ? ACTION_COLORS[key] : 'bg-[hsl(var(--surface-2))] text-token-text/70';
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>{action}</span>;
}

export default function AdminAuditTable() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const limit = 50;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/audit-logs?page=${page}`)
      .then((r) => r.json())
      .then((d) => {
        setLogs(d?.logs ?? []);
        setTotal(d?.total ?? 0);
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [page]);

  const pages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center gap-2 p-4 border-b border-[hsl(var(--border))]">
        <ShieldCheck size={15} className="text-[hsl(var(--accent))]" />
        <span className="text-xs text-token-text/50">{total} entrées au total</span>
      </div>

      {loading ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-9 rounded-lg bg-[hsl(var(--surface-2))] animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <p className="p-8 text-center text-sm text-token-text/50">Aucune entrée dans le journal.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] text-[11px] uppercase tracking-wider text-token-text/50">
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Admin</th>
                <th className="px-4 py-2 text-left">Action</th>
                <th className="px-4 py-2 text-left">Ressource</th>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr
                  key={l._id}
                  className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-2))] transition-colors"
                >
                  <td className="px-4 py-2.5 text-xs text-token-text/60 whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-4 py-2.5 text-xs">{l.userEmail ?? '—'}</td>
                  <td className="px-4 py-2.5">{badge(l.action)}</td>
                  <td className="px-4 py-2.5 text-xs text-token-text/70">{l.resourceType}</td>
                  <td className="px-4 py-2.5 text-xs text-token-text/50 font-mono">{l.resourceId ?? '—'}</td>
                  <td className="px-4 py-2.5 text-xs text-token-text/50">{l.ip ?? '—'}</td>
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
