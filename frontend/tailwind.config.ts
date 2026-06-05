import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ember: '#ff7a00',
        charcoal: '#060a0b',
        smoke: '#101718',
        cream: '#fff3df',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Arial Narrow', 'Arial', 'sans-serif'],
        title: ['var(--font-title)', 'Arial Narrow', 'Arial', 'sans-serif'],
        body: ['var(--font-display)', 'Arial Narrow', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 28px 80px rgba(255, 122, 0, 0.24)',
        food: '0 48px 110px rgba(0, 0, 0, 0.68)',
      },
    },
  },
  plugins: [],
};

export default config;
