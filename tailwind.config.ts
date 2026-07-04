import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/providers/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#6d5efc',
          fg: '#ffffff',
          muted: '#a99dff',
        },
        hint: {
          match: '#22c55e',
          matchDark: '#166534',
        },
      },
    },
  },
  plugins: [],
};

export default config;
