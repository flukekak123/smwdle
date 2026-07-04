'use client';

import { useTranslations } from 'next-intl';
import type { Locale } from '../lib/types';
import { LOCALE_LABELS, LOCALES } from '../i18n/config';
import { useLocaleControls } from '../providers/I18nProvider';

export function LanguageToggle() {
  const t = useTranslations();
  const { locale, setLocale } = useLocaleControls();
  const next: Locale = LOCALES[(LOCALES.indexOf(locale) + 1) % LOCALES.length]!;

  return (
    <button
      data-testid="language-toggle"
      onClick={() => setLocale(next)}
      aria-label={t('common.language')}
      title={t('common.language')}
      className="rounded-md border border-slate-300 px-2 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
    >
      {LOCALE_LABELS[locale]}
    </button>
  );
}
