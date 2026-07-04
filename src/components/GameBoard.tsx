'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import type { Element, GuessResult } from '../lib/types';
import { ATTRIBUTE_ORDER } from '../lib/types';
import { catalog } from '../lib/index';
import { HintCell } from './HintCell';

const ELEMENT_DOT: Record<Element, string> = {
  Fire: 'bg-red-500',
  Water: 'bg-blue-500',
  Wind: 'bg-yellow-500',
  Light: 'bg-amber-200',
  Dark: 'bg-purple-600',
};

const CELL_STAGGER_MS = 300;

export function GameBoard({ guesses }: { guesses: GuessResult[] }) {
  const t = useTranslations();
  // Rows restored from storage on page load should not animate; only rows
  // added during this session flip in. `seenRef` tracks how many rows existed
  // before the current render (and resets when the board is cleared).
  const seenRef = useRef(guesses.length);
  if (guesses.length < seenRef.current) seenRef.current = guesses.length;
  const animateFrom = seenRef.current;
  useEffect(() => {
    seenRef.current = guesses.length;
  });
  if (guesses.length === 0) return null;

  return (
    <div data-testid="game-board" className="w-full overflow-x-auto">
      <div className="min-w-[880px]">
        {/* Column headers: Image + Monster + attributes */}
        <div className="grid grid-cols-10 gap-1 pb-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 sm:text-xs">
          <div>{t('columns.image')}</div>
          <div className="text-left">{t('columns.monster')}</div>
          {ATTRIBUTE_ORDER.map((key) => (
            <div key={key}>{t(`columns.${key}`)}</div>
          ))}
        </div>
        {/* Guess rows, most recent first */}
        <div className="flex flex-col gap-1">
          {[...guesses].reverse().map((g, i) => {
            const monster = catalog.getById(g.monsterId);
            const originalIdx = guesses.length - 1 - i;
            const animate = originalIdx >= animateFrom;
            const fade = animate ? 'animate-fade' : '';
            return (
              <div key={g.monsterId} className="grid grid-cols-10 gap-1" data-testid="guess-row">
                <div
                  data-testid="guess-row-image"
                  className={`flex min-h-14 items-center justify-center rounded-md border border-slate-200 bg-slate-100 p-1 dark:border-slate-600 dark:bg-slate-700 ${fade}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={monster?.imageUrl ?? '/placeholder-monster.svg'}
                    alt={monster?.name ?? `#${g.monsterId}`}
                    width={40}
                    height={40}
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/placeholder-monster.svg';
                    }}
                    className="h-10 w-10 object-contain"
                  />
                </div>
                <div
                  data-testid="guess-row-name"
                  className={`flex min-h-14 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 text-left text-xs font-medium text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 sm:text-sm ${fade}`}
                >
                  {monster && (
                    <span
                      aria-hidden="true"
                      className={`h-2.5 w-2.5 flex-none rounded-full ring-1 ring-black/10 ${ELEMENT_DOT[monster.element]}`}
                    />
                  )}
                  <span className="break-words leading-tight">{monster?.name ?? `#${g.monsterId}`}</span>
                </div>
                {g.attributes.map((attr, col) => (
                  <HintCell
                    key={attr.key}
                    attribute={attr}
                    revealDelayMs={animate ? col * CELL_STAGGER_MS : undefined}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
