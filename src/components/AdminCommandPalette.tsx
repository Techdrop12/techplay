'use client';

import {
  FileText,
  Package,
  Search,
  ShoppingCart,
  LayoutDashboard,
  Users,
  Tag,
  Star,
  Mail,
  Send,
  ShieldCheck,
  Settings,
  Upload,
  BookOpen,
  MessageSquare,
  PlusCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type SearchResult =
  | { type: 'product'; id: string; title: string; subtitle?: string; href: string }
  | { type: 'order'; id: string; title: string; subtitle?: string; href: string }
  | { type: 'blog'; id: string; title: string; subtitle?: string; href: string };

type NavItem = {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  icon: ReactNode;
  keywords: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', title: 'Dashboard', subtitle: 'Vue d\'ensemble', href: '/admin/dashboard', icon: <LayoutDashboard size={15} />, keywords: 'dashboard accueil' },
  { id: 'commandes', title: 'Commandes', subtitle: 'Gérer les commandes', href: '/admin/commandes', icon: <ShoppingCart size={15} />, keywords: 'commandes orders' },
  { id: 'produits', title: 'Produits', subtitle: 'Catalogue produits', href: '/admin/produits', icon: <Package size={15} />, keywords: 'produits products catalogue' },
  { id: 'produits-new', title: 'Ajouter un produit', subtitle: 'Créer un nouveau produit', href: '/admin/produits/nouveau', icon: <PlusCircle size={15} />, keywords: 'ajouter produit nouveau' },
  { id: 'clients', title: 'Clients', subtitle: 'Historique clients', href: '/admin/clients', icon: <Users size={15} />, keywords: 'clients customers' },
  { id: 'promos', title: 'Codes promo', subtitle: 'Gérer les réductions', href: '/admin/promos', icon: <Tag size={15} />, keywords: 'promo codes réductions discount' },
  { id: 'blog', title: 'Blog', subtitle: 'Articles de blog', href: '/admin/blog', icon: <BookOpen size={15} />, keywords: 'blog articles' },
  { id: 'avis', title: 'Avis', subtitle: 'Modérer les avis clients', href: '/admin/avis', icon: <Star size={15} />, keywords: 'avis reviews' },
  { id: 'newsletter', title: 'Newsletter — Abonnés', subtitle: 'Liste des inscrits', href: '/admin/newsletter', icon: <Mail size={15} />, keywords: 'newsletter abonnés subscribers' },
  { id: 'newsletter-send', title: 'Envoyer newsletter', subtitle: 'Composer et envoyer', href: '/admin/newsletter-send', icon: <Send size={15} />, keywords: 'envoyer newsletter email' },
  { id: 'contact', title: 'Messages contact', subtitle: 'Formulaire de contact', href: '/admin/contact', icon: <MessageSquare size={15} />, keywords: 'contact messages' },
  { id: 'import', title: 'Import produits', subtitle: 'Importer via JSON', href: '/admin/import', icon: <Upload size={15} />, keywords: 'import produits json' },
  { id: 'audit', title: 'Journal d\'activité', subtitle: 'Logs admin', href: '/admin/audit', icon: <ShieldCheck size={15} />, keywords: 'audit journal logs' },
  { id: 'parametres', title: 'Paramètres', subtitle: 'Configuration admin', href: '/admin/parametres', icon: <Settings size={15} />, keywords: 'parametres settings configuration' },
  { id: 'pages', title: 'Pages légales', subtitle: 'CGV, mentions légales', href: '/admin/pages', icon: <FileText size={15} />, keywords: 'pages légales cgv mentions' },
];

export default function AdminCommandPalette() {
  const t = useTranslations('admin');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setSearchResults([]);
      setHighlightIndex(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !query.trim()) {
      setSearchResults([]);
      return;
    }
    const controller = new AbortController();
    const id = setTimeout(() => {
      setLoading(true);
      fetch(`/api/admin/search?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data: { results?: SearchResult[] }) => {
          setSearchResults(Array.isArray(data?.results) ? data.results : []);
          setHighlightIndex(0);
        })
        .catch((e) => console.warn(e))
        .finally(() => setLoading(false));
    }, 200);
    return () => { clearTimeout(id); controller.abort(); };
  }, [open, query]);

  const filteredNav: NavItem[] = query.trim()
    ? NAV_ITEMS.filter((n) =>
        [n.title, n.subtitle ?? '', n.keywords].join(' ').toLowerCase().includes(query.toLowerCase())
      )
    : NAV_ITEMS.slice(0, 6);

  type AnyResult = NavItem | SearchResult;
  const allItems: AnyResult[] = query.trim()
    ? [...filteredNav, ...searchResults]
    : filteredNav;

  const handleSelect = (item: AnyResult) => {
    setOpen(false);
    router.push(item.href);
  };

  const iconForSearchType = (type: SearchResult['type']) => {
    if (type === 'product') return <Package className="h-4 w-4" />;
    if (type === 'order') return <ShoppingCart className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const isNavItem = (item: AnyResult): item is NavItem => 'keywords' in item;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-20 sm:pt-28"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-[hsl(var(--surface))] shadow-[var(--shadow-lg)] border border-[hsl(var(--border))] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-[hsl(var(--border))] px-3 py-2.5">
          <Search className="h-4 w-4 text-token-text/60 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => { setQuery(e.target.value); setHighlightIndex(0); }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIndex((i) => Math.min(i + 1, allItems.length - 1)); }
              else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIndex((i) => Math.max(i - 1, 0)); }
              else if (e.key === 'Enter' && allItems[highlightIndex]) handleSelect(allItems[highlightIndex]);
            }}
            placeholder={t('command_palette_placeholder')}
            className="flex-1 bg-transparent text-sm outline-none text-[hsl(var(--text))]"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-[hsl(var(--border))] px-1.5 py-0.5 text-[10px] font-mono text-token-text/50">
            Esc
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {!query.trim() && (
            <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-token-text/40">
              Navigation rapide
            </p>
          )}

          {loading && <p className="px-3 py-2 text-xs text-token-text/60">{t('command_palette_loading')}</p>}

          {!loading && allItems.length === 0 && query.trim() && (
            <p className="px-3 py-3 text-xs text-token-text/60">{t('command_palette_empty')}</p>
          )}

          {allItems.length > 0 && (
            <ul className="py-1">
              {allItems.map((item, index) => {
                const nav = isNavItem(item);
                const active = index === highlightIndex;
                return (
                  <li
                    key={nav ? `nav-${item.id}` : `${(item as SearchResult).type}-${item.id}`}
                    className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors ${
                      active
                        ? 'bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]'
                        : 'text-[hsl(var(--text))] hover:bg-[hsl(var(--surface-2))]'
                    }`}
                    onMouseEnter={() => setHighlightIndex(index)}
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(item); }}
                  >
                    <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs ${active ? 'bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))]' : 'bg-[hsl(var(--surface-2))] text-token-text/60'}`}>
                      {nav ? item.icon : iconForSearchType((item as SearchResult).type)}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate">{item.title}</span>
                      {item.subtitle && (
                        <span className="text-[11px] text-token-text/50 truncate">{item.subtitle}</span>
                      )}
                    </div>
                    {!nav && (
                      <span className="ml-auto shrink-0 text-[10px] uppercase tracking-wide text-token-text/40">
                        {(item as SearchResult).type}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-[hsl(var(--border))] px-3 py-2 flex items-center gap-3 text-[10px] text-token-text/40">
          <span><kbd className="font-mono">↑↓</kbd> naviguer</span>
          <span><kbd className="font-mono">↵</kbd> ouvrir</span>
          <span><kbd className="font-mono">Esc</kbd> fermer</span>
        </div>
      </div>
    </div>
  );
}
