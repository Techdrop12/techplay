'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = Exclude<ThemeMode, 'system'>;

export interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  isDark: boolean;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const THEME_KEY = 'theme' as const;

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  return mode === 'system' ? getSystemTheme() : mode;
}

function readStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system';

  try {
    const raw = window.localStorage.getItem(THEME_KEY);
    return isThemeMode(raw) ? raw : 'system';
  } catch {
    return 'system';
  }
}

function applyTheme(resolvedTheme: ResolvedTheme) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const isDark = resolvedTheme === 'dark';

  root.classList.toggle('dark', isDark);
  root.classList.toggle('light', !isDark);
  root.setAttribute('data-theme', resolvedTheme);
  root.style.colorScheme = isDark ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  const themeRef = useRef<ThemeMode>('system');

  const syncTheme = useCallback((nextTheme: ThemeMode) => {
    const nextResolved = resolveTheme(nextTheme);
    themeRef.current = nextTheme;
    setThemeState(nextTheme);
    setResolvedTheme(nextResolved);
    applyTheme(nextResolved);
  }, []);

  useEffect(() => {
    const initialTheme = readStoredTheme();
    syncTheme(initialTheme);

    const mediaQuery =
      typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    const onSystemSchemeChange = () => {
      if (themeRef.current !== 'system') return;
      const nextResolved = getSystemTheme();
      setResolvedTheme(nextResolved);
      applyTheme(nextResolved);
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_KEY) return;
      const nextTheme = isThemeMode(event.newValue) ? event.newValue : 'system';
      syncTheme(nextTheme);
    };

    mediaQuery?.addEventListener?.('change', onSystemSchemeChange);
    window.addEventListener('storage', onStorage);

    return () => {
      mediaQuery?.removeEventListener?.('change', onSystemSchemeChange);
      window.removeEventListener('storage', onStorage);
    };
  }, [syncTheme]);

  const setTheme = useCallback(
    (mode: ThemeMode) => {
      try {
        window.localStorage.setItem(THEME_KEY, mode);
      } catch {
        // no-op
      }

      syncTheme(mode);
    },
    [syncTheme]
  );

  const toggleTheme = useCallback(() => {
    const currentBase: ResolvedTheme =
      themeRef.current === 'system' ? resolveTheme('system') : themeRef.current;
    setTheme(currentBase === 'dark' ? 'light' : 'dark');
  }, [setTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      isDark: resolvedTheme === 'dark',
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeProvider;
