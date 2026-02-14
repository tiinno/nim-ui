/**
 * Color Conversion Script: Hex → OKLCH
 *
 * Converts all Hex color values in the Nim UI token system to OKLCH format.
 * Uses the `culori` library for accurate color science conversions.
 *
 * Usage:
 *   node scripts/convert-colors.js
 *
 * Functions exported for testing:
 *   - hexToOklch(hex)       — Convert Hex string to OKLCH string
 *   - oklchToHex(oklch)     — Convert OKLCH string back to Hex string
 *   - calculateDeltaE(hex1, hex2) — Calculate Delta E between two Hex colors
 *
 * @module convert-colors
 */

import { parse, formatHex, converter, differenceEuclidean } from 'culori';

// Create converters
const toOklch = converter('oklch');
const toRgb = converter('rgb');

/**
 * Convert a Hex color string to an OKLCH color string.
 *
 * @param {string} hex - A valid hex color string (e.g., "#0ea5e9" or "#fff")
 * @returns {string} OKLCH string in the format `oklch(L C H)` where L is 0-1, C is 0-0.4, H is 0-360
 * @throws {Error} If the hex string is invalid
 *
 * @example
 * hexToOklch('#000000') // => 'oklch(0.000 0.000 0)'
 * hexToOklch('#0ea5e9') // => 'oklch(0.685 0.169 237.3)'
 */
export function hexToOklch(hex) {
  if (typeof hex !== 'string') {
    throw new Error(`Invalid hex color: expected string, got ${typeof hex}`);
  }

  const parsed = parse(hex);
  if (!parsed) {
    throw new Error(`Invalid hex color: "${hex}"`);
  }

  const oklch = toOklch(parsed);

  const l = oklch.l ?? 0;
  const c = oklch.c ?? 0;
  const h = oklch.h ?? 0;

  // Format: oklch(L C H) — L to 3 decimal places, C to 3, H to 1
  const lFormatted = l.toFixed(3);
  const cFormatted = c.toFixed(3);
  const hFormatted = c < 0.001 ? '0' : h.toFixed(1);

  return `oklch(${lFormatted} ${cFormatted} ${hFormatted})`;
}

/**
 * Convert an OKLCH color string back to a Hex color string.
 * Used for round-trip verification.
 *
 * @param {string} oklchStr - An OKLCH color string (e.g., "oklch(0.685 0.169 237.3)")
 * @returns {string} Hex color string (e.g., "#0ea5e9")
 * @throws {Error} If the OKLCH string is invalid
 *
 * @example
 * oklchToHex('oklch(0.000 0.000 0)') // => '#000000'
 * oklchToHex('oklch(0.685 0.169 237.3)') // => '#0ea5e9'
 */
export function oklchToHex(oklchStr) {
  if (typeof oklchStr !== 'string') {
    throw new Error(`Invalid OKLCH color: expected string, got ${typeof oklchStr}`);
  }

  const parsed = parse(oklchStr);
  if (!parsed) {
    throw new Error(`Invalid OKLCH color: "${oklchStr}"`);
  }

  const hex = formatHex(parsed);
  return hex;
}

/**
 * Calculate the Delta E (OKLCH) between two Hex colors.
 * Uses Euclidean distance in OKLCH color space.
 *
 * @param {string} hex1 - First hex color string
 * @param {string} hex2 - Second hex color string
 * @returns {number} Delta E value (0 = identical, higher = more different)
 * @throws {Error} If either hex string is invalid
 *
 * @example
 * calculateDeltaE('#000000', '#000000') // => 0
 * calculateDeltaE('#000000', '#ffffff') // => ~1.0
 */
export function calculateDeltaE(hex1, hex2) {
  if (typeof hex1 !== 'string') {
    throw new Error(`Invalid hex color (first argument): expected string, got ${typeof hex1}`);
  }
  if (typeof hex2 !== 'string') {
    throw new Error(`Invalid hex color (second argument): expected string, got ${typeof hex2}`);
  }

  const color1 = parse(hex1);
  if (!color1) {
    throw new Error(`Invalid hex color: "${hex1}"`);
  }

  const color2 = parse(hex2);
  if (!color2) {
    throw new Error(`Invalid hex color: "${hex2}"`);
  }

  const oklch1 = toOklch(color1);
  const oklch2 = toOklch(color2);

  const deltaE = differenceEuclidean('oklch')(oklch1, oklch2);
  return deltaE;
}

/**
 * Recursively extract all color values from a nested object.
 *
 * @param {object} obj - The color object to extract from
 * @param {string} [prefix=''] - Key prefix for nested paths
 * @returns {Array<{key: string, hex: string}>} Array of key-value pairs
 */
function extractColors(obj, prefix = '') {
  const results = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}-${key}` : key;
    if (typeof value === 'string') {
      results.push({ key: fullKey, hex: value });
    } else if (typeof value === 'object' && value !== null) {
      results.push(...extractColors(value, fullKey));
    }
  }
  return results;
}

/**
 * Main function: reads tokens.js, converts all colors, and displays a table.
 */
async function main() {
  // Dynamic import of tokens.js
  const { tokens } = await import('../packages/tailwind-config/src/tokens.js');

  const colors = extractColors(tokens.colors);

  console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    Hex → OKLCH Color Conversion Results                     ║');
  console.log('╠══════════════════════════════════════════════════════════════════════════════╣');
  console.log('║ Token              │ Hex       │ OKLCH                        │ ΔE (round)  ║');
  console.log('╠══════════════════════════════════════════════════════════════════════════════╣');

  let allPassed = true;

  for (const { key, hex } of colors) {
    const oklch = hexToOklch(hex);
    const roundTrip = oklchToHex(oklch);
    const deltaE = calculateDeltaE(hex, roundTrip);
    const passed = deltaE <= 0.02;

    if (!passed) allPassed = false;

    const status = passed ? '✓' : '✗';
    const tokenPadded = key.padEnd(18);
    const hexPadded = hex.padEnd(9);
    const oklchPadded = oklch.padEnd(28);
    const deltaPadded = deltaE.toFixed(6).padStart(8);

    console.log(`║ ${tokenPadded} │ ${hexPadded} │ ${oklchPadded} │ ${deltaPadded} ${status} ║`);
  }

  console.log('╚══════════════════════════════════════════════════════════════════════════════╝');

  if (allPassed) {
    console.log('\n✅ All conversions passed round-trip verification (Delta E ≤ 0.02)');
  } else {
    console.log('\n❌ Some conversions failed round-trip verification!');
    process.exit(1);
  }

  console.log(`\nTotal colors converted: ${colors.length}`);
}

// Run main if executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main().catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}
