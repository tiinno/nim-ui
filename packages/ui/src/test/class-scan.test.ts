import { describe, it, expect } from 'vitest';
import { extractStringLiterals, toSelector } from './class-scan';

/**
 * Unit coverage for the scanner four style guards share.
 *
 * Those guards all read it the same way — "the class strings this file ships" —
 * and all fail the same way when it misreads: a file it trips on simply yields
 * fewer or wrong tokens, and every assertion about that file passes by finding
 * nothing. The scanner's own docblock says so. Until NIMUI-60 nothing tested it
 * directly, and the escape case below had been wrong the whole time.
 */
describe('extractStringLiterals', () => {
  it('reads each quote style', () => {
    expect(extractStringLiterals(`const a = 'flex gap-2';`)).toEqual(['flex gap-2']);
    expect(extractStringLiterals(`const a = "flex gap-2";`)).toEqual(['flex gap-2']);
    expect(extractStringLiterals('const a = `flex gap-2`;')).toEqual(['flex gap-2']);
  });

  it('skips comments, so prose cannot vouch for a utility', () => {
    expect(extractStringLiterals(`// 'w-96'\nconst a = 'flex';`)).toEqual(['flex']);
    expect(extractStringLiterals(`/* 'w-96' */ const a = 'flex';`)).toEqual(['flex']);
  });

  it('blanks an interpolation rather than joining across it', () => {
    expect(extractStringLiterals('const a = `px-2 ${size} py-1`;')).toEqual(['px-2   py-1']);
  });

  // The case NIMUI-59 turned up. A class carrying `content-['']` has to be
  // double-quoted or its inner pair escaped, and blanking that escape split the
  // token in half: the real class went unvouched while two fragments naming
  // nothing joined the user set. Both spellings must read identically, because
  // the string they describe IS identical once evaluated.
  it('carries an escaped quote into the value, so the token stays whole', () => {
    const doubleQuoted = `const a = "after:absolute after:content-['']";`;
    const singleQuoted = `const a = 'after:absolute after:content-[\\'\\']';`;

    expect(extractStringLiterals(doubleQuoted)).toEqual(["after:absolute after:content-['']"]);
    expect(extractStringLiterals(singleQuoted)).toEqual(extractStringLiterals(doubleQuoted));
  });

  it('carries an escaped backslash, and still blanks every other escape', () => {
    expect(extractStringLiterals(`const a = 'a\\\\b';`)).toEqual(['a\\b']);
    expect(extractStringLiterals(`const a = 'a\\nb';`)).toEqual(['a b']);
  });

  it('bails at the newline of an unterminated quote rather than swallowing the file', () => {
    expect(extractStringLiterals(`const a = 'flex\nconst b = 'gap-2';`)).toEqual(['flex', 'gap-2']);
  });

  it('round-trips a class through toSelector once the escape is carried', () => {
    const [literal] = extractStringLiterals(`const a = 'after:content-[\\'\\']';`);
    // `-` is one of the characters Tailwind leaves unescaped, so it stays bare.
    expect(toSelector(literal as string)).toBe(String.raw`.after\:content-\[\'\'\]`);
  });
});
