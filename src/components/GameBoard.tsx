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
      <div className="min-w-[900px]">
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
            // Collab reskin twins share the guess — show every skin's image + name.
            const forms = monster
              ? [monster, ...monster.twinIds.map((id) => catalog.getById(id)).filter(Boolean)]
              : [];
            const originalIdx = guesses.length - 1 - i;
            const animate = originalIdx >= animateFrom;
            const fade = animate ? 'animate-fade' : '';
            const imgSize = forms.length > 1 ? 'h-8 w-8' : 'h-10 w-10';
            return (
              <div key={g.monsterId} className="grid grid-cols-10 gap-1" data-testid="guess-row">
                <div
                  data-testid="guess-row-image"
                  className={`flex min-h-14 flex-wrap items-center justify-center gap-0.5 rounded-md border border-slate-200 bg-slate-100 p-1 dark:border-slate-600 dark:bg-slate-700 ${fade}`}
                >
                  {(forms.length ? forms : [null]).map((f, fi) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={f?.id ?? fi}
                      src={f?.imageUrl ?? '/placeholder-monster.svg'}
                      alt={f?.name ?? `#${g.monsterId}`}
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/placeholder-monster.svg';
                      }}
                      className={`${imgSize} object-contain`}
                    />
                  ))}
                </div>
                <div
                  data-testid="guess-row-name"
                  className={`flex min-h-14 flex-col justify-center gap-0.5 rounded-md border border-slate-200 bg-white px-2 text-left text-xs font-medium text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 sm:text-sm ${fade}`}
                >
                  {(forms.length ? forms : [null]).map((f, fi) => (
                    <span key={f?.id ?? fi} className="flex items-center gap-1.5">
                      {f && (
                        <span
                          aria-hidden="true"
                          className={`h-2.5 w-2.5 flex-none rounded-full ring-1 ring-black/10 ${ELEMENT_DOT[f.element]}`}
                        />
                      )}
                      <span className="break-words leading-tight">{f?.name ?? `#${g.monsterId}`}</span>
                    </span>
                  ))}
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
