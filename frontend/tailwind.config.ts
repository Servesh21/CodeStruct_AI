import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Precision Engineering — Light Mode ──
        surface: {
          DEFAULT: '#f9f9ff',
          dim: '#d3daea',
          bright: '#f9f9ff',
          container: {
            lowest: '#ffffff',
            low: '#f0f3ff',
            DEFAULT: '#e7eefe',
            high: '#e2e8f8',
            highest: '#dce2f3',
          },
          variant: '#dce2f3',
          tint: '#0053db',
        },
        'on-surface': {
          DEFAULT: '#151c27',
          variant: '#434655',
        },
        'inverse-surface': '#2a313d',
        'inverse-on-surface': '#ebf1ff',

        primary: {
          DEFAULT: '#004ac6',
          container: '#2563eb',
          fixed: '#dbe1ff',
          'fixed-dim': '#b4c5ff',
        },
        'on-primary': {
          DEFAULT: '#ffffff',
          container: '#eeefff',
          fixed: '#00174b',
          'fixed-variant': '#003ea8',
        },
        'inverse-primary': '#b4c5ff',

        secondary: {
          DEFAULT: '#5d5e65',
          container: '#e2e2eb',
          fixed: '#e2e2eb',
          'fixed-dim': '#c5c6ce',
        },
        'on-secondary': {
          DEFAULT: '#ffffff',
          container: '#63646c',
          fixed: '#191b22',
          'fixed-variant': '#45464e',
        },

        tertiary: {
          DEFAULT: '#943700',
          container: '#bc4800',
          fixed: '#ffdbcd',
          'fixed-dim': '#ffb596',
        },
        'on-tertiary': {
          DEFAULT: '#ffffff',
          container: '#ffede6',
          fixed: '#360f00',
          'fixed-variant': '#7d2d00',
        },

        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        'on-error': {
          DEFAULT: '#ffffff',
          container: '#93000a',
        },

        outline: {
          DEFAULT: '#737686',
          variant: '#c3c6d7',
        },

        background: '#f9f9ff',
        'on-background': '#151c27',

        // ── Semantic status colors ──
        'status-success': '#16a34a',
        'status-success-bg': '#f0fdf4',
        'status-warning': '#d97706',
        'status-warning-bg': '#fffbeb',
        'status-error': '#ba1a1a',
        'status-error-bg': '#ffdad6',
        'status-info': '#2563eb',
        'status-info-bg': '#dbe1ff',

        // ── Dark mode overrides (used via dark: prefix) ──
        dark: {
          surface: {
            DEFAULT: '#101419',
            dim: '#101419',
            bright: '#36393f',
            'container-lowest': '#0b0e14',
            'container-low': '#181c21',
            container: '#1c2025',
            'container-high': '#272a30',
            'container-highest': '#32353b',
          },
          'on-surface': '#e0e2ea',
          'on-surface-variant': '#c0c7d4',
          primary: '#a2c9ff',
          'primary-container': '#58a6ff',
          'on-primary': '#00315c',
          'on-primary-container': '#003a6b',
          outline: '#8b919d',
          'outline-variant': '#414752',
          error: '#ffb4ab',
          'error-container': '#93000a',
          'on-error-container': '#ffdad6',
          tertiary: '#ffba42',
          'tertiary-container': '#da9600',
          background: '#101419',
          'on-background': '#e0e2ea',
          secondary: '#bec7d2',
          'secondary-container': '#414a53',
          'surface-variant': '#32353b',
          'surface-tint': '#a2c9ff',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
      },

      fontSize: {
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline-lg-mobile': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'headline-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-lg': ['14px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '500' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.01em', fontWeight: '500' }],
        'label-sm': ['12px', { lineHeight: '1.2', letterSpacing: '0.05em', fontWeight: '500' }],
        'code-md': ['13px', { lineHeight: '20px', fontWeight: '400' }],
      },

      borderRadius: {
        'sm': '0.125rem',    // 2px
        DEFAULT: '0.25rem',  // 4px — inputs, buttons, small UI
        'md': '0.375rem',    // 6px
        'lg': '0.5rem',      // 8px — cards, modals, containers
        'xl': '0.75rem',     // 12px
        '2xl': '1rem',       // 16px — large containers
        'full': '9999px',
      },

      spacing: {
        'unit': '4px',
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        'gutter': '24px',
        'margin-mobile': '16px',
        'margin-desktop': '32px',
      },

      maxWidth: {
        'content': '1280px',
        'content-wide': '1440px',
      },

      boxShadow: {
        'none': 'none',
        'overlay': '0px 4px 12px rgba(0, 0, 0, 0.05)',
        'focus-ring': '0 0 0 2px rgba(37, 99, 235, 0.1)',
      },

      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.97)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
