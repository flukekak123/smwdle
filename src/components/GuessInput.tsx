'use client';

import { useMemo, useState, type KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';
import type { Element, Monster } from '../lib/types';
import { catalog } from '../lib/index';

const ELEMENT_DOT: Record<Element, string> = {
  Fire: 'bg-red-500',
  Water: 'bg-blue-500',
  Wind: 'bg-yellow-500',
  Light: 'bg-amber-200',
  Dark: 'bg-purple-600',
};

interface Props {
  guessedIds: number[];
  disabled: boolean;
  onGuess: (m: Monster) => void;
}

export function GuessInput({ guessedIds, disabled, onGuess }: Props) {
  const t = useTranslations();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const guessed = useMemo(() => new Set(guessedIds), [guessedIds]);
  const candidates = useMemo(() => {
    if (query.trim().length === 0) return [];
    return catalog.findByName(query).filter((m) => !guessed.has(m.id));
  }, [query, guessed]);

  const choose = (m: Monster) => {
    onGuess(m);
    setQuery('');
    setActiveIndex(0);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (candidates.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, candidates.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const pick = candidates[activeIndex];
      if (pick) choose(pick);
    } else if (e.key === 'Escape') {
      setQuery('');
    }
  };

  return (
    <div className="relative w-full">
      <input
        data-testid="guess-input"
        type="text"
        value={query}
        disabled={disabled}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(0);
        }}
        onKeyDown={onKeyDown}
        placeholder={t('input.placeholder')}
        aria-label={t('input.placeholder')}
        role="combobox"
        aria-expanded={candidates.length > 0}
        aria-controls="guess-listbox"
        aria-activedescendant={candidates[activeIndex] ? `guess-option-${candidates[activeIndex]!.id}` : undefined}
        autoComplete="off"
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      />
      {candidates.length > 0 && (
        <ul
          id="guess-listbox"
          role="listbox"
          className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          {candidates.map((m, i) => (
            <li
              key={m.id}
              id={`guess-option-${m.id}`}
              data-testid={`guess-option-${m.id}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(m);
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex cursor-pointer items-center gap-2 px-4 py-2 text-sm ${
                i === activeIndex
                  ? 'bg-accent text-white'
                  : 'text-slate-800 dark:text-slate-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.imageUrl ?? '/placeholder-monster.svg'}
                alt=""
                width={28}
                height={28}
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/placeholder-monster.svg';
                }}
                className="h-7 w-7 flex-none rounded object-contain"
              />
              <span
                aria-hidden="true"
                className={`h-2.5 w-2.5 flex-none rounded-full ring-1 ring-black/10 ${ELEMENT_DOT[m.element]}`}
              />
              <span className="font-medium">{m.name}</span>
              <span
                className={`ml-auto whitespace-nowrap text-xs ${
                  i === activeIndex ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {m.element} · {m.naturalStars}★
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
