'use client';

// Fail-safe storage wrapper: falls back to in-memory when localStorage is
// unavailable (private mode, quota, SSR). Never throws.

const memory = new Map<string, string>();

export const safeStorage = {
  get(key: string): string | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return memory.get(key) ?? null;
      return window.localStorage.getItem(key);
    } catch {
      return memory.get(key) ?? null;
    }
  },
  set(key: string, value: string): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        memory.set(key, value);
        return;
      }
      window.localStorage.setItem(key, value);
    } catch {
      memory.set(key, value);
    }
  },
};
