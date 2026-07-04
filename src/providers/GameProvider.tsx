'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { GameResult, GuessResult, Monster, Stats } from '../lib/types';
import { catalog } from '../lib/index';
import { getDailyMonster, getPuzzleNumber, localDateString } from '../lib/dailySelector';
import { evaluate } from '../lib/guessEvaluator';
import { emptyStats, applyResult } from '../lib/statsEngine';
import { loadState, patchState } from './persistence';
import { safeStorage } from './storage';

// Per-device override: when the player rerolls today's monster, remember the
// replacement so reloads keep the same secret (kept outside the codec state).
const OVERRIDE_KEY = 'smwdle:override:v1';

function loadOverride(date: string): number | null {
  try {
    const raw = safeStorage.get(OVERRIDE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { date?: string; monsterId?: number };
    return parsed.date === date && typeof parsed.monsterId === 'number' ? parsed.monsterId : null;
  } catch {
    return null;
  }
}

function saveOverride(date: string, monsterId: number): void {
  safeStorage.set(OVERRIDE_KEY, JSON.stringify({ date, monsterId }));
}

interface GameContextValue {
  ready: boolean;
  guesses: GuessResult[];
  solved: boolean;
  puzzleNumber: number;
  /** The secret monster — only revealed once solved. */
  secret: Monster | null;
  nextResetAt: Date | null;
  stats: Stats;
  result: GameResult | null;
  submitGuess: (m: Monster) => void;
  /** Rerolls today's secret to a new random monster and clears the board. */
  resetToday: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

/** Thin selector kept for API parity with the design (Stats service). */
export function useStats(): Stats {
  return useGame().stats;
}

interface Meta {
  secret: Monster;
  puzzleNumber: number;
  date: string;
  nextResetAt: Date;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [solved, setSolved] = useState(false);
  const [stats, setStats] = useState<Stats>(emptyStats());

  useEffect(() => {
    const today = new Date();
    const date = localDateString(today);
    const pool = catalog.getAnswerPool();
    let secret = getDailyMonster(today, pool);
    // A reroll from earlier today takes precedence over the scheduled monster.
    const overrideId = loadOverride(date);
    if (overrideId !== null) {
      const overridden = catalog.getById(overrideId);
      if (overridden) secret = overridden;
    }
    const puzzleNumber = getPuzzleNumber(today);
    const nextResetAt = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const persisted = loadState();
    setStats(persisted.stats);
    if (persisted.today && persisted.today.date === date) {
      setGuesses(persisted.today.guesses);
      setSolved(persisted.today.solved);
    }
    setMeta({ secret, puzzleNumber, date, nextResetAt });
  }, []);

  const buildResult = (gs: GuessResult[], isSolved: boolean, m: Meta): GameResult => ({
    puzzleNumber: m.puzzleNumber,
    date: m.date,
    guesses: gs,
    solved: isSolved,
  });

  const submitGuess = (monster: Monster) => {
    if (!meta || solved) return;
    if (guesses.some((g) => g.monsterId === monster.id)) return;

    const res = evaluate(monster, meta.secret);
    const nextGuesses = [...guesses, res];
    const nowSolved = res.correct;
    setGuesses(nextGuesses);
    setSolved(nowSolved);

    const result = buildResult(nextGuesses, nowSolved, meta);
    const prev = loadState();
    const nextStats = nowSolved ? applyResult(prev.stats, result) : prev.stats;
    if (nowSolved) setStats(nextStats);
    patchState({ today: result, stats: nextStats });
  };

  const resetToday = () => {
    if (!meta) return;
    // Pick a NEW random secret from the answer pool (different from the current one).
    const pool = catalog.getAnswerPool();
    let next = meta.secret;
    if (pool.length > 1) {
      do {
        next = pool[Math.floor(Math.random() * pool.length)]!;
      } while (next.id === meta.secret.id);
    }
    saveOverride(meta.date, next.id);
    setMeta({ ...meta, secret: next });
    setGuesses([]);
    setSolved(false);
    // Clear the saved board for today; stats are preserved (and are idempotent per date).
    patchState({ today: null });
  };

  const value: GameContextValue = {
    ready: meta !== null,
    guesses,
    solved,
    puzzleNumber: meta?.puzzleNumber ?? 0,
    secret: solved ? (meta?.secret ?? null) : null,
    nextResetAt: meta?.nextResetAt ?? null,
    stats,
    result: meta ? buildResult(guesses, solved, meta) : null,
    submitGuess,
    resetToday,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
