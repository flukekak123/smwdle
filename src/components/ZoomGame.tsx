'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Monster } from '../lib/types';
import { ZOOM_SEED } from '../lib/types';
import { catalog } from '../lib/index';
import { getDailyMonster, localDateString } from '../lib/dailySelector';
import { safeStorage } from '../providers/storage';
import { useHydrated } from '../providers/useHydrated';
import { useConfetti } from '../providers/Confetti';
import { GuessInput } from './GuessInput';

const KEY = 'smwdle:zoom:v1';

interface ZoomState {
  date: string;
  guesses: number[];
  solved: boolean;
  override?: number | null;
}

function loadZoom(date: string): ZoomState {
  try {
    const raw = safeStorage.get(KEY);
    if (raw) {
      const p = JSON.parse(raw) as ZoomState;
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
    // fall through
  }
  return { date, guesses: [], solved: false, override: null };
}

function saveZoom(s: ZoomState): void {
  safeStorage.set(KEY, JSON.stringify(s));
}

export function ZoomGame() {
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
    const st = loadZoom(date);
    let sec = getDailyMonster(today, pool, ZOOM_SEED);
    if (st.override != null) {
      const o = catalog.getById(st.override);
      if (o) sec = o;
    }
    setSecret(sec);
    setGuesses(st.guesses);
    setSolved(st.solved);
    setOverrideId(st.override ?? null);
  }, []);

  const fireConfetti = useConfetti();
  useEffect(() => {
    if (solved) fireConfetti();
  }, [solved, fireConfetti]);

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
    saveZoom({ date: localDateString(new Date()), guesses: nextGuesses, solved: nowSolved, override: overrideId });
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
    saveZoom({ date: localDateString(new Date()), guesses: [], solved: false, override: next.id });
  };

  const wrong = guesses.filter((id) => id !== secret.id).length;
  // Start very zoomed in; zoom out ~0.7 per wrong guess; full image on solve.
  const scale = solved ? 1 : Math.max(1.3, 5.5 - wrong * 0.7);
  // Deterministic focus point per monster so the crop is stable across reloads.
  const ox = solved ? 50 : 15 + ((secret.id * 37) % 70);
  const oy = solved ? 50 : 15 + ((secret.id * 53) % 70);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-64 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={secret.imageUrl ?? '/placeholder-monster.svg'}
          alt={solved ? secret.name : 'Zoomed monster'}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/placeholder-monster.svg';
          }}
          className="h-full w-full object-contain transition-all duration-500"
          style={{ transform: `scale(${scale})`, transformOrigin: `${ox}% ${oy}%` }}
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
            data-testid="zoom-reset"
            onClick={reroll}
            className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            ↺ {t('common.reset')}
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-600 dark:text-slate-300">{t('zoom.prompt')}</p>
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="flex-1">
              <GuessInput guessedIds={guesses} disabled={solved} onGuess={submit} />
            </div>
            <button
              data-testid="zoom-reset"
              onClick={reroll}
              className="flex-none rounded-lg border border-slate-300 px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              ↺ {t('common.reset')}
            </button>
          </div>
          <p className="text-xs text-slate-400">{t('zoom.revealHint')}</p>
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
