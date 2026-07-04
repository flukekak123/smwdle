'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { GameResult, Monster } from '../lib/types';
import { encodeShare } from '../lib/shareEncoder';
import { Modal } from './Modal';
import { useCountdown } from '../providers/useCountdown';
import { copyToClipboard } from '../providers/share';

interface Props {
  open: boolean;
  onClose: () => void;
  monster: Monster;
  result: GameResult;
  streak: number;
  nextResetAt: Date | null;
}

export function ResultModal({ open, onClose, monster, result, streak, nextResetAt }: Props) {
  const t = useTranslations();
  const countdown = useCountdown(nextResetAt);
  const [copied, setCopied] = useState(false);

  const onShare = async () => {
    const ok = await copyToClipboard(encodeShare(result));
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t('result.solvedTitle')} testId="result-modal">
      <div className="flex flex-col items-center gap-3 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={monster.imageUrl ?? '/placeholder-monster.svg'}
          alt={monster.name}
          width={96}
          height={96}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/placeholder-monster.svg';
          }}
          className="h-24 w-24 rounded-xl bg-slate-100 object-contain dark:bg-slate-700"
        />
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{monster.name}</div>
        <div className="text-sm text-slate-600 dark:text-slate-300">
          {t('result.guessCount', { count: result.guesses.length })} · {t('result.streak')}: {streak}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {t('result.nextIn')} <span className="font-mono">{countdown}</span>
        </div>
        <button
          data-testid="share-button"
          onClick={onShare}
          className="mt-2 rounded-lg bg-accent px-5 py-2 font-semibold text-white hover:opacity-90"
        >
          {copied ? t('result.copied') : t('result.share')}
        </button>
      </div>
    </Modal>
  );
}
