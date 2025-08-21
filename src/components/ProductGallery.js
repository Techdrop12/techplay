// src/components/ProductGallery.js
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

const BLUR = 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=';
const PLACEHOLDER = '/default.jpg';

/**
 * images: (string | { src: string, kind?: 'image'|'video', poster?: string })[]
 * - rétro-compatible: un simple tableau de strings fonctionne comme avant.
 */
export default function ProductGallery({
  images = [],
  altBase = 'Image du produit',
  unoptimized = false,
  startIndex = 0,
  onIndexChange,
  loop = true,
  // options bonus (facultatives)
  edgeFade = true,
  showIndex = true,
}) {
  const prefersReducedMotion = useReducedMotion();

  /** Normalisation des médias (string -> {src, kind:'image'}) */
  const media = useMemo(() => {
    const arr = Array.isArray(images) ? images : [];
    return arr
      .filter(Boolean)
      .map((it) =>
        typeof it === 'string'
          ? { src: it, kind: 'image' }
          : { src: it?.src, kind: it?.kind === 'video' ? 'video' : 'image', poster: it?.poster }
      )
      .filter((m) => typeof m.src === 'string' && m.src.length > 0);
  }, [images]);

  const [index, setIndex] = useState(
    Number.isFinite(startIndex) ? Math.max(0, Math.min(startIndex, Math.max(0, media.length - 1))) : 0
  );
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // zoom/pan dans la lightbox
  const [zoom, setZoom] = useState(1); // 1..3
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [dragging, setDragging] = useState(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0 }); // translateX/Y en px

  // erreurs d’images: { [i]: true } -> fallback
  const [imgErrors, setImgErrors] = useState({});

  // Refs & a11y
  const thumbsRef = useRef(null);
  const thumbBtnsRef = useRef([]);
  const lastFocusedRef = useRef(null);
  const lightboxRef = useRef(null);
  const liveRef = useRef(null);

  // Gestes tactiles (lightbox)
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const pinchStartDist = useRef(null);

  // Clamp index si la liste change
  useEffect(() => {
    if (!media.length) setIndex(0);
    else if (index > media.length - 1) setIndex(media.length - 1);
  }, [media, index]);

  const current = media[index] || media[0];
  const isImage = current?.kind !== 'video';

  // Préchargement des voisins (images uniquement)
  useEffect(() => {
    if (typeof window === 'undefined' || media.length <= 1) return;
    const n = media[(index + 1) % media.length];
    const p = media[(index - 1 + media.length) % media.length];
    [n, p]
      .filter((m) => m && m.kind !== 'video')
      .forEach((m) => {
        const img = new window.Image();
        img.src = m.src;
      });
  }, [index, media]);

  // notifier parent
  useEffect(() => {
    onIndexChange?.(index);
    // live region SR
    try {
      if (liveRef.current) {
        liveRef.current.textContent = `Image ${index + 1} sur ${media.length}`;
      }
    } catch {}
  }, [index, media.length, onIndexChange]);

  // Scroll auto vers la miniature active
  useEffect(() => {
    const container = thumbsRef.current;
    const btn = thumbBtnsRef.current[index];
    if (!container || !btn) return;
    const btnRect = btn.getBoundingClientRect();
    const contRect = container.getBoundingClientRect();
    const visible =
      btnRect.left >= contRect.left &&
      btnRect.right <= contRect.right &&
      btnRect.top >= contRect.top &&
      btnRect.bottom <= contRect.bottom;

    if (!visible) {
      container.scrollTo({
        left: btn.offsetLeft - container.clientWidth / 2 + btn.clientWidth / 2,
        top: btn.offsetTop - container.clientHeight / 2 + btn.clientHeight / 2,
        behavior: 'smooth',
      });
    }
  }, [index]);

  // Lightbox: focus/scroll body
  useEffect(() => {
    if (lightboxOpen) {
      lastFocusedRef.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        lightboxRef.current?.querySelector('[data-close]')?.focus?.();
      }, 0);
      // reset zoom/pan
      setZoom(1);
      panRef.current = { x: 0, y: 0 };
    } else {
      document.body.style.overflow = '';
      const btn = thumbBtnsRef.current[index];
      btn?.focus?.({ preventScroll: true });
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxOpen, index]);

  // Clavier global en lightbox (et trap)
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      else if (e.key === 'Escape') { e.preventDefault(); setLightboxOpen(false); }
      else if ((e.key === '+' || e.key === '=') && isImage) { e.preventDefault(); setZoom((z) => Math.min(3, z + 0.2)); }
      else if ((e.key === '-' || e.key === '_') && isImage) { e.preventDefault(); setZoom((z) => Math.max(1, z - 0.2)); }
      else if (e.key === '0' && isImage) { e.preventDefault(); setZoom(1); panRef.current = { x: 0, y: 0 }; }
      else if (e.key === 'Tab') {
        const root = lightboxRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll('button,[href],[tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightboxOpen, isImage]);

  // Navigation
  const goNext = useCallback(() => {
    if (!media.length) return;
    setIndex((prev) => {
      const nextIndex = prev + 1;
      return nextIndex >= media.length ? (loop ? 0 : media.length - 1) : nextIndex;
    });
  }, [media.length, loop]);

  const goPrev = useCallback(() => {
    if (!media.length) return;
    setIndex((prev) => {
      const nextIndex = prev - 1;
      return nextIndex < 0 ? (loop ? media.length - 1 : 0) : nextIndex;
    });
  }, [media.length, loop]);

  const handleThumbClick = (i) => setIndex(i);

  // Roving tabIndex sur vignettes (flèches)
  const onThumbsKeyDown = (e) => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    let next = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = Math.min(media.length - 1, index + 1);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = Math.max(0, index - 1);
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = media.length - 1;
    setIndex(next);
    thumbBtnsRef.current[next]?.focus?.();
  };

  // clavier sur image principale (hors lightbox)
  const onMainKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setLightboxOpen(true);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault(); goNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault(); goPrev();
    }
  };

  // Touch swipe en lightbox (et pinch-to-zoom)
  const onTouchStart = (e) => {
    if (!lightboxOpen) return;
    if (e.touches.length === 2) {
      const [a, b] = e.touches;
      pinchStartDist.current = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    } else {
      pinchStartDist.current = null;
      touchStartX.current = e.touches[0].clientX;
      touchDeltaX.current = 0;
    }
  };
  const onTouchMove = (e) => {
    if (!lightboxOpen) return;
    if (e.touches.length === 2 && isImage) {
      const [a, b] = e.touches;
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      if (pinchStartDist.current) {
        const delta = (d - pinchStartDist.current) / 200; // sensibilité
        setZoom((z) => Math.max(1, Math.min(3, z + delta)));
      }
    } else {
      touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    }
  };
  const onTouchEnd = () => {
    if (!lightboxOpen) return;
    if (pinchStartDist.current != null) {
      pinchStartDist.current = null;
      return;
    }
    const abs = Math.abs(touchDeltaX.current);
    if (abs > 40) {
      if (touchDeltaX.current < 0) goNext();
      else goPrev();
    }
    touchStartX.current = 0;
    touchDeltaX.current = 0;
  };

  // Wheel zoom (desktop) + pan à la souris
  const onWheel = (e) => {
    if (!lightboxOpen || !isImage) return;
    if (!e.ctrlKey && Math.abs(e.deltaY) < 10) return;
    e.preventDefault();
    setZoom((z) => Math.max(1, Math.min(3, z + (e.deltaY < 0 ? 0.1 : -0.1))));
  };

  const onPointerDown = (e) => {
    if (!isImage || zoom <= 1) return;
    setDragging(true);
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e) => {
    if (!dragging || !isImage || zoom <= 1) return;
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    panRef.current = {
      x: panRef.current.x + dx,
      y: panRef.current.y + dy,
    };
  };
  const onPointerUp = () => setDragging(false);

  const imgOnError = (i) => setImgErrors((m) => ({ ...m, [i]: true }));

  return (
    <div
      className="outline-none"
      aria-roledescription="carousel"
      aria-label="Galerie produit"
    >
      {/* Live region pour lecteur d’écran */}
      <span ref={liveRef} className="sr-only" role="status" aria-live="polite" />

      {/* Miniatures */}
      <div
        ref={thumbsRef}
        className="flex md:flex-col gap-2 md:w-24 overflow-x-auto md:overflow-y-auto mb-4 scroll-smooth"
        role="listbox"
        aria-label="Miniatures du produit"
        onKeyDown={onThumbsKeyDown}
      >
        {media.map((m, i) => {
          const selected = i === index;
          const src = imgErrors[i] ? PLACEHOLDER : m.src;
          return (
            <button
              key={(src || PLACEHOLDER) + i}
              ref={(el) => (thumbBtnsRef.current[i] = el)}
              onClick={() => handleThumbClick(i)}
              type="button"
              className={[
                'relative w-16 h-16 rounded border transition hover:opacity-90 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                selected ? 'border-black dark:border-white scale-105' : 'border-gray-300',
              ].join(' ')}
              role="option"
              aria-selected={selected}
              aria-label={`Miniature ${i + 1} sur ${media.length}`}
              tabIndex={selected ? 0 : -1}
            >
              {m.kind === 'video' ? (
                <div className="absolute inset-0 grid place-items-center text-xs bg-black/5 rounded">
                  🎞️
                </div>
              ) : (
                <Image
                  src={src || PLACEHOLDER}
                  alt={`${altBase} – miniature ${i + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover rounded"
                  placeholder="blur"
                  blurDataURL={BLUR}
                  unoptimized={unoptimized}
                  loading="lazy"
                  draggable={false}
                  onError={() => imgOnError(i)}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Image/Média principal */}
      <div className="relative">
        <motion.button
          key={current?.src || PLACEHOLDER}
          initial={prefersReducedMotion ? false : { opacity: 0.6, scale: 0.98 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.28 }}
          type="button"
          onClick={() => setLightboxOpen(true)}
          onKeyDown={onMainKeyDown}
          className="relative w-full aspect-[4/3] md:aspect-square cursor-zoom-in rounded-2xl overflow-hidden shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Agrandir le média"
        >
          {/* Edge fade pour le relief visuel */}
          {edgeFade && (
            <>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/15 to-transparent z-[1]" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/15 to-transparent z-[1]" />
            </>
          )}

          {isImage ? (
            <Image
              src={imgErrors[index] ? PLACEHOLDER : current?.src || PLACEHOLDER}
              alt={`${altBase} – vue principale (${index + 1} / ${media.length || 1})`}
              fill
              className="object-contain bg-white dark:bg-zinc-900"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              placeholder="blur"
              blurDataURL={BLUR}
              unoptimized={unoptimized}
              draggable={false}
              onError={() => imgOnError(index)}
            />
          ) : (
            <video
              className="h-full w-full object-contain bg-black"
              controls
              playsInline
              muted
              poster={current?.poster}
            >
              <source src={current?.src} />
            </video>
          )}

          {/* Compteur */}
          {showIndex && media.length > 1 && (
            <span
              className="absolute bottom-2 left-2 text-xs bg-black/60 text-white px-2 py-1 rounded z-[2]"
              aria-live="polite"
            >
              {index + 1}/{media.length}
            </span>
          )}

          {/* Aide zoom */}
          <span className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-2 py-1 rounded z-[2]">
            Cliquer pour zoom
          </span>
        </motion.button>

        {/* Flèches navigation rapide (desktop) */}
        {media.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Média précédent"
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Média suivant"
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
            aria-label="Aperçu en grand"
            onClick={() => setLightboxOpen(false)}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onWheel={onWheel}
          >
            <motion.div
              initial={prefersReducedMotion ? false : { scale: 0.92 }}
              animate={prefersReducedMotion ? undefined : { scale: 1 }}
              exit={prefersReducedMotion ? undefined : { scale: 0.92 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              className="relative w-full h-full max-w-6xl max-h-[90vh] outline-none"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
              {isImage ? (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in',
                  }}
                  onDoubleClick={() => {
                    setZoom((z) => (z > 1 ? 1 : 2));
                    panRef.current = { x: 0, y: 0 };
                  }}
                >
                  <Image
                    src={imgErrors[index] ? PLACEHOLDER : current?.src || PLACEHOLDER}
                    alt={`${altBase} – zoom (${index + 1} / ${media.length || 1})`}
                    fill
                    className="object-contain select-none will-change-transform"
                    draggable={false}
                    unoptimized={unoptimized}
                    priority
                    onError={() => imgOnError(index)}
                    style={{
                      transform: `translate3d(${panRef.current.x}px, ${panRef.current.y}px, 0) scale(${zoom})`,
                      transition: prefersReducedMotion ? 'none' : 'transform .08s linear',
                    }}
                  />
                </div>
              ) : (
                <video
                  className="h-full w-full object-contain bg-black"
                  controls
                  playsInline
                  muted
                  poster={current?.poster}
                >
                  <source src={current?.src} />
                </video>
              )}

              {/* Contrôles */}
              {media.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Média précédent"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/20 text-white text-2xl leading-none backdrop-blur hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Média suivant"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/20 text-white text-2xl leading-none backdrop-blur hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    ›
                  </button>
                </>
              )}

              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/90">
                {index + 1}/{media.length}{isImage && ` — zoom ${Math.round(zoom * 100)}%`}
              </div>

              {/* Boutons zoom (images) */}
              {isImage && (
                <div className="absolute top-2 left-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
                    aria-label="Zoom -"
                    className="h-10 w-10 rounded-full bg-white/20 text-white text-lg backdrop-blur hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                    aria-label="Zoom +"
                    className="h-10 w-10 rounded-full bg-white/20 text-white text-lg backdrop-blur hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => { setZoom(1); panRef.current = { x: 0, y: 0 }; }}
                    aria-label="Réinitialiser le zoom"
                    className="h-10 px-3 rounded-full bg-white/20 text-white text-sm backdrop-blur hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    Reset
                  </button>
                </div>
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
