/**
 * Property-Based Tests for Token Values
 *
 * Verifies that all color values in the token system use OKLCH format.
 * Uses fast-check to iterate over all color values from the tokens object.
 *
 * Feature: oklch-color-system, Property 3: All color values use OKLCH format
 *
 * @module tokens.test
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { tokens } from './tokens.js';

/**
 * Regex pattern for valid OKLCH format: oklch(L C H)
 * - L: decimal number (e.g., 0.685)
 * - C: decimal number (e.g., 0.169)
 * - H: number, optionally with decimal (e.g., 237.3 or 0)
 *
 * Non-capturing version for simple format validation.
 */
const oklchPattern = /^oklch\(\d+\.\d+\s+\d+\.\d+\s+\d+(?:\.\d+)?\)$/;

/**
 * Capturing version of the OKLCH pattern for extracting L, C, H values.
 * Groups: [1]=L, [2]=C, [3]=H
 */
const oklchCapturePattern = /^oklch\((\d+\.\d+)\s+(\d+\.\d+)\s+(\d+(?:\.\d+)?)\)$/;

/**
 * Collects all color values from the tokens.colors object recursively.
 * Returns an array of { path, value } entries for each leaf color value.
 *
 * @param {object} obj - The color object to traverse
 * @param {string} prefix - The current path prefix for labeling
 * @returns {Array<{path: string, value: string}>} All leaf color entries
 */
function collectColorValues(obj, prefix = '') {
  const entries = [];
  for (const [key, val] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof val === 'string') {
      entries.push({ path, value: val });
    } else if (typeof val === 'object' && val !== null) {
      entries.push(...collectColorValues(val, path));
    }
  }
  return entries;
}

const allColorEntries = collectColorValues(tokens.colors);

describe('Feature: oklch-color-system, Property 3: All color values use OKLCH format', () => {
  /**
   * Property 3: All color values use OKLCH format
   *
   * For any color value in the token system object, the value SHALL match
   * the OKLCH format pattern `oklch(...)`. This applies to all entries in
   * `tokens.colors` including primary (50-950), neutral (50-950), success,
   * error, and warning palettes.
   *
   * **Validates: Requirements 2.1, 3.1, 3.2, 3.3, 5.1, 6.1**
   */
  it('every color value in tokens.colors matches oklch(...) format', () => {
    // Sanity check: ensure we actually have color entries to test
    expect(allColorEntries.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(
        fc.constantFrom(...allColorEntries),
        ({ path, value }) => {
          // Every color value must match the OKLCH pattern
          const match = value.match(oklchPattern);
          expect(
            match,
            `Token "${path}" has value "${value}" which does not match OKLCH format oklch(L C H)`,
          ).not.toBeNull();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('all color values have valid OKLCH numeric ranges (L in [0,1], C in [0,0.4], H in [0,360])', () => {
    // Sanity check: ensure we actually have color entries to test
    expect(allColorEntries.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(
        fc.constantFrom(...allColorEntries),
        ({ path, value }) => {
          const match = value.match(oklchCapturePattern);
          expect(
            match,
            `Token "${path}" has value "${value}" which does not match OKLCH format`,
          ).not.toBeNull();

          const l = parseFloat(match[1]);
          const c = parseFloat(match[2]);
          const h = parseFloat(match[3]);

          // L (Lightness) must be in [0, 1]
          expect(l, `Token "${path}": L=${l} is out of range [0, 1]`).toBeGreaterThanOrEqual(0);
          expect(l, `Token "${path}": L=${l} is out of range [0, 1]`).toBeLessThanOrEqual(1);

          // C (Chroma) must be in [0, 0.4]
          expect(c, `Token "${path}": C=${c} is out of range [0, 0.4]`).toBeGreaterThanOrEqual(0);
          expect(c, `Token "${path}": C=${c} is out of range [0, 0.4]`).toBeLessThanOrEqual(0.4);

          // H (Hue) must be in [0, 360]
          expect(h, `Token "${path}": H=${h} is out of range [0, 360]`).toBeGreaterThanOrEqual(0);
          expect(h, `Token "${path}": H=${h} is out of range [0, 360]`).toBeLessThanOrEqual(360);
        },
      ),
      { numRuns: 100 },
    );
  });
});


/**
 * Unit Tests for Token Structure
 *
 * Verifies that the token system maintains the expected key structure
 * after migrating from Hex to OKLCH. The structure must remain identical
 * to ensure backward compatibility with all components.
 *
 * **Validates: Requirements 2.2, 2.3**
 */
describe('Token structure — key structure and shade counts', () => {
  const expectedTopLevelKeys = ['primary', 'neutral', 'success', 'error', 'warning'];
  const fullPaletteShades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
  const semanticShades = ['50', '500', '700'];

  it('tokens.colors has exactly the expected top-level keys: primary, neutral, success, error, warning', () => {
    const actualKeys = Object.keys(tokens.colors).sort();
    expect(actualKeys).toEqual([...expectedTopLevelKeys].sort());
  });

  it('primary palette has 11 shades (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950)', () => {
    const primaryKeys = Object.keys(tokens.colors.primary).sort((a, b) => Number(a) - Number(b));
    expect(primaryKeys).toEqual(fullPaletteShades);
    expect(primaryKeys).toHaveLength(11);
  });

  it('neutral palette has 11 shades (same keys as primary)', () => {
    const neutralKeys = Object.keys(tokens.colors.neutral).sort((a, b) => Number(a) - Number(b));
    expect(neutralKeys).toEqual(fullPaletteShades);
    expect(neutralKeys).toHaveLength(11);
  });

  it('success palette has 3 shades (50, 500, 700)', () => {
    const successKeys = Object.keys(tokens.colors.success).sort((a, b) => Number(a) - Number(b));
    expect(successKeys).toEqual(semanticShades);
    expect(successKeys).toHaveLength(3);
  });

  it('error palette has 3 shades (50, 500, 700)', () => {
    const errorKeys = Object.keys(tokens.colors.error).sort((a, b) => Number(a) - Number(b));
    expect(errorKeys).toEqual(semanticShades);
    expect(errorKeys).toHaveLength(3);
  });

  it('warning palette has 3 shades (50, 500, 700)', () => {
    const warningKeys = Object.keys(tokens.colors.warning).sort((a, b) => Number(a) - Number(b));
    expect(warningKeys).toEqual(semanticShades);
    expect(warningKeys).toHaveLength(3);
  });
});
