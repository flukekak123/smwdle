'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Monster } from '../lib/types';
import { catalog } from '../lib/index';
import { safeStorage } from '../providers/storage';
import { useHydrated } from '../providers/useHydrated';

const BEST_KEY = 'smwdle:hl:best';
type Stat = 'atk' | 'hp' | 'def' | 'spd';
const STATS: Stat[] = ['atk', 'hp', 'def', 'spd'];

function pickPair(pool: readonly Monster[]): [Monster, Monster] {
  const a = pool[Math.floor(Math.random() * pool.length)]!;
  let b = a;
  while (b.id === a.id) b = pool[Math.floor(Math.random() * pool.length)]!;
  return [a, b];
}

export function HigherLowerGame() {
  const t = useTranslations();
  const hydrated = useHydrated();
  const pool = catalog.getAnswerPool();

  const [pair, setPair] = useState<[Monster, Monster] | null>(null);
  const [stat, setStat] = useState<Stat>('atk');
  const [revealedPick, setRevealedPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nextRound = () => {
    const st = STATS[Math.floor(Math.random() * STATS.length)]!;
    // Avoid ties: re-roll the pair until the two differ on the chosen stat.
    let p = pickPair(pool);
    for (let i = 0; i < 15 && p[0].stats[st] === p[1].stats[st]; i++) p = pickPair(pool);
    setStat(st);
    setPair(p);
    setRevealedPick(null);
  };

  useEffect(() => {
    setBest(Number(safeStorage.get(BEST_KEY)) || 0);
    nextRound();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hydrated || !pair) {
    return (
      <div className="mx-auto h-64 w-full max-w-lg animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
    );
  }

  const restart = () => {
    setScore(0);
    setGameOver(false);
    nextRound();
  };

  const choose = (picked: Monster) => {
    if (revealedPick !== null || gameOver) return;
    const other = pair[0].id === picked.id ? pair[1] : pair[0];
    const correct = picked.stats[stat] >= other.stats[stat];
    setRevealedPick(picked.id);

    if (correct) {
      const s = score + 1;
      setScore(s);
      if (s > best) {
        setBest(s);
        safeStorage.set(BEST_KEY, String(s));
      }
      timer.current = setTimeout(nextRound, 950);
    } else {
      setGameOver(true);
    }
  };

  // Did the player's pick win this round?
  const pickCorrect =
    revealedPick !== null &&
    (() => {
      const picked = pair[0].id === revealedPick ? pair[0] : pair[1];
      const other = pair[0].id === revealedPick ? pair[1] : pair[0];
      return picked.stats[stat] >= other.stats[stat];
    })();

  const card = (m: Monster) => {
    const revealed = revealedPick !== null;
    const isPicked = m.id === revealedPick;
    let border = 'border-slate-200 dark:border-slate-700';
    if (revealed) {
      if (isPicked) border = pickCorrect ? 'border-green-600' : 'border-red-600';
      else if (!pickCorrect) border = 'border-green-600'; // reveal the correct answer
    }
    return (
      <button
        key={m.id}
        data-testid={`hl-card-${m.id}`}
        onClick={() => choose(m)}
        disabled={revealed || gameOver}
        className={`flex w-40 flex-col items-center gap-2 rounded-2xl border-2 bg-white p-4 transition-colors hover:border-accent disabled:hover:border-inherit dark:bg-slate-800 ${border}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={m.imageUrl ?? '/placeholder-monster.svg'}
          alt={m.name}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/placeholder-monster.svg';
          }}
          className="h-20 w-20 object-contain"
        />
        <span className="text-center text-sm font-semibold text-slate-800 dark:text-slate-100">
          {m.name}
        </span>
        <span className="text-xs text-slate-400">
          {m.family !== 'Unknown' ? `${m.family} · ` : ''}
          {m.element}
        </span>
        <span
          className={`text-lg font-bold tabular-nums ${
            revealed ? 'text-slate-900 dark:text-slate-100' : 'text-transparent'
          }`}
        >
          {revealed ? m.stats[stat].toLocaleString() : '···'}
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full max-w-lg justify-between text-sm font-semibold text-slate-600 dark:text-slate-300">
        <span>
          {t('higherlower.score')}: {score}
        </span>
        <span>
          {t('higherlower.best')}: {best}
        </span>
      </div>

      <p className="text-center text-base font-medium text-slate-700 dark:text-slate-200">
        {t('higherlower.prompt', { stat: t(`hl.${stat}`) })}
      </p>

      <div className="flex items-center gap-4">
        {card(pair[0])}
        <span className="text-sm font-bold text-slate-400">VS</span>
        {card(pair[1])}
      </div>

      {gameOver && (
        <div className="flex flex-col items-center gap-2">
          <div className="text-lg font-bold text-red-600 dark:text-red-400">
            {t('higherlower.gameover')} {t('higherlower.score')}: {score}
          </div>
          <button
            data-testid="hl-restart"
            onClick={restart}
            className="rounded-lg bg-accent px-5 py-2 font-semibold text-white hover:opacity-90"
          >
            {t('higherlower.playAgain')}
          </button>
        </div>
      )}
    </div>
  );
}
