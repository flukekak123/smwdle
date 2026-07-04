'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useGame } from '../providers/GameProvider';
import { useHydrated } from '../providers/useHydrated';
import { Header } from './Header';
import { Footer } from './Footer';
import { GuessInput } from './GuessInput';
import { GameBoard } from './GameBoard';
import { ResultModal } from './ResultModal';
import { StatsPanel } from './StatsPanel';

export function GameScreen() {
  const t = useTranslations();
  const hydrated = useHydrated();
  const { ready, guesses, solved, submitGuess, resetToday, secret, result, nextResetAt, stats } =
    useGame();
  const [statsOpen, setStatsOpen] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (solved) setShowResult(true);
  }, [solved]);

  const guessedIds = guesses.map((g) => g.monsterId);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 px-4 py-6">
      <Header onOpenStats={() => setStatsOpen(true)} />

      <p className="text-sm text-slate-600 dark:text-slate-300">{t('app.instructions')}</p>

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

      <Footer />

      {hydrated && solved && secret && result && (
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
    </main>
  );
}
