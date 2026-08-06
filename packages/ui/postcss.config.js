// No autoprefixer, deliberately (NIMUI-88). It was here and it was not a
// no-op — measured, it added 7 prefixed declarations and 35 bytes: -o-tab-size,
// -moz-appearance, ::-moz-placeholder and friends. Every one of them targets a
// browser that cannot render this stylesheet anyway: the sheet uses color-mix()
// 180 times, @property 72 times and oklch() 113 times, none of which Opera
// Presto or Firefox before 80 can parse. Tailwind v4 runs Lightning CSS, which
// prefixes for the versions it actually supports.
//
// It also made this package disagree with packages/docs and with what
// installation.mdx tells consumers to write. To re-add it, first show a
// supported browser that needs a prefix Lightning CSS does not emit.
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
