'use client';

import Image from 'next/image';
import {
  useState,
  useRef,
  type KeyboardEventHandler,
  type PointerEventHandler,
} from 'react';

import PricingBadge from '@/components/PricingBadge';
import { cn } from '@/lib/utils';

const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJiIiB4PSIwIiB5PSIwIj48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYikiIGZpbGw9IiNlZWUiIC8+PC9zdmc+';

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function IconShare({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M14 3l7 7-7 7v-4h-1.5A7.5 7.5 0 0 1 5 5.5V4a1 1 0 0 1 1-1h1.5A7.5 7.5 0 0 0 12.5 10H14V3zM6 20h12v2H6z"
      />
    </svg>
  );
}

type GalleryT = {
  imageLabel: string;
  of: string;
  imageHelp: string;
  imageHelpOut: string;
  galleryLabel: string;
  newLabel: string;
  bestSeller: string;
  share: string;
};

interface ProductGalleryProps {
  gallery: string[];
  title: string;
  isNew: boolean;
  isBestSeller: boolean;
  discount: number | null;
  price: number;
  oldPrice?: number;
  t: GalleryT;
  prefersReducedMotion: boolean | null;
  onShare: () => void;
  onActiveChange?: (idx: number) => void;
}

export default function ProductGallery({
  gallery,
  title,
  isNew,
  isBestSeller,
  discount,
  price,
  oldPrice,
  t,
  prefersReducedMotion,
  onShare,
  onActiveChange,
}: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [imgLoaded, setImgLoaded] = useState(false);
  const mediaRef = useRef<HTMLDivElement | null>(null);

  const activeImage = gallery[activeIdx] ?? gallery[0] ?? '';

  const selectIdx = (idx: number) => {
    setActiveIdx(idx);
    onActiveChange?.(idx);
    setImgLoaded(false);
  };

  const toggleZoom = () => {
    if (prefersReducedMotion) return;
    setZoomed((v) => !v);
  };

  const onPointerMove: PointerEventHandler<HTMLDivElement> = (event) => {
    if (!mediaRef.current || !zoomed) return;
    const rect = mediaRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x: clamp(x, 0, 100), y: clamp(y, 0, 100) });
  };

  const onMediaKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleZoom();
    }
    if (event.key === 'ArrowLeft') selectIdx(Math.max(0, activeIdx - 1));
    if (event.key === 'ArrowRight') selectIdx(Math.min(gallery.length - 1, activeIdx + 1));
  };

  return (
    <div className="flex flex-col gap-5 sm:gap-8 min-w-0">
      <div className="rounded-2xl bg-[hsl(var(--surface-2))] p-2 shadow-[var(--shadow-lg)] sm:p-3">
        <div
          ref={mediaRef}
          className={cn(
            'relative aspect-square w-full overflow-hidden rounded-xl',
            'border border-[hsl(var(--border))]',
            'bg-[hsl(var(--surface))] shadow-[var(--shadow-md)]'
          )}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setZoomed(false)}
          onClick={toggleZoom}
          onKeyDown={onMediaKeyDown}
          role="button"
          aria-label={`${t.imageLabel} ${activeIdx + 1} ${t.of} ${gallery.length} : ${title}`}
          aria-busy={!imgLoaded}
          tabIndex={0}
        >
          <Image
            key={activeImage}
            src={activeImage}
            alt={`${t.imageLabel} ${activeIdx + 1} ${t.of} ${gallery.length} - ${title}`}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className={cn(
              'object-cover transition-transform duration-700 will-change-transform',
              zoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in hover:scale-[1.03]'
            )}
            style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}
            onLoad={() => setImgLoaded(true)}
            itemProp="image"
            draggable={false}
          />

          {!imgLoaded && (
            <div
              className="absolute inset-0 animate-pulse bg-gradient-to-br from-[hsl(var(--surface-2))] via-[hsl(var(--surface))] to-[hsl(var(--surface-2))]"
              aria-hidden="true"
            />
          )}

          <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-col gap-1.5 sm:left-5 sm:top-5">
            {isNew ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/95 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-950 shadow-[0_12px_35px_rgba(4,120,87,0.7)] ring-1 ring-emerald-900/40">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-900/90" />
                {t.newLabel}
              </span>
            ) : null}
            {isBestSeller ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300/95 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-950 shadow-[0_12px_35px_rgba(120,53,15,0.55)] ring-1 ring-amber-900/35">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-700" />
                {t.bestSeller}
              </span>
            ) : null}
            {discount ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/95 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-50 shadow-[0_12px_35px_rgba(127,29,29,0.7)] ring-1 ring-red-900/40">
                <span className="h-1.5 w-1.5 rounded-full bg-red-200" />-{discount}%
              </span>
            ) : null}
          </div>

          <div className="absolute bottom-4 right-4 z-10">
            <PricingBadge price={price} oldPrice={oldPrice} showDiscountLabel showOldPrice />
          </div>

          <div className="absolute right-4 top-4 z-10 flex gap-2 sm:right-5 sm:top-5">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onShare(); }}
              className="rounded-full border border-white/20 bg-black/40 px-3.5 py-2.5 text-white shadow-[0_12px_35px_rgba(15,23,42,0.7)] backdrop-blur-xl transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              aria-label={t.share}
              title={t.share}
            >
              <IconShare size={18} />
            </button>
          </div>

          <p className="sr-only">{zoomed ? t.imageHelpOut : t.imageHelp}</p>
        </div>
      </div>

      {gallery.length > 1 ? (
        <nav aria-label={t.galleryLabel} className="flex flex-col gap-3">
          <ul
            role="list"
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 sm:gap-4 sm:flex-wrap sm:overflow-visible sm:pb-0"
          >
            {gallery.map((src, idx) => {
              const active = idx === activeIdx;
              return (
                <li key={`${src}-${idx}`} className="shrink-0 snap-start sm:shrink-0">
                  <button
                    type="button"
                    onClick={() => selectIdx(idx)}
                    onMouseEnter={() => !prefersReducedMotion && selectIdx(idx)}
                    className={cn(
                      'relative flex h-20 w-20 overflow-hidden rounded-xl border transition-all duration-200 sm:h-24 sm:w-24',
                      active
                        ? 'border-[hsl(var(--accent))] ring-2 ring-[hsl(var(--accent))] ring-offset-2 ring-offset-[hsl(var(--surface))] shadow-[var(--shadow-md)]'
                        : 'border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/.5)] hover:shadow-[var(--shadow-sm)]'
                    )}
                    aria-label={`${t.imageLabel} ${idx + 1}`}
                    aria-current={active ? 'true' : undefined}
                  >
                    <Image
                      src={src}
                      alt={title ? `${title} (${idx + 1})` : ''}
                      fill
                      sizes="96px"
                      className="object-cover"
                      loading="lazy"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
