'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const BLUR =
  'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=';

export default function ProductGallery({
  images = [],
  altBase = 'Image du produit',
  unoptimized = false,
}) {
  const safeImages = useMemo(
    () => (Array.isArray(images) ? images.filter(Boolean) : []),
    [images]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Refs
  const thumbsRef = useRef(null);
  const thumbBtnsRef = useRef([]); // boutons vignettes
  const lastFocusedRef = useRef(null);

  // Clamp index si la liste change
  useEffect(() => {
    if (!safeImages.length) {
      setSelectedIndex(0);
    } else if (selectedIndex > safeImages.length - 1) {
      setSelectedIndex(safeImages.length - 1);
    }
  }, [safeImages, selectedIndex]);

  const mainImage = safeImages[selectedIndex] || safeImages[0] || '/default.jpg';

  // Navigation
  const goNext = useCallback(() => {
    if (!safeImages.length) return;
    setSelectedIndex((prev) => (prev + 1) % safeImages.length);
  }, [safeImages.length]);

  const goPrev = useCallback(() => {
    if (!safeImages.length) return;
    setSelectedIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  }, [safeImages.length]);

  // Clavier en lightbox
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
      // Scroll horizontal (mobile) ou vertical (desktop colonne)
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
    } else {
      document.body.style.overflow = '';
      // Restaurer le focus sur la miniature active
      const btn = thumbBtnsRef.current[selectedIndex];
      btn?.focus({ preventScroll: true });
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxOpen, selectedIndex]);

  const handleThumbClick = (i) => {
    setSelectedIndex(i);
  };

  return (
    <div className="outline-none">
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
              key={img + i}
              ref={(el) => (thumbBtnsRef.current[i] = el)}
              onClick={() => handleThumbClick(i)}
              type="button"
              className={[
                'relative w-16 h-16 rounded border transition hover:opacity-90 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                selected ? 'border-black dark:border-white scale-105' : 'border-gray-300',
              ].join(' ')}
              role="option"
              aria-selected={selected}
              aria-label={`Miniature ${i + 1}`}
            >
              <Image
                src={img}
                alt={`${altBase} – miniature ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover rounded"
                placeholder="blur"
                blurDataURL={BLUR}
                unoptimized={unoptimized}
              />
            </button>
          );
        })}
      </div>

      {/* Image principale */}
      <div className="relative">
        <motion.button
          key={mainImage}
          initial={{ opacity: 0.6, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.28 }}
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="relative w-full aspect-[4/3] md:aspect-square cursor-zoom-in rounded-2xl overflow-hidden shadow"
          aria-label="Agrandir l’image"
        >
          <Image
            src={mainImage}
            alt={`${altBase} – vue principale`}
            fill
            className="object-contain bg-white dark:bg-zinc-900"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            placeholder="blur"
            blurDataURL={BLUR}
            unoptimized={unoptimized}
          />
          <span className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
            Cliquer pour zoom
          </span>
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
            className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Aperçu de l’image en grand"
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              transition={{ duration: 0.2 }}
              className="relative w-full h-full max-w-5xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={mainImage}
                alt={`${altBase} – zoom`}
                fill
                className="object-contain select-none"
                draggable={false}
                unoptimized={unoptimized}
                priority
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
