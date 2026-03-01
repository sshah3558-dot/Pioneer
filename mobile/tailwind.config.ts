import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        pioneer: {
          purple: '#7C3AED',
          pink: '#EC4899',
          blue: '#3B82F6',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
