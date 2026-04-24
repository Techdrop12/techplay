'use client';

import { Download } from 'lucide-react';
import { useState } from 'react';

type ExportType = 'orders' | 'subscribers' | 'products';

interface Props {
  type: ExportType;
  label?: string;
}

export default function AdminExportButton({ type, label }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/export?type=${type}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition') ?? '';
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? `${type}.csv`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Erreur lors de l\'export');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-1.5 text-xs font-medium hover:bg-[hsl(var(--surface-2))] disabled:opacity-50 transition-colors"
    >
      <Download size={13} />
      {loading ? 'Export...' : (label ?? 'Exporter CSV')}
    </button>
  );
}
