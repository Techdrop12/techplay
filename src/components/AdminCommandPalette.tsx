'use client';

import { FileText, Package, Search, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

type SearchResult =
  | { type: 'product'; id: string; title: string; subtitle?: string; href: string }
  | { type: 'order'; id: string; title: string; subtitle?: string; href: string }
  | { type: 'blog'; id: string; title: string; subtitle?: string; href: string };

export default function AdminCommandPalette() {
  const t = useTranslations('admin');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setHighlightIndex(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !query.trim()) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const id = setTimeout(() => {
      setLoading(true);
      fetch(`/api/admin/search?q=${encodeURIComponent(query.trim())}`, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data: { results?: SearchResult[] }) => {
          setResults(Array.isArray(data?.results) ? data.results : []);
          setHighlightIndex(0);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 200);

    return () => {
      clearTimeout(id);
      controller.abort();
    };
  }, [open, query]);

  const handleSelect = (item: SearchResult) => {
    setOpen(false);
    router.push(item.href);
  };

  if (!open) return null;

  const iconForType = (type: SearchResult['type']) => {
    if (type === 'product') return <Package className="h-4 w-4" />;
    if (type === 'order') return <ShoppingCart className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-24 sm:pt-32">
      <div className="w-full max-w-xl rounded-2xl bg-[hsl(var(--surface))] shadow-[var(--shadow-lg)] border border-[hsl(var(--border))] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-[hsl(var(--border))] px-3 py-2.5">
          <Search className="h-4 w-4 text-token-text/60" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlightIndex((i) => Math.min(i + 1, results.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlightIndex((i) => Math.max(i - 1, 0));
              } else if (e.key === 'Enter' && results[highlightIndex]) {
                handleSelect(results[highlightIndex]);
              }
            }}
            placeholder={t('command_palette_placeholder')}
            className="flex-1 bg-transparent text-sm outline-none text-[hsl(var(--text))]"
          />
          <span className="hidden text-[10px] text-token-text/50 sm:inline-flex items-center gap-1 rounded border border-[hsl(var(--border))] px-1.5 py-0.5">
            <kbd>Ctrl</kbd> <span>+</span> <kbd>K</kbd>
          </span>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <p className="px-3 py-2 text-xs text-token-text/60">{t('command_palette_loading')}</p>
          )}
          {!loading && results.length === 0 && query.trim() && (
            <p className="px-3 py-3 text-xs text-token-text/60">
              {t('command_palette_empty')}
            </p>
          )}
          {!loading && results.length > 0 && (
            <ul>
              {results.map((item, index) => (
                <li
                  key={`${item.type}-${item.id}`}
                  className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-sm ${
                    index === highlightIndex
                      ? 'bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]'
                      : 'text-[hsl(var(--text))] hover:bg-[hsl(var(--surface-2))]'
                  }`}
                  onMouseEnter={() => setHighlightIndex(index)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(item);
                  }}
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[hsl(var(--surface-2))] text-xs text-token-text/70">
                    {iconForType(item.type)}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium">{item.title}</span>
                    {item.subtitle && (
                      <span className="text-[11px] text-token-text/60">{item.subtitle}</span>
                    )}
                  </div>
                  <span className="ml-auto text-[10px] uppercase tracking-wide text-token-text/50">
                    {item.type}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

