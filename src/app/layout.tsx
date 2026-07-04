import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { I18nProvider } from '../providers/I18nProvider';
import { ThemeProvider } from '../providers/ThemeProvider';
import { GameProvider } from '../providers/GameProvider';

export const metadata: Metadata = {
  title: 'Smwdle — Daily Summoners War Monster Guessing Game',
  description:
    'Guess the daily Summoners War monster. Attribute hints, streaks, and shareable results. A non-commercial fan project.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <I18nProvider>
            <GameProvider>{children}</GameProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
