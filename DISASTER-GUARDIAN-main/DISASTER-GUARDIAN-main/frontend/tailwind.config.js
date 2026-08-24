/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
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
        'gradient-navy': 'linear-gradient(165deg, #0f172a 0%, #020617 70%)',
        'gradient-card': 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
        'gradient-accent': 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
        'gradient-status': 'linear-gradient(135deg, #06b6d4, #22d3ee)',
      },
      boxShadow: {
        glow: '0 0 20px 4px rgba(56, 189, 248, 0.25)',
        'glow-strong': '0 0 30px 8px rgba(56, 189, 248, 0.4)',
        'inner-glow': 'inset 0 0 20px 2px rgba(56, 189, 248, 0.2)',
      },
      backdropBlur: { xs: '2px' },
      animation: {
        pulse: 'pulse 2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
