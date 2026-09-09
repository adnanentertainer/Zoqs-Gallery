export interface LocalStorageStore<T> {
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  subscribe: (listener: () => void) => () => void;
  set: (value: T) => void;
}

/**
 * A tiny external store synced to a single localStorage key, meant for use with
 * `useSyncExternalStore`. Reading storage only ever happens on the client (the
 * server snapshot is always `fallback`), so the first client render matches the
 * server-rendered HTML and hydrates cleanly before the real persisted value appears.
 */
export function createLocalStorageStore<T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T,
): LocalStorageStore<T> {
  let cached = fallback;
  let hasReadStorage = false;
  const listeners = new Set<() => void>();

  function readFromStorage(): T {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed: unknown = JSON.parse(raw);
      return isValid(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }

  function getSnapshot(): T {
    if (typeof window === "undefined") return fallback;
    if (!hasReadStorage) {
      cached = readFromStorage();
      hasReadStorage = true;
    }
    return cached;
  }

  function getServerSnapshot(): T {
    return fallback;
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function set(value: T): void {
    cached = value;
    hasReadStorage = true;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // localStorage unavailable (private browsing, storage full, etc.) —
        // state still updates in memory for this session, it just won't persist.
      }
    }
    listeners.forEach((listener) => listener());
  }

  return { getSnapshot, getServerSnapshot, subscribe, set };
}
