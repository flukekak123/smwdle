'use client';

import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations();
  return (
    <footer className="mt-8 border-t border-slate-200 pt-4 text-center text-xs text-slate-400 dark:border-slate-700">
      {t('footer.attribution')}
    </footer>
  );
}
