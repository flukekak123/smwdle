'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Monster } from '../lib/types';
import { SKILL_SEED } from '../lib/types';
import { catalog } from '../lib/index';
import { getDailyMonster, localDateString } from '../lib/dailySelector';
import { safeStorage } from '../providers/storage';
import { useHydrated } from '../providers/useHydrated';
import { useConfetti } from '../providers/Confetti';
import { GuessInput } from './GuessInput';

const KEY = 'smwdle:skill:v1';

interface SkillDetail {
  slot: number;
  name: string;
  description: string;
}
type SkillData = Record<string, SkillDetail[]>;

interface SkillState {
  date: string;
  guesses: number[];
  solved: boolean;
  override?: number | null;
}

function loadSkill(date: string): SkillState {
  try {
    const raw = safeStorage.get(KEY);
    if (raw) {
      const p = JSON.parse(raw) as SkillState;
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

function saveSkill(s: SkillState): void {
  safeStorage.set(KEY, JSON.stringify(s));
}

export function SkillGame() {
  const t = useTranslations();
  const hydrated = useHydrated();
  const [secret, setSecret] = useState<Monster | null>(null);
  const [guesses, setGuesses] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [overrideId, setOverrideId] = useState<number | null>(null);
  const [skillData, setSkillData] = useState<SkillData | null>(null);

  useEffect(() => {
    const today = new Date();
    const date = localDateString(today);
    const pool = catalog.getAnswerPool();
    const st = loadSkill(date);
    let sec = getDailyMonster(today, pool, SKILL_SEED);
    if (st.override != null) {
      const o = catalog.getById(st.override);
      if (o) sec = o;
    }
    setSecret(sec);
    setGuesses(st.guesses);
    setSolved(st.solved);
    setOverrideId(st.override ?? null);
    // Skill text is a large static file — fetch it (same-origin) only when this mode opens.
    fetch('/skills.json')
      .then((r) => r.json())
      .then((d: SkillData) => setSkillData(d))
      .catch(() => setSkillData({}));
  }, []);

  const fireConfetti = useConfetti();
  useEffect(() => {
    if (solved) fireConfetti();
  }, [solved, fireConfetti]);

  if (!hydrated || !secret || !skillData) {
    return (
      <div className="mx-auto h-48 w-full max-w-md animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
    );
  }

  const submit = (m: Monster) => {
    if (solved || guesses.includes(m.id)) return;
    const nextGuesses = [...guesses, m.id];
    const nowSolved = m.id === secret.id;
    setGuesses(nextGuesses);
    setSolved(nowSolved);
    saveSkill({ date: localDateString(new Date()), guesses: nextGuesses, solved: nowSolved, override: overrideId });
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
    saveSkill({ date: localDateString(new Date()), guesses: [], solved: false, override: next.id });
  };

  const wrong = guesses.filter((id) => id !== secret.id).length;
  const allSkills = skillData[String(secret.id)] ?? [];
  // Show the unique active skills (slot 2+) first; reveal one more per wrong guess.
  const ordered = [
    ...allSkills.filter((s) => s.slot >= 2).sort((a, b) => a.slot - b.slot),
    ...allSkills.filter((s) => s.slot < 2),
  ];
  const revealed = solved ? ordered : ordered.slice(0, Math.min(ordered.length, 1 + wrong));

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full max-w-xl flex-col gap-2">
        {revealed.map((s, i) => (
          <div
            key={`${s.slot}-${i}`}
            className="rounded-xl border border-slate-200 bg-slate-100 p-3 dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded bg-accent px-2 py-0.5 text-xs font-bold text-white">
                {t('skill.slot', { slot: s.slot })}
              </span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{s.name}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{s.description}</p>
          </div>
        ))}
      </div>

      {solved ? (
        <div className="flex flex-col items-center gap-2 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={secret.imageUrl ?? '/placeholder-monster.svg'}
            alt={secret.name}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/placeholder-monster.svg';
            }}
            className="h-24 w-24 rounded-xl bg-white/50 object-contain dark:bg-slate-700"
          />
          <div className="text-xl font-bold text-green-600 dark:text-green-400">
            {t('silhouette.solvedName', { name: secret.name })}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {t('result.guessCount', { count: guesses.length })}
          </div>
          <button
            data-testid="skill-reset"
            onClick={reroll}
            className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            ↺ {t('common.reset')}
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-600 dark:text-slate-300">{t('skill.prompt')}</p>
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="flex-1">
              <GuessInput guessedIds={guesses} disabled={solved} onGuess={submit} />
            </div>
            <button
              data-testid="skill-reset"
              onClick={reroll}
              className="flex-none rounded-lg border border-slate-300 px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              ↺ {t('common.reset')}
            </button>
          </div>
          <p className="text-xs text-slate-400">{t('skill.revealHint')}</p>
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
