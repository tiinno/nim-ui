import { describe, it, expect } from 'vitest';
import { cn } from './utils';

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
});
