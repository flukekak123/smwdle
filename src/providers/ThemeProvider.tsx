'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { safeStorage } from './storage';

type Theme = 'system' | 'light' | 'dark';
const THEME_KEY = 'smwdle:theme';

interface ThemeContextValue {
  theme: Theme;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'system', cycleTheme: () => undefined });

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

function apply(theme: Theme): void {
  if (typeof document === 'undefined') return;
  const prefersDark =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const dark = theme === 'dark' || (theme === 'system' && prefersDark);
  document.documentElement.classList.toggle('dark', dark);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const saved = (safeStorage.get(THEME_KEY) as Theme) || 'system';
    setTheme(saved);
    apply(saved);
  }, []);

  const cycleTheme = () => {
    const order: Theme[] = ['system', 'light', 'dark'];
    const next = order[(order.indexOf(theme) + 1) % order.length]!;
    setTheme(next);
    safeStorage.set(THEME_KEY, next);
    apply(next);
  };

  return <ThemeContext.Provider value={{ theme, cycleTheme }}>{children}</ThemeContext.Provider>;
}
