import { tokens } from './tokens.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  darkMode: 'class',
  theme: {
    extend: {
      colors: tokens.colors,
      spacing: tokens.spacing,
      borderRadius: tokens.borderRadius,
      fontFamily: tokens.typography.fontFamily,
      fontSize: tokens.typography.fontSize,
    },
  },
  plugins: [],
};
