import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge configured for the Nim UI theme.
 *
 * Both entries name `@theme` tokens from `../tokens.css` that tailwind-merge would
 * otherwise not recognise as belonging to their utility group:
 *
 * - **shadow** — the default `theme.shadow` is empty, so `shadow-soft` etc. get
 *   classified as *shadow colors*: `shadow-soft shadow-lg` would keep both, and
 *   `shadow-soft shadow-red-500` would silently drop the elevation entirely.
 * - **animate** — the default `theme.animate` holds only `spin`/`ping`/`pulse`/
 *   `bounce`, so the kit's own animations conflict with nothing and a caller's
 *   `animate-none` cannot switch a component's animation off.
 *
 * The animate list must mirror every `--animate-*` in `../tokens.css`; a library
 * cannot read that CSS at runtime, so `./utils.test.ts` reads it and fails if the
 * two drift.
 *
 * Nothing else needs configuring: the custom OKLCH color scales
 * (`primary`/`success`/`error`/`warning`/`info`) are handled by the built-in color
 * groups, `duration-(--duration-*)` is recognised as the `duration` group, and the
 * `ease-*` token names shadow Tailwind's own easing utilities.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      shadow: ['soft', 'panel', 'control'],
      animate: [
        'fade-in',
        'fade-out',
        'scale-in',
        'scale-out',
        'slide-in-from-top',
        'slide-in-from-bottom',
        'slide-in-from-left',
        'slide-in-from-right',
        'slide-out-to-top',
        'slide-out-to-bottom',
        'slide-out-to-left',
        'slide-out-to-right',
        'accordion-down',
        'accordion-up',
      ],
    },
  },
});

/**
 * Merges class names, resolving Tailwind conflicts.
 *
 * Accepts anything `clsx` accepts (strings, arrays, objects, falsy values) and runs
 * the result through `tailwind-merge`, so a later utility wins over an earlier one in
 * the same group. Order of the surviving classes is preserved.
 *
 * @example
 * cn('p-4 text-red-500', 'p-8') // 'text-red-500 p-8'
 *
 * @example
 * cn('rounded-md', isActive && 'bg-primary-500', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
