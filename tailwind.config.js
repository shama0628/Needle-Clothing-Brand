/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: 'var(--theme-background)',
          background: 'var(--theme-background)',
          surface: 'var(--theme-surface)',
          'surface-secondary': 'var(--theme-surface-secondary)',
          'surface-subtle': 'var(--theme-surface-subtle)',
          text: 'var(--theme-text)',
          muted: 'var(--theme-text-muted)',
          border: 'var(--theme-border)',
          'border-strong': 'var(--theme-border-strong)',
          accent: 'var(--theme-accent)',
          'accent-contrast': 'var(--theme-accent-contrast)',
        },
        plum: {
          DEFAULT: '#34232C',
          dark: '#23171E',
          light: '#47323D',
          hover: '#2A1C23',
          border: 'rgba(52, 35, 44, 0.15)',
          muted: '#5A4652',
          subtle: '#786270'
        },
        beige: {
          DEFAULT: '#ECE5D9',
          light: '#F8F6F1',
          cream: '#F4F0E8',
          border: 'rgba(236, 229, 217, 0.25)',
          dark: '#DBD1C0',
          darker: '#C7BAA5'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.035em',
        tighter: '-0.02em',
        wide: '0.05em',
        wider: '0.1em',
        widest: '0.2em',
        editorial: '0.25em'
      }
    },
  },
  plugins: [],
}
