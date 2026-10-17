// apps/home/src/useLoad.ts
//
// A small helper for screens that need to fetch something when they open (like
// the list of my buildings). It runs the fetch once, then tells the screen one
// of three things: "still loading", "here is the answer" or "it failed" (with a
// plain sentence). `reload()` tries again, for a "Try again" button.
// Owned by Bishal.

import { useCallback, useEffect, useRef, useState } from 'react';

import { friendlyErrorMessage } from './friendlyMessages';

type LoadState<T> = {
  data: T | null;
  /** A plain sentence when the fetch failed, otherwise null. */
  error: string | null;
  loading: boolean;
  reload: () => void;
};

export function useLoad<T>(loader: () => Promise<T>): LoadState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    loaderRef
      .current()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((caught) => {
        if (!cancelled) setError(friendlyErrorMessage(caught as { message?: string }));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => setAttempt((current) => current + 1), []);

  return { data, error, loading, reload };
}
