'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState, useRef, useMemo } from 'react';

import type { KeyboardEvent, RefCallback } from 'react';

import Link from '@/components/LocalizedLink';
import { error as logError } from '@/lib/logger';
import { cn } from '@/lib/utils';

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
}

const FALLBACK_FAQ_FR: FAQItem[] = [
  {
    _id: '1',
    question: 'Pourquoi choisir TechPlay ?',
    answer:
      "Nous sélectionnons rigoureusement chaque produit : qualité garantie, meilleur rapport qualité/prix, livraison rapide et support humain réactif. Pas de remplissage — seulement les meilleurs produits gaming et high-tech.",
  },
  {
    _id: '2',
    question: 'Quels sont les délais de livraison ?',
    answer: "Livraison internationale suivie. Livraison offerte dès 49 € d'achat.",
  },
  {
    _id: '3',
    question: 'Puis-je retourner un article ?',
    answer:
      "Oui. Retours gratuits sous 30 jours : contactez-nous pour obtenir l'étiquette de retour.",
  },
  {
    _id: '4',
    question: 'Le paiement est-il sécurisé ?',
    answer: 'Oui. Paiement par Stripe (CB, Apple Pay, Google Pay). Données cryptées.',
  },
];

const FALLBACK_FAQ_EN: FAQItem[] = [
  {
    _id: '1',
    question: 'Why choose TechPlay?',
    answer:
      'We rigorously select every product: guaranteed quality, best value, fast delivery and real human support. No filler — only the best gaming and high-tech gear.',
  },
  {
    _id: '2',
    question: 'What are the delivery times?',
    answer: 'International tracked delivery. Free shipping from €49.',
  },
  {
    _id: '3',
    question: 'Can I return an item?',
    answer: 'Yes. Free returns within 30 days: contact us to get a return label.',
  },
  {
    _id: '4',
    question: 'Is payment secure?',
    answer: 'Yes. Payment via Stripe (card, Apple Pay, Google Pay). Data encrypted.',
  },
];

interface FAQProps {
  /** When false, the section heading is not rendered (e.g. when the page already shows it). */
  showSectionHeading?: boolean;
  /** Optional max number of items to display (e.g. homepage teaser). */
  limit?: number;
  /** When false, search and expand/collapse tools are hidden (e.g. for homepage teaser). */
  showTools?: boolean;
}

export default function FAQ({ showSectionHeading = true, limit, showTools = true }: FAQProps) {
  const t = useTranslations('faq');
  const rawLocale = useLocale();
  /** Valeur stable pour les deps d'effet (évite les boucles si `useLocale` varie entre rendus). */
  const locale = rawLocale === 'en' ? 'en' : 'fr';
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openSet, setOpenSet] = useState<Set<number>>(new Set());
  const headerRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/faq?locale=${locale}`, { cache: 'no-store' });
        if (cancelled) return;
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (cancelled) return;
        setFaqs(Array.isArray(data) ? data : []);
      } catch (error) {
        if (cancelled) return;
        logError('Erreur de chargement des FAQs', error);
        setFaqs(locale === 'en' ? FALLBACK_FAQ_EN : FALLBACK_FAQ_FR);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const filteredFaqs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
    );
  }, [faqs, search]);

  const visibleFaqs = useMemo(
    () => (typeof limit === 'number' && limit > 0 ? filteredFaqs.slice(0, limit) : filteredFaqs),
    [filteredFaqs, limit]
  );

  const toggleIndex = (index: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const expandAll = () => setOpenSet(new Set(filteredFaqs.map((_, i) => i)));
  const collapseAll = () => setOpenSet(new Set());

  const onKeyNav = (e: KeyboardEvent, i: number) => {
    const total = filteredFaqs.length;
    if (!total) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      headerRefs.current[(i + 1) % total]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      headerRefs.current[(i - 1 + total) % total]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      headerRefs.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      headerRefs.current[total - 1]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleIndex(i);
    }
  };

  const setHeaderRef =
    (idx: number): RefCallback<HTMLButtonElement> =>
    (el) => {
      headerRefs.current[idx] = el;
    };

  // JSON-LD SEO (FAQPage)
  const faqJsonLd = useMemo(() => {
    if (!filteredFaqs.length) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: filteredFaqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    };
  }, [filteredFaqs]);

  const introContent = (
    <>
      {t('intro')}{' '}
      <Link
        href="/contact"
        className="font-medium text-[hsl(var(--accent))] underline-offset-2 hover:underline"
      >
        {t('contact_link')}
      </Link>
      .
    </>
  );

  return (
    <section
      className="container-app mx-auto max-w-3xl py-8 sm:py-10"
      aria-labelledby={showSectionHeading ? 'faq-heading' : undefined}
      aria-label={showSectionHeading ? undefined : t('heading')}
    >
      {showSectionHeading && (
        <h2 id="faq-heading" className="heading-section text-center">
          {t('heading')}
        </h2>
      )}
      <p
        className={cn(
          'max-w-xl mx-auto text-center text-[15px] text-token-text/75',
          showSectionHeading ? 'mt-3' : 'mb-6'
        )}
      >
        {introContent}
      </p>

      {/* Tools: search + expand/collapse (hidden when limit is set, e.g. homepage) */}
      {showTools && (
        <div className="mt-6 mb-8 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <input
            type="search"
            inputMode="search"
            placeholder={t('search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-sm rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3 text-[15px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:ring-offset-2"
            aria-label={t('search_aria')}
          />
          <div className="flex gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={expandAll}
              className="rounded-xl bg-[hsl(var(--accent))] text-white px-4 py-3 text-sm font-semibold hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--accent))] min-h-[2.75rem] sm:min-h-0"
            >
              {t('expand_all')}
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3 text-sm text-token-text hover:bg-[hsl(var(--surface-2))] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--accent))] min-h-[2.75rem] sm:min-h-0"
            >
              {t('collapse_all')}
            </button>
          </div>
        </div>
      )}

      {/* État chargement / vide */}
      {loading && (
        <div className="space-y-3 sm:space-y-4" role="status" aria-live="polite" aria-busy="true">
          {[1, 2, 3, 4].map((k) => (
            <div
              key={k}
              className="h-16 sm:h-[4.25rem] rounded-[var(--radius-2xl)] bg-[hsl(var(--surface-2))] animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && filteredFaqs.length === 0 && (
        <p className="text-center text-token-text/60 text-[15px]" role="status">
          {t('no_results', { query: search })}{' '}
          <Link
            href="/contact"
            className="font-medium text-[hsl(var(--accent))] underline-offset-2 hover:underline"
          >
            {t('contact_link')}
          </Link>
          .
        </p>
      )}

      {/* Liste FAQ */}
      <div role="list" aria-live="polite" className="space-y-3 sm:space-y-4">
        {visibleFaqs.map((faq, i) => {
          const isOpen = openSet.has(i);
          const headerId = `faq-header-${faq._id}-${i}`;
          const panelId = `faq-panel-${faq._id}-${i}`;

          return (
            <div
              key={faq._id}
              role="listitem"
              className="overflow-hidden rounded-[var(--radius-2xl)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-sm transition-shadow hover:shadow-md"
            >
              <button
                ref={setHeaderRef(i)}
                id={headerId}
                aria-controls={panelId}
                aria-expanded={isOpen}
                className="w-full text-left flex items-center justify-between gap-4 min-h-[3.25rem] sm:min-h-[3.5rem] px-4 py-4 sm:px-5 sm:py-4 text-[15px] sm:text-base font-semibold text-[hsl(var(--text))] rounded-2xl transition-colors hover:bg-[hsl(var(--surface-2))]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--accent))]"
                onClick={() => toggleIndex(i)}
                onKeyDown={(e) => onKeyNav(e, i)}
              >
                <span className="flex-1 pr-2 leading-snug">{faq.question}</span>
                <span
                  className="flex min-h-[2.75rem] min-w-[2.75rem] shrink-0 items-center justify-center rounded-full bg-[hsl(var(--surface-2))] text-[hsl(var(--accent))] text-lg font-medium transition-transform duration-200"
                  aria-hidden="true"
                  style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                >
                  +
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={headerId}
                    key={panelId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden border-t border-[hsl(var(--border))]"
                  >
                    <div className="px-4 pb-4 pt-1 sm:px-5 sm:pb-5 sm:pt-2 text-[15px] sm:text-base leading-relaxed text-token-text/85">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
    </section>
  );
}
