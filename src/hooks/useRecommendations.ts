'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export interface ProductLite {
  id: string;
  slug: string;
  title: string;
  price?: number;
  image?: string;
  [k: string]: unknown;
}

interface State {
  data: ProductLite[];
  loading: boolean;
  error?: string;
}

export default function useRecommendations(category?: string, excludeId?: string) {
  const [state, setState] = useState<State>({ data: [], loading: false });
  const cache = useRef<string>('');
  const dataLength = state.data.length;

  useEffect(() => {
    if (!category) return;

    const key = `${category}|${excludeId ?? ''}`;
    if (cache.current === key && dataLength > 0) return;

    const controller = new AbortController();
    const url = `/api/products/recommendations?category=${encodeURIComponent(category)}${
      excludeId ? `&excludeId=${encodeURIComponent(excludeId)}` : ''
    }`;

    setState((s) => ({ ...s, loading: true, error: undefined }));

    fetch(url, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((json: ProductLite[]) => {
        cache.current = key;
        setState({ data: json ?? [], loading: false });
      })
      .catch((e) => {
        if (controller.signal.aborted) return;
        setState({ data: [], loading: false, error: e?.message ?? 'Unknown error' });
      });

    return () => controller.abort();
  }, [category, excludeId, dataLength]);

  return useMemo(() => state, [state]);
}