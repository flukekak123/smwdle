'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from '../providers/ThemeProvider';

const ICON = { system: '🖥️', light: '☀️', dark: '🌙' } as const;

export function ThemeToggle() {
  const t = useTranslations();
  const { theme, cycleTheme } = useTheme();

  return (
    <button
      data-testid="theme-toggle"
      onClick={cycleTheme}
      aria-label={t('common.theme')}
      title={`${t('common.theme')}: ${theme}`}
      className="rounded-md border border-slate-300 px-2 py-1 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
    >
      <span aria-hidden="true">{ICON[theme]}</span>
    </button>
  );
}
