'use client';

import { useTranslations } from 'next-intl';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';

export function Header({
  onOpenStats,
  onOpenPool,
}: {
  onOpenStats: () => void;
  onOpenPool: () => void;
}) {
  const t = useTranslations();
  return (
    <header className="flex w-full items-center justify-between gap-2">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          {t('app.title')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">{t('app.tagline')}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          data-testid="pool-button"
          onClick={onOpenPool}
          aria-label={t('common.pool')}
          title={t('common.pool')}
          className="rounded-md border border-slate-300 px-2 py-1 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
        >
          <span aria-hidden="true">👾</span>
        </button>
        <button
          data-testid="stats-button"
          onClick={onOpenStats}
          aria-label={t('common.stats')}
          title={t('common.stats')}
          className="rounded-md border border-slate-300 px-2 py-1 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
        >
          <span aria-hidden="true">📊</span>
        </button>
        <LanguageToggle />
        <ThemeToggle />
      </div>
    </header>
  );
}
