import en from './en.json';
import th from './th.json';
import type { Locale } from '../lib/types';

export const LOCALES: Locale[] = ['en', 'th'];
export const DEFAULT_LOCALE: Locale = 'en';

export const MESSAGES: Record<Locale, typeof en> = { en, th };

export const LOCALE_LABELS: Record<Locale, string> = { en: 'EN', th: 'ไทย' };

/** Best-effort locale from the browser: 'th' if the UA prefers Thai, else 'en'. */
export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;
  return navigator.language?.toLowerCase().startsWith('th') ? 'th' : 'en';
}
