/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Royal Indigo & Gold theme:
        // "slate" is remapped to deep royal indigo-navy surfaces so every
        // existing bg-slate-* / text-slate-* class picks up the new look.
        slate: {
          50: '#f4f5ff',
          100: '#e8eafb',
          200: '#cdd2f5',
          300: '#a7aee8',
          400: '#7d86d0',
          500: '#5d66b3',
          600: '#485091',
          700: '#373f72',
          800: '#232950',
          900: '#131735',
          950: '#080b1f',
        },
        // "cyan" (the interactive accent) becomes electric royal blue.
        cyan: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfd8fe',
          300: '#93bbfd',
          400: '#609dfa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#16255c',
        },
        // New premium gold accent for highlights, badges & luxury touches.
        gold: {
          50: '#fdfaf0',
          100: '#faf3d9',
          200: '#f5e6ae',
          300: '#eed67c',
          400: '#e6c252',
          500: '#d4af37',
          600: '#b8942c',
          700: '#96761f',
          800: '#755c17',
          900: '#57430f',
          950: '#33270a',
        },
        navy: {
          50: '#f0f4ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b5a',
        },
        danger: {
          low: '#22c55e',
          confirmed: '#f59e0b',
          high: '#f97316',
          critical: '#ef4444',
        },
        glass: 'rgba(255, 255, 255, 0.06)',
        glassBorder: 'rgba(255, 255, 255, 0.12)',
      },
      backgroundImage: {
        'gradient-navy': 'linear-gradient(165deg, #131735 0%, #080b1f 70%)',
        'gradient-card': 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
        'gradient-accent': 'linear-gradient(135deg, #3b82f6, #93bbfd)',
        'gradient-status': 'linear-gradient(135deg, #d4af37, #eed67c)',
        'gradient-royal': 'linear-gradient(135deg, #16255c 0%, #232950 45%, #33270a 100%)',
      },
      boxShadow: {
        glow: '0 0 20px 4px rgba(59, 130, 246, 0.25)',
        'glow-strong': '0 0 30px 8px rgba(59, 130, 246, 0.4)',
        'inner-glow': 'inset 0 0 20px 2px rgba(59, 130, 246, 0.2)',
        'glow-gold': '0 0 22px 4px rgba(212, 175, 55, 0.28)',
      },
      backdropBlur: { xs: '2px' },
      animation: {
        pulse: 'pulse 2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
      },
    },
  },
  plugins: [],
};
