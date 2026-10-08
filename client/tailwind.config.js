/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#090B10',
          secondary: '#0D1117',
          panel: '#11151D',
          hover: '#181E29',
        },
        border: {
          subtle: '#262D38',
          accent: '#3E4756',
        },
        accent: {
          DEFAULT: '#F5B800',
          hover: '#E0A700',
          glow: 'rgba(245, 184, 0, 0.15)',
        },
        priority: {
          critical: '#EF4444',
          high: '#F97316',
          medium: '#EAB308',
          low: '#22C55E',
        },
        txt: {
          primary: '#F8FAFC',
          secondary: '#A8B0BE',
          muted: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
