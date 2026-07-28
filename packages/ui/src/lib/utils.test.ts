import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { cn } from './utils';

/**
 * The `--animate-*` names declared in the kit's single source of truth. Read
 * from the CSS rather than hardcoded so that adding a 15th token without
 * teaching tailwind-merge about it fails here — the config in ./utils.ts must
 * list every one of these literally (a bundled library cannot read the CSS at
 * runtime), and nothing else keeps the two lists in step.
 */
const animateTokenNames = [
  ...readFileSync(resolve(__dirname, '../tokens.css'), 'utf-8').matchAll(
    /^\s*--animate-([a-z0-9-]+)\s*:/gm
  ),
].map((m) => m[1]);

describe('cn', () => {
  describe('clsx semantics', () => {
    it('joins plain strings', () => {
      expect(cn('flex', 'items-center')).toBe('flex items-center');
    });

    it('ignores falsy values', () => {
      expect(cn('flex', false, null, undefined, '', 0)).toBe('flex');
    });

    it('applies conditional classes', () => {
      const isActive = true;
      const isDisabled = false;
      expect(cn('flex', isActive && 'bg-primary-500', isDisabled && 'opacity-50')).toBe(
        'flex bg-primary-500'
      );
    });

    it('accepts arrays and objects', () => {
      expect(cn(['flex', 'gap-2'], { 'text-error-600': true, 'text-success-600': false })).toBe(
        'flex gap-2 text-error-600'
      );
    });

    it('returns an empty string with no meaningful input', () => {
      expect(cn()).toBe('');
      expect(cn(false, undefined)).toBe('');
    });
  });

  describe('tailwind-merge conflict resolution', () => {
    it('keeps the last utility in a conflicting group', () => {
      expect(cn('p-4', 'p-8')).toBe('p-8');
    });

    it('preserves the order of surviving classes', () => {
      expect(cn('p-4 text-red-500', 'p-8')).toBe('text-red-500 p-8');
    });

    it('resolves conflicts on the custom OKLCH color scales', () => {
      // The default color groups accept arbitrary trailing values, so the kit's
      // primary/success/error/warning/info scales need no extra config.
      expect(cn('bg-neutral-950', 'bg-red-500')).toBe('bg-red-500');
      expect(cn('bg-primary-500', 'bg-success-600')).toBe('bg-success-600');
      expect(cn('text-neutral-500', 'text-error-600')).toBe('text-error-600');
      expect(cn('border-neutral-200', 'border-warning-300')).toBe('border-warning-300');
      expect(cn('ring-primary-400', 'ring-info-500')).toBe('ring-info-500');
    });

    it('does not merge across different properties', () => {
      // Font size and text color are separate groups; both must survive.
      expect(cn('text-sm', 'text-neutral-500')).toBe('text-sm text-neutral-500');
    });

    it('resolves durations declared as theme custom properties', () => {
      // Tokens are authored as `duration-(--duration-*)`, which tailwind-merge
      // already parses into the `duration` group — no classGroups entry needed.
      expect(cn('duration-(--duration-fast)', 'duration-300')).toBe('duration-300');
      expect(cn('duration-300', 'duration-(--duration-fast)')).toBe('duration-(--duration-fast)');
    });
  });

  describe('custom elevation tokens', () => {
    // These pin `extend.theme.shadow` in ./utils.ts. Without that entry
    // tailwind-merge treats shadow-soft/panel/control as shadow *colors*, so a
    // token and a built-in size stop conflicting (both survive) while a token and
    // a real color wrongly DO conflict — 'shadow-soft shadow-red-500' collapses to
    // 'shadow-red-500', silently deleting the kit's elevation.
    //
    // There is one direct canary per token below, because removing a single token
    // from the config only breaks the assertions naming it: dropping `control`
    // would otherwise be caught by nothing but the token-vs-token case.
    it('lets a later built-in shadow override a token', () => {
      expect(cn('shadow-soft', 'shadow-lg')).toBe('shadow-lg');
      expect(cn('shadow-panel', 'shadow-lg')).toBe('shadow-lg');
      expect(cn('shadow-control', 'shadow-lg')).toBe('shadow-lg');
    });

    it('lets shadow-none override a token', () => {
      expect(cn('shadow-soft', 'shadow-none')).toBe('shadow-none');
    });

    it('lets a token override a built-in shadow', () => {
      expect(cn('shadow-lg', 'shadow-soft')).toBe('shadow-soft');
    });

    it('resolves conflicts between the tokens themselves', () => {
      expect(cn('shadow-soft', 'shadow-panel')).toBe('shadow-panel');
      expect(cn('shadow-panel', 'shadow-control')).toBe('shadow-control');
    });

    it('keeps a shadow color alongside a token', () => {
      // Elevation and shadow color are different properties — merging them would
      // silently delete the kit's elevation.
      expect(cn('shadow-soft', 'shadow-red-500')).toBe('shadow-soft shadow-red-500');
      expect(cn('shadow-panel', 'shadow-neutral-950/5')).toBe('shadow-panel shadow-neutral-950/5');
    });
  });

  describe('custom animation tokens', () => {
    // These pin `extend.theme.animate` in ./utils.ts. tailwind-merge's default
    // `theme.animate` holds only spin/ping/pulse/bounce, so without the entry the
    // kit's own `--animate-*` names are classes it has never heard of: they
    // conflict with nothing, and a caller's `animate-none` cannot switch a
    // component's animation off.
    it('found animate tokens to check', () => {
      // Guards the scan itself — a drifted regex or moved file would otherwise
      // make every it.each below pass vacuously by iterating an empty list.
      expect(animateTokenNames.length).toBeGreaterThan(10);
      expect(animateTokenNames).toContain('fade-in');
    });

    it.each(animateTokenNames)('animate-none overrides animate-%s', (name) => {
      expect(
        cn(`animate-${name}`, 'animate-none'),
        `animate-${name} is declared in tokens.css but missing from extend.theme.animate ` +
          'in ./utils.ts, so tailwind-merge does not recognise it as an animation.'
      ).toBe('animate-none');
    });

    it('resolves conflicts between the tokens themselves', () => {
      expect(cn('animate-fade-in', 'animate-fade-out')).toBe('animate-fade-out');
      expect(cn('animate-accordion-down', 'animate-accordion-up')).toBe('animate-accordion-up');
    });

    it('resolves a token against a built-in animation', () => {
      expect(cn('animate-fade-in', 'animate-spin')).toBe('animate-spin');
      expect(cn('animate-pulse', 'animate-scale-in')).toBe('animate-scale-in');
    });

    it('scopes the conflict to the modifier, as tailwind-merge does everywhere', () => {
      // A bare `animate-none` does NOT disable a variant-scoped animation — the
      // overlays (Popover, Tooltip, DropdownMenu, AlertDialog) animate under
      // `data-[state=…]:`, so a caller must match the modifier to override them.
      // Pinned because it is the surprising half of this behaviour, not a defect.
      expect(cn('data-[state=open]:animate-fade-in', 'animate-none')).toBe(
        'data-[state=open]:animate-fade-in animate-none'
      );
      expect(cn('data-[state=open]:animate-fade-in', 'data-[state=open]:animate-none')).toBe(
        'data-[state=open]:animate-none'
      );
    });
  });
});
