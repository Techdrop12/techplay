// src/components/ProductGallery.js
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

const BLUR =
  'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=';
const PLACEHOLDER = '/default.jpg';

export default function ProductGallery({
  images = [],
  altBase = 'Image du produit',
  unoptimized = false,
  // props optionnels safe (pas obligatoires)
  startIndex = 0,
  onIndexChange,
  loop = true,
}) {
  const prefersReducedMotion = useReducedMotion();

  const safeImages = useMemo(
    () => (Array.isArray(images) ? images.filter(Boolean) : []),
    [images]
  );

  const [selectedIndex, setSelectedIndex] = useState(
    Number.isFinite(startIndex) ? Math.max(0, Math.min(startIndex, Math.max(0, safeImages.length - 1))) : 0
  );
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Refs
  const thumbsRef = useRef(null);
  const thumbBtnsRef = useRef([]); // boutons vignettes
  const lastFocusedRef = useRef(null);
  const lightboxRef = useRef(null);

  // Touch swipe refs (mobile)
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  // Clamp index si la liste change
  useEffect(() => {
    if (!safeImages.length) {
      setSelectedIndex(0);
    } else if (selectedIndex > safeImages.length - 1) {
      setSelectedIndex(safeImages.length - 1);
    }
  }, [safeImages, selectedIndex]);

  const mainImage = safeImages[selectedIndex] || safeImages[0] || PLACEHOLDER;

  // Préchargement des voisins pour un carrousel fluide
  useEffect(() => {
    if (!safeImages.length) return;
    const next = safeImages[(selectedIndex + 1) % safeImages.length];
    const prev = safeImages[(selectedIndex - 1 + safeImages.length) % safeImages.length];
    [next, prev].forEach((src) => {
      if (!src) return;
      const img = new Image();
      img.src = src;
    });
  }, [safeImages, selectedIndex]);

  // Navigation
  const goNext = useCallback(() => {
    if (!safeImages.length) return;
    setSelectedIndex((prev) => {
      const nextIndex = prev + 1;
      return nextIndex >= safeImages.length ? (loop ? 0 : safeImages.length - 1) : nextIndex;
    });
  }, [safeImages.length, loop]);

  const goPrev = useCallback(() => {
    if (!safeImages.length) return;
    setSelectedIndex((prev) => {
      const nextIndex = prev - 1;
      return nextIndex < 0 ? (loop ? safeImages.length - 1 : 0) : nextIndex;
    });
  }, [safeImages.length, loop]);

  // Notifier parent si demandé
  useEffect(() => {
    onIndexChange?.(selectedIndex);
  }, [selectedIndex, onIndexChange]);

  // Clavier global en lightbox + focus-trap
  useEffect(() => {
    if (!lightboxOpen) return;

    const onKey = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setLightboxOpen(false);
      } else if (e.key === 'Tab') {
        // Focus-trap simple
        const root = lightboxRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll(
          'button, [href], [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightboxOpen, goNext, goPrev]);

  // Scroll auto vers la miniature active
  useEffect(() => {
    const container = thumbsRef.current;
    const btn = thumbBtnsRef.current[selectedIndex];
    if (!container || !btn) return;
    const btnRect = btn.getBoundingClientRect();
    const contRect = container.getBoundingClientRect();
    const isVisible =
      btnRect.left >= contRect.left &&
      btnRect.right <= contRect.right &&
      btnRect.top >= contRect.top &&
      btnRect.bottom <= contRect.bottom;

    if (!isVisible) {
      container.scrollTo({
        left: btn.offsetLeft - container.clientWidth / 2 + btn.clientWidth / 2,
        top: btn.offsetTop - container.clientHeight / 2 + btn.clientHeight / 2,
        behavior: 'smooth',
      });
    }
  }, [selectedIndex]);

  // Gérer le focus & scroll du body en lightbox
  useEffect(() => {
    if (lightboxOpen) {
      lastFocusedRef.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      // focus sur fermer pour a11y
      setTimeout(() => {
        lightboxRef.current?.querySelector('[data-close]')?.focus?.();
      }, 0);
    } else {
      document.body.style.overflow = '';
      // Restaurer le focus sur la miniature active
      const btn = thumbBtnsRef.current[selectedIndex];
      btn?.focus?.({ preventScroll: true });
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxOpen, selectedIndex]);

  const handleThumbClick = (i) => setSelectedIndex(i);

  // Gestion swipe en lightbox
  const onTouchStart = (e) => {
    if (!lightboxOpen) return;
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const onTouchMove = (e) => {
    if (!lightboxOpen) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const onTouchEnd = () => {
    if (!lightboxOpen) return;
    const abs = Math.abs(touchDeltaX.current);
    if (abs > 40) {
      if (touchDeltaX.current < 0) goNext();
      else goPrev();
    }
    touchStartX.current = 0;
    touchDeltaX.current = 0;
  };

  // Clavier sur l’image principale (hors lightbox)
  const onMainKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setLightboxOpen(true);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    }
  };

  return (
    <div className="outline-none" aria-roledescription="carrousel" aria-label="Galerie produit">
      {/* Miniatures */}
      <div
        ref={thumbsRef}
        className="flex md:flex-col gap-2 md:w-24 overflow-x-auto md:overflow-y-auto mb-4 scroll-smooth"
        role="listbox"
        aria-label="Miniatures du produit"
      >
        {safeImages.map((img, i) => {
          const selected = i === selectedIndex;
          return (
            <button
              key={(img || PLACEHOLDER) + i}
              ref={(el) => (thumbBtnsRef.current[i] = el)}
              onClick={() => handleThumbClick(i)}
              type="button"
              className={[
                'relative w-16 h-16 rounded border transition hover:opacity-90 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                selected ? 'border-black dark:border-white scale-105' : 'border-gray-300',
              ].join(' ')}
              role="option"
              aria-selected={selected}
              aria-label={`Miniature ${i + 1} sur ${safeImages.length}`}
            >
              <Image
                src={img || PLACEHOLDER}
                alt={`${altBase} – miniature ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover rounded"
                placeholder="blur"
                blurDataURL={BLUR}
                unoptimized={unoptimized}
                loading="lazy"
                draggable={false}
                onError={(e) => {
                  // fallback visuel doux si erreur
                  e.currentTarget.src = PLACEHOLDER;
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Image principale */}
      <div className="relative">
        <motion.button
          key={mainImage}
          initial={prefersReducedMotion ? false : { opacity: 0.6, scale: 0.98 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.28 }}
          type="button"
          onClick={() => setLightboxOpen(true)}
          onKeyDown={onMainKeyDown}
          className="relative w-full aspect-[4/3] md:aspect-square cursor-zoom-in rounded-2xl overflow-hidden shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Agrandir l’image"
        >
          <Image
            src={mainImage}
            alt={`${altBase} – vue principale (${selectedIndex + 1} / ${safeImages.length || 1})`}
            fill
            className="object-contain bg-white dark:bg-zinc-900"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            placeholder="blur"
            blurDataURL={BLUR}
            unoptimized={unoptimized}
            draggable={false}
            onError={(e) => {
              e.currentTarget.src = PLACEHOLDER;
            }}
          />
          <span className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
            Cliquer pour zoom
          </span>

          {/* Compteur en bas à gauche */}
          {safeImages.length > 1 && (
            <span
              className="absolute bottom-2 left-2 text-xs bg-black/60 text-white px-2 py-1 rounded"
              aria-live="polite"
            >
              {selectedIndex + 1}/{safeImages.length}
            </span>
          )}
        </motion.button>

        {/* Flèches navigation rapide (desktop) */}
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Image précédente"
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Image suivante"
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            ref={lightboxRef}
            className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Aperçu de l’image en grand"
            onClick={() => setLightboxOpen(false)}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <motion.div
              initial={prefersReducedMotion ? false : { scale: 0.92 }}
              animate={prefersReducedMotion ? undefined : { scale: 1 }}
              exit={prefersReducedMotion ? undefined : { scale: 0.92 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              className="relative w-full h-full max-w-5xl max-h-[90vh] outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={mainImage}
                alt={`${altBase} – zoom (${selectedIndex + 1} / ${safeImages.length || 1})`}
                fill
                className="object-contain select-none"
                draggable={false}
                unoptimized={unoptimized}
                priority
                onError={(e) => {
                  e.currentTarget.src = PLACEHOLDER;
                }}
              />

              {/* Contrôles */}
              {safeImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Image précédente"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/20 text-white text-2xl leading-none backdrop-blur hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Image suivante"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/20 text-white text-2xl leading-none backdrop-blur hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    ›
                  </button>
                </>
              )}
              <button
                type="button"
                data-close
                onClick={() => setLightboxOpen(false)}
                aria-label="Fermer"
                className="absolute top-2 right-2 h-10 w-10 rounded-full bg-white/20 text-white text-lg backdrop-blur hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
