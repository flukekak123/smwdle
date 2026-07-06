'use client';

import { useTranslations } from 'next-intl';
import type { AttributeResult } from '../lib/types';

const ICON: Record<AttributeResult['status'], string> = {
  match: '✓',
  'no-match': '✕',
  higher: '▲',
  lower: '▼',
  partial: '≈',
};

const STYLE: Record<AttributeResult['status'], string> = {
  match: 'bg-green-600 text-white border-green-700',
  'no-match': 'bg-red-600 text-white border-red-700',
  higher: 'bg-amber-500 text-white border-amber-600',
  lower: 'bg-amber-500 text-white border-amber-600',
  partial: 'bg-yellow-400 text-slate-900 border-yellow-500',
};

interface Props {
  attribute: AttributeResult;
  /** Staggered flip reveal: delay in ms. Omit (undefined) for no animation. */
  revealDelayMs?: number;
}

export function HintCell({ attribute, revealDelayMs }: Props) {
  const t = useTranslations();
  const label = t(`columns.${attribute.key}`);
  const statusText = t(`status.${attribute.status}`);
  const isList = attribute.key === 'buffs' || attribute.key === 'debuffs';
  const sizing = isList ? 'text-[9px] leading-tight sm:text-[10px]' : 'text-xs sm:text-sm';
  const anim = revealDelayMs !== undefined ? 'animate-flip' : '';

  return (
    <div
      data-testid={`hint-cell-${attribute.key}`}
      style={revealDelayMs !== undefined ? { animationDelay: `${revealDelayMs}ms` } : undefined}
      className={`flex flex-col items-center justify-center rounded-md border p-1 text-center min-h-14 ${sizing} ${anim} ${STYLE[attribute.status]}`}
      aria-label={`${label}: ${attribute.guessValue} — ${statusText}`}
      role="img"
    >
      <span aria-hidden="true" className="text-[10px] leading-none opacity-90">
        {ICON[attribute.status]}
      </span>
      <span aria-hidden="true" className="mt-0.5 font-medium break-words">
        {attribute.guessValue}
      </span>
      <span className="sr-only">{statusText}</span>
    </div>
  );
}
