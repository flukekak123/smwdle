'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Monster } from '../lib/types';
import { SILHOUETTE_SEED } from '../lib/types';
import { catalog } from '../lib/index';
import { getDailyMonster, localDateString } from '../lib/dailySelector';
import { safeStorage } from '../providers/storage';
import { useHydrated } from '../providers/useHydrated';
import { GuessInput } from './GuessInput';

const KEY = 'smwdle:silhouette:v1';

interface SilState {
  date: string;
  guesses: number[];
  solved: boolean;
  /** Per-device reroll: overrides today's scheduled silhouette monster. */
  override?: number | null;
}

function loadSil(date: string): SilState {
  try {
    const raw = safeStorage.get(KEY);
    if (raw) {
      const p = JSON.parse(raw) as SilState;
      if (p && p.date === date && Array.isArray(p.guesses)) {
        return {
          date,
          guesses: p.guesses,
          solved: Boolean(p.solved),
          override: typeof p.override === 'number' ? p.override : null,
        };
      }
    }
  } catch {
    // fall through to fresh state
  }
  return { date, guesses: [], solved: false, override: null };
}

function saveSil(s: SilState): void {
  safeStorage.set(KEY, JSON.stringify(s));
}

export function SilhouetteGame() {
  const t = useTranslations();
  const hydrated = useHydrated();
  const [secret, setSecret] = useState<Monster | null>(null);
  const [guesses, setGuesses] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [overrideId, setOverrideId] = useState<number | null>(null);

  useEffect(() => {
    const today = new Date();
    const date = localDateString(today);
    const pool = catalog.getAnswerPool();
    const st = loadSil(date);
    let sec = getDailyMonster(today, pool, SILHOUETTE_SEED);
    if (st.override != null) {
      const o = catalog.getById(st.override);
      if (o) sec = o;
    }
    setSecret(sec);
    setGuesses(st.guesses);
    setSolved(st.solved);
    setOverrideId(st.override ?? null);
  }, []);

  if (!hydrated || !secret) {
    return (
      <div className="mx-auto h-64 w-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
    );
  }

  const submit = (m: Monster) => {
    if (solved || guesses.includes(m.id)) return;
    const nextGuesses = [...guesses, m.id];
    const nowSolved = m.id === secret.id;
    setGuesses(nextGuesses);
    setSolved(nowSolved);
    saveSil({
      date: localDateString(new Date()),
      guesses: nextGuesses,
      solved: nowSolved,
      override: overrideId,
    });
  };

  const reroll = () => {
    const pool = catalog.getAnswerPool();
    let next = secret;
    if (pool.length > 1) {
      do {
        next = pool[Math.floor(Math.random() * pool.length)]!;
      } while (next.id === secret.id);
    }
    setSecret(next);
    setGuesses([]);
    setSolved(false);
    setOverrideId(next.id);
    saveSil({ date: localDateString(new Date()), guesses: [], solved: false, override: next.id });
  };

  const wrong = guesses.filter((id) => id !== secret.id).length;
  // Blue-tinted silhouette that starts visible (not pitch black) and lightens/sharpens
  // with each wrong guess. grayscale->sepia->hue-rotate recolors the shape to blue.
  const brightness = solved ? 1 : Math.min(1, 0.55 + wrong * 0.09);
  const blur = solved ? 0 : Math.max(0, 14 - wrong * 2);
  const filter = solved
    ? 'none'
    : `blur(${blur}px) grayscale(1) brightness(${brightness}) sepia(1) hue-rotate(185deg) saturate(6)`;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex h-64 w-64 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={secret.imageUrl ?? '/placeholder-monster.svg'}
          alt={solved ? secret.name : 'Monster silhouette'}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/placeholder-monster.svg';
          }}
          className="h-52 w-52 object-contain transition-all duration-500"
          style={{ filter }}
        />
      </div>

      {solved ? (
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="text-xl font-bold text-green-600 dark:text-green-400">
            {t('silhouette.solvedName', { name: secret.name })}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {t('result.guessCount', { count: guesses.length })}
          </div>
          <button
            data-testid="silhouette-reset"
            onClick={reroll}
            className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            ↺ {t('common.reset')}
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-600 dark:text-slate-300">{t('silhouette.prompt')}</p>
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="flex-1">
              <GuessInput guessedIds={guesses} disabled={solved} onGuess={submit} />
            </div>
            <button
              data-testid="silhouette-reset"
              onClick={reroll}
              className="flex-none rounded-lg border border-slate-300 px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              ↺ {t('common.reset')}
            </button>
          </div>
          <p className="text-xs text-slate-400">{t('silhouette.revealHint')}</p>
        </>
      )}

      {guesses.length > 0 && (
        <div className="flex w-full max-w-md flex-col gap-1">
          {[...guesses].reverse().map((id) => {
            const m = catalog.getById(id);
            const correct = id === secret.id;
            return (
              <div
                key={id}
                data-testid={`silhouette-guess-${id}`}
                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-white ${
                  correct ? 'border-green-700 bg-green-600' : 'border-red-700 bg-red-600'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m?.imageUrl ?? '/placeholder-monster.svg'}
                  alt=""
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/placeholder-monster.svg';
                  }}
                  className="h-6 w-6 flex-none rounded bg-white/20 object-contain"
                />
                <span className="font-medium">{m?.name ?? `#${id}`}</span>
                <span className="ml-auto" aria-hidden="true">
                  {correct ? '✓' : '✕'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
