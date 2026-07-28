import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import { nimInkDarkTheme, nimInkLightTheme } from './lib/nim-ink-theme';

export const docs = defineDocs({
  dir: 'content/docs',
});

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      themes: {
        light: nimInkLightTheme,
        dark: nimInkDarkTheme,
      },
      // MUST be explicit. fumadocs-core's applyDefaultThemes only merges its
      // defaults — including `defaultColor: false` — when the caller passes
      // neither `theme` nor `themes`. Supplying our own themes drops it, Shiki
      // falls back to `defaultColor: 'light'`, and light colours get written as
      // an inline `color:` on every span, which beats the stylesheet rule that
      // swaps in `--shiki-dark`. Dark mode would then render light colours.
      defaultColor: false,
    },
  },
});
