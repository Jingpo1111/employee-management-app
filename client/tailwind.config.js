/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: 'rgb(var(--surface) / <alpha-value>)',
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        text: 'rgb(var(--text) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        accentSoft: 'rgb(var(--accent-soft) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)'
      },
      boxShadow: {
        shell: '0 34px 90px rgba(13, 22, 46, 0.16)',
        card: '0 20px 45px rgba(17, 24, 39, 0.10)',
        glow: '0 0 0 1px rgba(255,255,255,0.08), 0 16px 60px rgba(27, 83, 235, 0.18)'
      },
      borderRadius: {
        panel: '1.75rem'
      },
      fontFamily: {
        sans: ['"Manrope"', 'ui-sans-serif', 'system-ui'],
        display: ['"Sora"', 'ui-sans-serif', 'system-ui']
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at 1px 1px, rgba(118, 131, 158, 0.18) 1px, transparent 0)'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        fadeUp: 'fadeUp 500ms ease-out forwards'
      }
    }
  },
  plugins: []
};
