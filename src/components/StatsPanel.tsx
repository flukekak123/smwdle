'use client';

import { useTranslations } from 'next-intl';
import type { Stats } from '../lib/types';
import { Modal } from './Modal';

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</span>
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}

export function StatsPanel({ open, onClose, stats }: { open: boolean; onClose: () => void; stats: Stats }) {
  const t = useTranslations();
  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  const dist = Object.entries(stats.distribution).sort((a, b) => Number(a[0]) - Number(b[0]));
  const maxCount = Math.max(1, ...dist.map(([, c]) => c));

  return (
    <Modal open={open} onClose={onClose} title={t('stats.title')} testId="stats-panel">
      <div className="grid grid-cols-4 gap-2 border-b border-slate-200 pb-4 dark:border-slate-700">
        <Stat label={t('stats.played')} value={stats.played} />
        <Stat label={t('stats.winRate')} value={winRate} />
        <Stat label={t('stats.current')} value={stats.currentStreak} />
        <Stat label={t('stats.max')} value={stats.maxStreak} />
      </div>
      <div className="pt-4">
        <div className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          {t('stats.distribution')}
        </div>
        {dist.length === 0 && <div className="text-sm text-slate-400">—</div>}
        <div className="flex flex-col gap-1">
          {dist.map(([guesses, count]) => (
            <div key={guesses} className="flex items-center gap-2 text-xs">
              <span className="w-4 text-right text-slate-500 dark:text-slate-400">{guesses}</span>
              <div
                className="rounded bg-accent px-2 py-0.5 text-right text-white"
                style={{ width: `${(count / maxCount) * 100}%`, minWidth: '1.5rem' }}
              >
                {count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
