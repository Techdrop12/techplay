'use client';

import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

type Row = { date: string; revenue: number; orders: number };
type Mode = 'revenue' | 'orders';
type Range = 7 | 14 | 30 | 90;

const RANGES: { label: string; value: Range }[] = [
  { label: '7j', value: 7 },
  { label: '14j', value: 14 },
  { label: '30j', value: 30 },
  { label: '90j', value: 90 },
];

function fmt(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function AdminSalesChart() {
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>(30);
  const [mode, setMode] = useState<Mode>('revenue');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/chart?days=${range}`)
      .then((r) => r.json())
      .then((d) => setData(Array.isArray(d?.data) ? d.data : []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [range]);

  const total =
    mode === 'revenue'
      ? data.reduce((s, r) => s + r.revenue, 0).toFixed(2) + ' €'
      : data.reduce((s, r) => s + r.orders, 0) + ' cmd';

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 shadow-[var(--shadow-sm)]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-token-text/60">
            Graphique
          </p>
          <p className="text-sm font-semibold text-[hsl(var(--text))]">
            {mode === 'revenue' ? "Chiffre d'affaires" : 'Commandes'}{' '}
            <span className="text-[hsl(var(--accent))]">{total}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] p-0.5">
            {(['revenue', 'orders'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  mode === m
                    ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] shadow-[var(--shadow-sm)]'
                    : 'text-token-text/70 hover:text-[hsl(var(--text))]'
                }`}
              >
                {m === 'revenue' ? 'CA' : 'Commandes'}
              </button>
            ))}
          </div>
          <div className="flex rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] p-0.5">
            {RANGES.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRange(value)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  range === value
                    ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] shadow-[var(--shadow-sm)]'
                    : 'text-token-text/70 hover:text-[hsl(var(--text))]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-48 rounded-lg bg-[hsl(var(--surface-2))] animate-pulse" />
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.25} />
                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={fmt}
              tick={{ fontSize: 10, fill: 'hsl(var(--text) / 0.5)' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'hsl(var(--text) / 0.5)' }}
              tickLine={false}
              axisLine={false}
              width={40}
              tickFormatter={(v) => (mode === 'revenue' ? `${v}€` : String(v))}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--surface-2))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 8,
                fontSize: 12,
              }}
              labelFormatter={(l) => fmt(String(l))}
              formatter={(v) => {
                const n = Number(v ?? 0);
                return mode === 'revenue' ? [`${n} €`, 'CA'] : [n, 'Commandes'];
              }}
            />
            <Area
              type="monotone"
              dataKey={mode}
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              fill="url(#chartGrad)"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
