/**
 * Property-Based Tests for Color Conversion Functions
 *
 * Uses fast-check to generate random hex colors and verify properties
 * of the hexToOklch, oklchToHex, and calculateDeltaE functions.
 *
 * @module convert-colors.test
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { hexToOklch, oklchToHex, calculateDeltaE } from './convert-colors.js';

/**
 * Arbitrary that generates valid 6-digit hex color strings prefixed with '#'.
 * Uses fc.integer({min: 0, max: 255}) for each RGB component, then formats as hex.
 */
const hexColorArb = fc
  .tuple(
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
  )
  .map(([r, g, b]) => {
    const toHex = (n) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  });

/**
 * Regex pattern for valid OKLCH format: oklch(L C H)
 * - L: 0-1 (decimal with up to 3 decimal places)
 * - C: 0-0.4 (decimal with up to 3 decimal places)
 * - H: 0-360 (integer or decimal with up to 1 decimal place)
 */
const oklchPattern = /^oklch\((\d+\.\d+)\s+(\d+\.\d+)\s+(\d+(?:\.\d+)?)\)$/;

describe('Feature: oklch-color-system, Property 1: OKLCH format and range validity', () => {
  /**
   * Property 1: OKLCH format and range validity
   *
   * For any valid hex color string, converting it to OKLCH SHALL produce a string
   * matching the pattern `oklch(L C H)` where L is in [0, 1], C is in [0, 0.4],
   * and H is in [0, 360].
   *
   * **Validates: Requirements 1.1, 1.3**
   */
  it('hexToOklch produces valid OKLCH format with L in [0,1], C in [0,0.4], H in [0,360]', () => {
    fc.assert(
      fc.property(hexColorArb, (hex) => {
        const oklch = hexToOklch(hex);

        // Must match the OKLCH pattern
        const match = oklch.match(oklchPattern);
        expect(match).not.toBeNull();

        const l = parseFloat(match[1]);
        const c = parseFloat(match[2]);
        const h = parseFloat(match[3]);

        // L must be in [0, 1]
        expect(l).toBeGreaterThanOrEqual(0);
        expect(l).toBeLessThanOrEqual(1);

        // C must be in [0, 0.4]
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThanOrEqual(0.4);

        // H must be in [0, 360]
        expect(h).toBeGreaterThanOrEqual(0);
        expect(h).toBeLessThanOrEqual(360);
      }),
      { numRuns: 100 },
    );
  });
});

describe('Feature: oklch-color-system, Property 2: Hex→OKLCH round-trip accuracy', () => {
  /**
   * Property 2: Hex→OKLCH round-trip accuracy
   *
   * For any valid hex color string, converting it to OKLCH and then converting back
   * to hex SHALL produce a color with Delta E (OKLCH) ≤ 0.02 compared to the original.
   *
   * **Validates: Requirements 1.2**
   */
  it('hex→OKLCH→hex round-trip has Delta E ≤ 0.02', () => {
    fc.assert(
      fc.property(hexColorArb, (hex) => {
        const oklch = hexToOklch(hex);
        const roundTripHex = oklchToHex(oklch);
        const deltaE = calculateDeltaE(hex, roundTripHex);

        expect(deltaE).toBeLessThanOrEqual(0.02);
      }),
      { numRuns: 100 },
    );
  });
});

/**
 * Unit Tests for Edge Cases
 *
 * Tests specific known conversions (black, white, gray) and error handling
 * for invalid inputs.
 *
 * **Validates: Requirements 1.1, 1.3**
 */
describe('Unit tests: edge cases for hexToOklch', () => {
  describe('known color conversions', () => {
    it('converts #000000 (black) to oklch(0.000 0.000 0)', () => {
      const result = hexToOklch('#000000');
      expect(result).toBe('oklch(0.000 0.000 0)');
    });

    it('converts #ffffff (white) to oklch with L close to 1.000', () => {
      const result = hexToOklch('#ffffff');
      const match = result.match(/^oklch\((\d+\.\d+)\s+(\d+\.\d+)\s+(\d+(?:\.\d+)?)\)$/);
      expect(match).not.toBeNull();

      const l = parseFloat(match[1]);
      expect(l).toBeCloseTo(1.0, 2);
    });

    it('converts #808080 (gray) to oklch with chroma = 0.000', () => {
      const result = hexToOklch('#808080');
      const match = result.match(/^oklch\((\d+\.\d+)\s+(\d+\.\d+)\s+(\d+(?:\.\d+)?)\)$/);
      expect(match).not.toBeNull();

      const c = parseFloat(match[2]);
      expect(c).toBeCloseTo(0, 3);
    });
  });

  describe('gray colors have chroma = 0', () => {
    it.each([
      ['#000000', 'black'],
      ['#808080', 'mid gray'],
      ['#ffffff', 'white'],
      ['#333333', 'dark gray'],
      ['#cccccc', 'light gray'],
    ])('%s (%s) should have chroma very close to 0', (hex) => {
      const result = hexToOklch(hex);
      const match = result.match(/^oklch\((\d+\.\d+)\s+(\d+\.\d+)\s+(\d+(?:\.\d+)?)\)$/);
      expect(match).not.toBeNull();

      const c = parseFloat(match[2]);
      expect(c).toBeLessThan(0.001);
    });
  });

  describe('invalid hex inputs throw errors', () => {
    it('throws for non-hex string "not-a-color"', () => {
      expect(() => hexToOklch('not-a-color')).toThrow(Error);
    });

    it('throws for empty string ""', () => {
      expect(() => hexToOklch('')).toThrow(Error);
    });

    it('throws for invalid hex "#xyz"', () => {
      expect(() => hexToOklch('#xyz')).toThrow(Error);
    });

    it('throws for non-string input (number 123)', () => {
      expect(() => hexToOklch(123)).toThrow(Error);
    });

    it('throws for null input', () => {
      expect(() => hexToOklch(null)).toThrow(Error);
    });

    it('throws for undefined input', () => {
      expect(() => hexToOklch(undefined)).toThrow(Error);
    });
  });
});
