'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useGame } from '../providers/GameProvider';
import { useHydrated } from '../providers/useHydrated';
import { safeStorage } from '../providers/storage';
import { Header } from './Header';
import { Footer } from './Footer';
import { GuessInput } from './GuessInput';
import { GameBoard } from './GameBoard';
import { ResultModal } from './ResultModal';
import { StatsPanel } from './StatsPanel';
import { SilhouetteGame } from './SilhouetteGame';
import { EmojiGame } from './EmojiGame';
import { HigherLowerGame } from './HigherLowerGame';
import { ZoomGame } from './ZoomGame';
import { SkillGame } from './SkillGame';
import { MonsterPoolModal } from './MonsterPoolModal';

type Mode = 'classic' | 'silhouette' | 'emoji' | 'zoom' | 'skill' | 'higherlower';
const MODE_KEY = 'smwdle:mode';

const BACKGROUNDS = ['/backgrounds/smw_background_3.jpeg','/backgrounds/smw_background_4.jpeg', '/backgrounds/smw_background_5.jpeg'];

export function GameScreen() {
  const t = useTranslations();
  const hydrated = useHydrated();
  const { ready, guesses, solved, submitGuess, resetToday, secret, result, nextResetAt, stats } =
    useGame();
  const [statsOpen, setStatsOpen] = useState(false);
  const [poolOpen, setPoolOpen] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [mode, setMode] = useState<Mode>('classic');
  const [bg, setBg] = useState<string | null>(null);

  useEffect(() => {
    const saved = safeStorage.get(MODE_KEY);
    if (
      saved === 'classic' ||
      saved === 'silhouette' ||
      saved === 'emoji' ||
      saved === 'zoom' ||
      saved === 'skill' ||
      saved === 'higherlower'
    )
      setMode(saved);
    // Random background each visit (client-side to avoid hydration mismatch).
    setBg(BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)]!);
  }, []);

  useEffect(() => {
    if (solved) setShowResult(true);
  }, [solved]);

  const changeMode = (m: Mode) => {
    setMode(m);
    safeStorage.set(MODE_KEY, m);
  };

  const guessedIds = guesses.map((g) => g.monsterId);

  const tab = (m: Mode, label: string) => (
    <button
      data-testid={`mode-${m}`}
      onClick={() => changeMode(m)}
      aria-pressed={mode === m}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
        mode === m
          ? 'bg-accent text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      {bg && (
        <>
          <div
            className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${bg})` }}
            aria-hidden="true"
          />
          <div className="fixed inset-0 -z-10 bg-slate-50/70 dark:bg-slate-900/80" aria-hidden="true" />
        </>
      )}
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center gap-4 px-4 py-6">
      <Header onOpenStats={() => setStatsOpen(true)} onOpenPool={() => setPoolOpen(true)} />

      <div className="flex flex-wrap justify-center gap-2">
        {tab('classic', t('mode.classic'))}
        {tab('silhouette', t('mode.silhouette'))}
        {tab('emoji', t('mode.emoji'))}
        {tab('zoom', t('mode.zoom'))}
        {tab('skill', t('mode.skill'))}
        {tab('higherlower', t('mode.higherlower'))}
      </div>

      {mode === 'classic' && (
        <>
          <p className="w-full max-w-xl text-center text-sm text-slate-600 dark:text-slate-300">
            {t('app.instructions')}
          </p>

          {!hydrated || !ready ? (
            <div className="h-12 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
          ) : (
            <>
              <div className="flex w-full max-w-xl items-center gap-2">
                <div className="flex-1">
                  <GuessInput guessedIds={guessedIds} disabled={solved} onGuess={submitGuess} />
                </div>
                {guesses.length > 0 && (
                  <button
                    data-testid="reset-button"
                    onClick={() => {
                      setShowResult(false);
                      resetToday();
                    }}
                    className="flex-none rounded-lg border border-slate-300 px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    ↺ {t('common.reset')}
                  </button>
                )}
              </div>
              <GameBoard guesses={guesses} />
            </>
          )}
        </>
      )}

      {mode === 'silhouette' && <SilhouetteGame />}
      {mode === 'emoji' && <EmojiGame />}
      {mode === 'zoom' && <ZoomGame />}
      {mode === 'skill' && <SkillGame />}
      {mode === 'higherlower' && <HigherLowerGame />}

      <Footer />

      {hydrated && mode === 'classic' && solved && secret && result && (
        <ResultModal
          open={showResult}
          onClose={() => setShowResult(false)}
          monster={secret}
          result={result}
          streak={stats.currentStreak}
          nextResetAt={nextResetAt}
        />
      )}

      {hydrated && <StatsPanel open={statsOpen} onClose={() => setStatsOpen(false)} stats={stats} />}
      {hydrated && <MonsterPoolModal open={poolOpen} onClose={() => setPoolOpen(false)} />}
      </main>
    </>
  );
}
