import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge configured for the Nim UI theme.
 *
 * `shadow-soft` / `shadow-panel` / `shadow-control` are `@theme` elevation tokens.
 * tailwind-merge's default `theme.shadow` is empty, so without this extension it
 * classifies them as *shadow colors* — `shadow-soft shadow-lg` would keep both,
 * and `shadow-soft shadow-red-500` would silently drop the elevation entirely.
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
