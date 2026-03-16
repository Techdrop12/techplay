'use client';

import { useEffect } from 'react';

import type { ReactNode } from 'react';

import { CartProvider } from '@/context/cartContext';

type Props = {
  children: ReactNode;
};

type MediaQueryLike = MediaQueryList | null;
type MediaQueryHandler = () => void;

function addMediaListener(query: MediaQueryLike, handler: MediaQueryHandler) {
  if (!query) return () => undefined;

  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', handler);
    return () => query.removeEventListener('change', handler);
  }

  if (typeof query.addListener === 'function') {
    query.addListener(handler);
    return () => query.removeListener(handler);
  }

  return () => undefined;
}

function addWindowListener<K extends keyof WindowEventMap>(
  type: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: AddEventListenerOptions | boolean
) {
  window.addEventListener(type, handler as EventListener, options);
  return () => window.removeEventListener(type, handler as EventListener, options);
}

export default function RootLayoutClient({ children }: Props) {
  useEffect(() => {
    const root = document.documentElement;

    root.setAttribute('data-js', 'true');

    const mqReduce: MediaQueryLike =
      window.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null;
    const mqContrast: MediaQueryLike = window.matchMedia?.('(prefers-contrast: more)') ?? null;
    const mqPointerCoarse: MediaQueryLike = window.matchMedia?.('(pointer: coarse)') ?? null;
    const mqGamutP3: MediaQueryLike = window.matchMedia?.('(color-gamut: p3)') ?? null;
    const mqHover: MediaQueryLike = window.matchMedia?.('(hover: hover)') ?? null;
    const mqDark: MediaQueryLike = window.matchMedia?.('(prefers-color-scheme: dark)') ?? null;

    const setMotionAttr = () => {
      root.setAttribute('data-reduced-motion', mqReduce?.matches ? 'reduce' : 'no-preference');
    };

    const setContrastAttr = () => {
      root.setAttribute('data-contrast', mqContrast?.matches ? 'more' : 'standard');
    };

    const setPointerAttr = () => {
      root.setAttribute('data-pointer', mqPointerCoarse?.matches ? 'coarse' : 'fine');
    };

    const setGamutAttr = () => {
      root.setAttribute('data-gamut', mqGamutP3?.matches ? 'p3' : 'srgb');
    };

    const setHoverAttr = () => {
      root.setAttribute('data-hover', mqHover?.matches ? 'hover' : 'none');
    };

    const setSchemeAttr = () => {
      root.setAttribute('data-system-theme', mqDark?.matches ? 'dark' : 'light');
    };

    const setOnlineAttr = () => {
      root.setAttribute('data-online', navigator.onLine ? 'true' : 'false');
    };

    const setTouchAttr = () => {
      const maxTouchPoints =
        typeof navigator.maxTouchPoints === 'number' ? navigator.maxTouchPoints : 0;
      root.setAttribute('data-touch', maxTouchPoints > 0 ? 'true' : 'false');
    };

    setMotionAttr();
    setContrastAttr();
    setPointerAttr();
    setGamutAttr();
    setHoverAttr();
    setSchemeAttr();
    setOnlineAttr();
    setTouchAttr();

    const cleanups = [
      addMediaListener(mqReduce, setMotionAttr),
      addMediaListener(mqContrast, setContrastAttr),
      addMediaListener(mqPointerCoarse, setPointerAttr),
      addMediaListener(mqGamutP3, setGamutAttr),
      addMediaListener(mqHover, setHoverAttr),
      addMediaListener(mqDark, setSchemeAttr),
      addWindowListener('online', setOnlineAttr),
      addWindowListener('offline', setOnlineAttr),
    ];

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    const setVH = () => {
      const vv = window.visualViewport;
      const height = vv ? vv.height : window.innerHeight;
      root.style.setProperty('--vh', `${height * 0.01}px`);
    };

    const setVW = () => {
      const vv = window.visualViewport;
      const width = vv ? vv.width : window.innerWidth;
      root.style.setProperty('--vw', `${width * 0.01}px`);
    };

    const syncViewportVars = () => {
      setVH();
      setVW();
    };

    syncViewportVars();

    const vv = window.visualViewport;
    const cleanups = [
      addWindowListener('resize', syncViewportVars),
      addWindowListener('orientationchange', syncViewportVars),
    ];

    if (vv) {
      vv.addEventListener('resize', syncViewportVars);
      vv.addEventListener('scroll', syncViewportVars);

      cleanups.push(() => {
        vv.removeEventListener('resize', syncViewportVars);
        vv.removeEventListener('scroll', syncViewportVars);
      });
    }

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  useEffect(() => {
    const id = 'portal-root';
    const existing = document.getElementById(id);
    if (existing) return;

    const el = document.createElement('div');
    el.id = id;
    el.setAttribute('data-portal-root', 'true');
    document.body.appendChild(el);

    return () => {
      if (el.parentNode) el.parentNode.removeChild(el);
    };
  }, []);

  return <CartProvider>{children}</CartProvider>;
}
