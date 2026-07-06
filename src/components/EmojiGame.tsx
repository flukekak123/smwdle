'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Element, Monster, Role } from '../lib/types';
import { EMOJI_SEED } from '../lib/types';
import { catalog } from '../lib/index';
import { getDailyMonster, localDateString } from '../lib/dailySelector';
import { safeStorage } from '../providers/storage';
import { useHydrated } from '../providers/useHydrated';
import { GuessInput } from './GuessInput';

const KEY = 'smwdle:emoji:v1';

const ELEMENT_EMOJI: Record<Element, string> = {
  Fire: '🔥',
  Water: '💧',
  Wind: '🌪️',
  Light: '☀️',
  Dark: '🌑',
};

const ROLE_EMOJI: Record<Role, string> = {
  Attack: '⚔️',
  Defense: '🛡️',
  HP: '❤️',
  Support: '✨',
};

// Best-effort family → emoji; unmapped families fall back to 👾.
const FAMILY_EMOJI: Record<string, string> = {
  Dragon: '🐉',
  Vampire: '🦇',
  Phoenix: '🦅',
  Chimera: '🦁',
  Werewolf: '🐺',
  Fairy: '🧚',
  Archangel: '😇',
  Angel: '😇',
  Griffon: '🦅',
  'Harp Magician': '🎵',
  Warbear: '🐻',
  Sylph: '🧚‍♀️',
  Undine: '🌊',
  Salamander: '🦎',
  Serpent: '🐍',
  Golem: '🗿',
  Inugami: '🐕',
  'Nine-tailed Fox': '🦊',
  'Penguin Knight': '🐧',
  Pixie: '🧚',
  Joker: '🃏',
  'Occult Girl': '🔮',
  Oracle: '🔮',
  'Magic Knight': '🗡️',
  Paladin: '🛡️',
  Valkyrja: '⚔️',
  'Hell Lady': '👹',
  'Beast Monk': '🐒',
  'Chakram Dancer': '💃',
  'Boomerang Warrior': '🪃',
  'Pirate Captain': '🏴‍☠️',
  'Neostone Agent': '🥋',
  'Neostone Fighter': '🥋',
  'Death Knight': '💀',
  'Grim Reaper': '💀',
  Mermaid: '🧜',
  Ninja: '🥷',
  Assassin: '🗡️',
  Amazon: '🏹',
  'Epikion Priest': '⛪',
  'Sky Dancer': '🕊️',
  'Martial Cat': '🐱',
  'Bounty Hunter': '🤠',
  Homunculus: '⚗️',
  Garuda: '🦜',
  Imp: '👿',
  'Living Armor': '🛡️',
  Barbaric: '🪓',
  Rakshasa: '👺',
  Lich: '💀',
  Reaper: '💀',
  Unicorn: '🦄',
  Pegasus: '🐴',
  Kobold: '👺',
  Yeti: '🏔️',
  Wolfman: '🐺',
  Witch: '🧙',
  Wizard: '🧙',
  Sorcerer: '🧙',
  Vagabond: '🗡️',
  Monkey: '🐵',
  'Monkey King': '🐵',
  Frankenstein: '⚡',
  Mummy: '🧟',
  Ghost: '👻',
  Pierret: '🤡',
  Panda: '🐼',
  Robo: '🤖',
  Cannon: '💥',
  Dice: '🎲',
  Charger: '🐗',
  Bearman: '🐻',
  Elf: '🧝',
  Mystic: '🔮',
  Anubis: '🐕',
  Horus: '🦅',
  Bastet: '🐈',
  Nephthys: '🦂',
  Sphynx: '🐈',
};

interface EmojiState {
  date: string;
  guesses: number[];
  solved: boolean;
  override?: number | null;
}

function loadEmoji(date: string): EmojiState {
  try {
    const raw = safeStorage.get(KEY);
    if (raw) {
      const p = JSON.parse(raw) as EmojiState;
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

function saveEmoji(s: EmojiState): void {
  safeStorage.set(KEY, JSON.stringify(s));
}

export function EmojiGame() {
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
    const st = loadEmoji(date);
    let sec = getDailyMonster(today, pool, EMOJI_SEED);
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
      <div className="mx-auto h-40 w-full max-w-md animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
    );
  }

  const submit = (m: Monster) => {
    if (solved || guesses.includes(m.id)) return;
    const nextGuesses = [...guesses, m.id];
    const nowSolved = m.id === secret.id;
    setGuesses(nextGuesses);
    setSolved(nowSolved);
    saveEmoji({ date: localDateString(new Date()), guesses: nextGuesses, solved: nowSolved, override: overrideId });
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
    saveEmoji({ date: localDateString(new Date()), guesses: [], solved: false, override: next.id });
  };

  const emojis = [
    ELEMENT_EMOJI[secret.element],
    ROLE_EMOJI[secret.role],
    FAMILY_EMOJI[secret.family] ?? null, // omit when the family has no emoji
    secret.secondAwakening ? '🔄' : null,
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-8 py-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3 text-4xl sm:text-5xl">
          {emojis.map((e, i) => (
            <span key={i} aria-hidden="true">
              {e}
            </span>
          ))}
        </div>
        <div className="text-2xl tracking-widest" aria-hidden="true">
          {'⭐'.repeat(secret.naturalStars)}
        </div>
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
            data-testid="emoji-reset"
            onClick={reroll}
            className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            ↺ {t('common.reset')}
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-600 dark:text-slate-300">{t('emoji.prompt')}</p>
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="flex-1">
              <GuessInput guessedIds={guesses} disabled={solved} onGuess={submit} />
            </div>
            <button
              data-testid="emoji-reset"
              onClick={reroll}
              className="flex-none rounded-lg border border-slate-300 px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              ↺ {t('common.reset')}
            </button>
          </div>
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
