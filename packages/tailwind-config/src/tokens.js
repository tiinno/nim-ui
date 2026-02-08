/**
 * Design Tokens for Tiinno UI
 * These tokens define the core design language of the system
 */
export const tokens = {
  colors: {
    primary: {
      50: 'oklch(0.976 0.014 236.6)',
      100: 'oklch(0.950 0.026 236.8)',
      200: 'oklch(0.901 0.058 230.9)',
      300: 'oklch(0.828 0.111 230.3)',
      400: 'oklch(0.746 0.160 232.7)',
      500: 'oklch(0.685 0.169 237.3)',
      600: 'oklch(0.588 0.158 241.0)',
      700: 'oklch(0.500 0.134 242.7)',
      800: 'oklch(0.433 0.109 240.1)',
      900: 'oklch(0.380 0.090 237.6)',
      950: 'oklch(0.293 0.066 237.9)',
    },
    neutral: {
      50: 'oklch(0.985 0.000 0)',
      100: 'oklch(0.970 0.000 0)',
      200: 'oklch(0.922 0.000 0)',
      300: 'oklch(0.869 0.000 0)',
      400: 'oklch(0.708 0.000 0)',
      500: 'oklch(0.551 0.000 0)',
      600: 'oklch(0.432 0.000 0)',
      700: 'oklch(0.371 0.000 0)',
      800: 'oklch(0.278 0.000 0)',
      900: 'oklch(0.214 0.000 0)',
      950: 'oklch(0.145 0.000 0)',
    },
    success: {
      50: 'oklch(0.982 0.018 155.8)',
      500: 'oklch(0.723 0.191 149.6)',
      700: 'oklch(0.527 0.154 150.1)',
    },
    error: {
      50: 'oklch(0.971 0.013 17.4)',
      500: 'oklch(0.637 0.237 25.3)',
      700: 'oklch(0.505 0.213 27.3)',
    },
    warning: {
      50: 'oklch(0.987 0.022 95.3)',
      500: 'oklch(0.769 0.188 70.1)',
      700: 'oklch(0.555 0.163 58.7)',
    },
  },
  spacing: {
    base: '4px',
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    DEFAULT: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['Fira Code', 'monospace'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    },
  },
};
