/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0f172a',
          900: '#111e3a',
          800: '#1e293b',
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
      },
      boxShadow: {
        glow: '0 0 20px 4px rgba(56, 189, 248, 0.25)',
        'glow-strong': '0 0 30px 8px rgba(56, 189, 248, 0.4)',
      },
    },
  },
  plugins: [],
};
