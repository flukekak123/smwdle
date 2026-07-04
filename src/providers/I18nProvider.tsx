'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import type { Locale } from '../lib/types';
import { DEFAULT_LOCALE, MESSAGES, detectLocale } from '../i18n/config';
import { loadState, patchState } from './persistence';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => undefined,
});

export function useLocaleControls(): LocaleContextValue {
  return useContext(LocaleContext);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Resolve the saved (or browser) locale on the client to avoid hydration mismatch.
  useEffect(() => {
    const saved = loadState().locale;
    setLocaleState(saved ?? detectLocale());
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    patchState({ locale: l });
  };

  const ctx = useMemo(() => ({ locale, setLocale }), [locale]);

  return (
    <LocaleContext.Provider value={ctx}>
      <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone="UTC">
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
