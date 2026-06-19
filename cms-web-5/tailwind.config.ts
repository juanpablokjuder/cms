import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vk: {
          DEFAULT: '#00C8F8',
          light: '#33D4FF',
          dark: '#0099CC',
        },
        // --- Acentos de marca ---
        primary: {
          DEFAULT: '#00a9ff',
          hover: '#33bcff',
          soft: 'rgba(0, 169, 255, 0.12)',
        },
        secondary: {
          DEFAULT: '#7C5CFF',
          soft: 'rgba(124, 92, 255, 0.12)',
        },
        // --- Neutros base dark (de fondo a texto) ---
        bg: '#0A0E14',
        surface: {
          1: '#0F1620',
          2: '#161E2B',
        },
        border: {
          DEFAULT: '#243040',
        },
        muted: {
          DEFAULT: '#9AA6B8',
          hint: '#5B6573',
        },
        fg: {
          DEFAULT: '#C9D2DF',
          strong: '#F5F8FC',
        },
        // --- Semánticos ---
        success: '#22C55E',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#00a9ff',
      },
      backgroundImage: {
        'hero-gradient':
          'radial-gradient(ellipse at 20% 60%, rgba(0,200,248,0.18) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(0,200,248,0.09) 0%, transparent 45%)',
        'brand-gradient': 'linear-gradient(120deg, #00a9ff 0%, #7C5CFF 100%)',
        'brand-gradient-soft': 'linear-gradient(120deg, rgba(0,169,255,0.14) 0%, rgba(124,92,255,0.14) 100%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.7s ease-out both',
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 6s linear infinite',
        'pulse-line': 'pulse-line 4s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        'pulse-line': {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '0.9' },
        },
      },
      fontSize: {
        // Escala modular fluida (clamp) — ratio ~1.25, comprimida en móvil
        small: ['0.875rem', { lineHeight: '1.5' }],
        base: ['clamp(1rem, 0.97rem + 0.15vw, 1.0625rem)', { lineHeight: '1.6' }],
        lead: ['clamp(1.0625rem, 1rem + 0.4vw, 1.25rem)', { lineHeight: '1.6' }],
        h5: ['clamp(1.0625rem, 1rem + 0.3vw, 1.125rem)', { lineHeight: '1.4' }],
        h4: ['clamp(1.2rem, 1.1rem + 0.5vw, 1.375rem)', { lineHeight: '1.3' }],
        h3: ['clamp(1.4rem, 1.2rem + 1vw, 1.75rem)', { lineHeight: '1.25' }],
        h2: ['clamp(1.75rem, 1.4rem + 1.8vw, 2.25rem)', { lineHeight: '1.18' }],
        h1: ['clamp(2.25rem, 1.6rem + 3.2vw, 3.5rem)', { lineHeight: '1.08' }],
      },
      maxWidth: {
        content: '1200px',
        prose: '70ch',
      },
      spacing: {
        // Escala base 8px (con medios pasos)
        '18': '4.5rem', // 72px
        '23': '5.75rem',
        'section': 'clamp(4rem, 3rem + 5vw, 8rem)', // padding vertical de sección
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        // 'full' ya existe en Tailwind (9999px)
      },
      boxShadow: {
        'card': '0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -12px rgba(0,0,0,0.6)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.5), 0 16px 48px -16px rgba(0,0,0,0.7)',
        'glow': '0 0 0 1px rgba(0,169,255,0.25), 0 8px 32px -8px rgba(0,169,255,0.35)',
        'glow-strong': '0 0 0 1px rgba(0,169,255,0.4), 0 10px 40px -6px rgba(0,169,255,0.5)',
        'float': '0 8px 28px -6px rgba(0,0,0,0.55), 0 0 24px -4px rgba(0,169,255,0.35)',
      },
      transitionTimingFunction: {
        'out-soft': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}

export default config
