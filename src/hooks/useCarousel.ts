import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useReducedMotion } from 'framer-motion';

interface UseCarouselOptions {
  total: number;
  intervalMs: number;
  autoplay: boolean;
  pauseOnHover: boolean;
  pauseWhenHidden: boolean;
  containerRef: React.RefObject<HTMLElement | null>;
  onIndexChange?: (index: number) => void;
}

export interface UseCarouselReturn {
  index: number;
  progress: number;
  isPaused: boolean;
  isUserPaused: boolean;
  prefersReducedMotion: boolean | null;
  canNavigate: boolean;
  next: () => void;
  prev: () => void;
  goTo: (i: number) => void;
  pauseUser: () => void;
  resumeUser: () => void;
  autoPause: () => void;
  autoResume: () => void;
  runManualAction: (action: () => void) => void;
}

function pushDL(event: string, payload?: Record<string, unknown>) {
  try {
    const dl = (window as Window & { dataLayer?: Array<Record<string, unknown>> }).dataLayer;
    dl?.push({ event, ...payload });
  } catch {
    // no-op
  }
}

export function useCarousel({
  total,
  intervalMs,
  autoplay,
  pauseWhenHidden,
  containerRef,
  onIndexChange,
}: UseCarouselOptions): UseCarouselReturn {
  const canNavigate = total > 1;
  const prefersReducedMotion = useReducedMotion();
  const effectiveAutoplay = autoplay && !prefersReducedMotion && canNavigate;

  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [slideEpoch, setSlideEpoch] = useState(0);

  const progressRef = useRef(0);
  progressRef.current = progress;
  const userPausedRef = useRef(false);

  useEffect(() => {
    if (index > Math.max(0, total - 1)) setIndex(0);
  }, [index, total]);

  const next = useCallback(() => {
    setIndex((cur) => {
      const n = canNavigate ? (cur + 1) % total : 0;
      pushDL('hero_next', { index: n });
      return n;
    });
  }, [canNavigate, total]);

  const nextRef = useRef(next);
  nextRef.current = next;

  const prev = useCallback(() => {
    setIndex((cur) => {
      const p = canNavigate ? (cur - 1 + total) % total : 0;
      pushDL('hero_prev', { index: p });
      return p;
    });
  }, [canNavigate, total]);

  const goTo = useCallback((i: number) => {
    setIndex(i);
    pushDL('hero_goto', { index: i });
  }, []);

  const pauseUser = useCallback(() => {
    userPausedRef.current = true;
    setIsPaused(true);
    pushDL('hero_paused_user');
  }, []);

  const resumeUser = useCallback(() => {
    userPausedRef.current = false;
    setIsPaused(false);
    pushDL('hero_resumed_user');
  }, []);

  const autoPause = useCallback(() => {
    if (userPausedRef.current) return;
    setIsPaused(true);
  }, []);

  const autoResume = useCallback(() => {
    if (userPausedRef.current) return;
    setIsPaused(false);
  }, []);

  const runManualAction = useCallback(
    (action: () => void) => {
      const shouldResume = !userPausedRef.current && effectiveAutoplay;
      if (shouldResume) setIsPaused(true);
      action();
      setProgress(0);
      if (shouldResume) requestAnimationFrame(() => setIsPaused(false));
    },
    [effectiveAutoplay]
  );

  useLayoutEffect(() => {
    setProgress(0);
    setSlideEpoch((e) => e + 1);
    onIndexChange?.(index);
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!effectiveAutoplay || isPaused) return;

    let rafId = 0;
    const start = performance.now() - (progressRef.current / 100) * intervalMs;

    const tick = (now: number) => {
      const ratio = (now - start) / intervalMs;
      if (ratio >= 1) {
        setProgress(100);
        nextRef.current();
        return;
      }
      setProgress(ratio * 100);
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [effectiveAutoplay, intervalMs, isPaused, slideEpoch]);

  useEffect(() => {
    if (!pauseWhenHidden) return;
    const onVisibility = () => (document.hidden ? autoPause() : autoResume());
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [autoPause, autoResume, pauseWhenHidden]);

  useEffect(() => {
    if (!pauseWhenHidden || typeof window === 'undefined') return;
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => (entries[0]?.isIntersecting ? autoResume() : autoPause()),
      { threshold: 0.4 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [autoPause, autoResume, pauseWhenHidden, containerRef]);

  return {
    index,
    progress,
    isPaused,
    isUserPaused: userPausedRef.current,
    prefersReducedMotion: prefersReducedMotion ?? null,
    canNavigate,
    next,
    prev,
    goTo,
    pauseUser,
    resumeUser,
    autoPause,
    autoResume,
    runManualAction,
  };
}
