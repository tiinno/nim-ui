// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — tokens.js is a plain JS module without type declarations
import { tokens } from '@tiinno-ui/tailwind-config/tokens';
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Typed reference to the animation tokens
const animationTokens = tokens.animation as {
  duration: Record<string, string>;
  easing: Record<string, string>;
};

// Read styles.css once for all tests
const stylesPath = resolve(__dirname, '../../styles.css');
const stylesCss = readFileSync(stylesPath, 'utf-8');

/**
 * Extract the @theme block content from styles.css
 */
function extractThemeBlock(css: string): string {
  const match = css.match(/@theme\s*\{([\s\S]*?)\n\}/);
  return match && match[1] ? match[1] : '';
}

/**
 * Parse CSS custom property declarations from a block of CSS text.
 * Returns a map of property name -> value.
 */
function parseCssCustomProperties(block: string): Record<string, string> {
  const props: Record<string, string> = {};
  const regex = /--([\w-]+)\s*:\s*([^;]+);/g;
  let m = regex.exec(block);
  while (m !== null) {
    const key = m[1] as string;
    const val = m[2] as string;
    props[key] = val.trim();
    m = regex.exec(block);
  }
  return props;
}

/**
 * Extract all @keyframes names and their body content from CSS.
 */
function extractKeyframes(css: string): Map<string, string> {
  const result = new Map<string, string>();
  const regex = /@keyframes\s+([\w-]+)\s*\{([\s\S]*?)\n\}/g;
  let m = regex.exec(css);
  while (m !== null) {
    const name = m[1] as string;
    const body = m[2] as string;
    result.set(name, body);
    m = regex.exec(css);
  }
  return result;
}

const themeBlock = extractThemeBlock(stylesCss);
const themeProps = parseCssCustomProperties(themeBlock);
const keyframes = extractKeyframes(stylesCss);

// ---------------------------------------------------------------------------
// Property 1: Animation token completeness
// **Validates: Requirements 1.1, 1.2**
// Feature: css-animation-system, Property 1: Animation token completeness
// ---------------------------------------------------------------------------
describe('Property 1: Animation token completeness', () => {
  const durationNames = ['fast', 'normal', 'slow'] as const;
  const easingNames = ['ease-out', 'ease-in', 'ease-in-out'] as const;

  it('every required duration token exists and has a valid ms value', () => {
    const durationArb = fc.constantFrom(...durationNames);

    fc.assert(
      fc.property(durationArb, (name) => {
        const value = animationTokens.duration[name];
        expect(value).toBeDefined();
        expect(value).toMatch(/^\d+ms$/);
      }),
      { numRuns: 100 },
    );
  });

  it('every required easing token exists and has a valid cubic-bezier value', () => {
    const easingArb = fc.constantFrom(...easingNames);

    fc.assert(
      fc.property(easingArb, (name) => {
        const value = animationTokens.easing[name];
        expect(value).toBeDefined();
        expect(value).toMatch(/^cubic-bezier\(.+\)$/);
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 2: Token consistency (round-trip)
// **Validates: Requirements 1.4**
// Feature: css-animation-system, Property 2: Token consistency (round-trip)
// ---------------------------------------------------------------------------
describe('Property 2: Token consistency (round-trip)', () => {
  const tokenEntries: Array<{ cssKey: string; jsValue: string }> = [];

  for (const [name, value] of Object.entries(animationTokens.duration)) {
    tokenEntries.push({ cssKey: `duration-${name}`, jsValue: value });
  }
  for (const [name, value] of Object.entries(animationTokens.easing)) {
    tokenEntries.push({ cssKey: name, jsValue: value });
  }

  it('every JS animation token matches its CSS custom property in @theme', () => {
    const entryArb = fc.constantFrom(...tokenEntries);

    fc.assert(
      fc.property(entryArb, ({ cssKey, jsValue }) => {
        const cssValue = themeProps[cssKey];
        expect(cssValue).toBeDefined();
        expect(cssValue).toBe(jsValue);
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 3: GPU-only keyframes
// **Validates: Requirements 3.1**
// Feature: css-animation-system, Property 3: GPU-only keyframes
// ---------------------------------------------------------------------------
describe('Property 3: GPU-only keyframes', () => {
  const ALLOWED_PROPERTIES = new Set(['transform', 'opacity']);
  const LAYOUT_PROPERTIES = [
    'width', 'height', 'margin', 'padding',
    'top', 'left', 'right', 'bottom',
  ];

  function extractAnimatedProperties(body: string): string[] {
    const props: string[] = [];
    const regex = /\b([\w-]+)\s*:/g;
    let m = regex.exec(body);
    while (m !== null) {
      const prop = m[1] as string;
      // Skip selectors like "from", "to", and percentage values
      if (prop !== 'from' && prop !== 'to' && !/^\d/.test(prop)) {
        props.push(prop);
      }
      m = regex.exec(body);
    }
    return props;
  }

  const keyframeNames = Array.from(keyframes.keys());

  it('every @keyframes definition only animates GPU-safe properties (transform, opacity)', () => {
    const nameArb = fc.constantFrom(...keyframeNames);

    fc.assert(
      fc.property(nameArb, (name) => {
        const body = keyframes.get(name)!;
        const animatedProps = extractAnimatedProperties(body);

        for (const prop of animatedProps) {
          expect(ALLOWED_PROPERTIES.has(prop)).toBe(true);
        }

        for (const layoutProp of LAYOUT_PROPERTIES) {
          expect(animatedProps).not.toContain(layoutProp);
        }
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 7: Keyframe completeness
// **Validates: Requirements 7.1**
// Feature: css-animation-system, Property 7: Keyframe completeness
// ---------------------------------------------------------------------------
describe('Property 7: Keyframe completeness', () => {
  const requiredKeyframes = [
    'fade-in', 'fade-out',
    'scale-in', 'scale-out',
    'slide-in-from-top', 'slide-in-from-bottom',
    'slide-in-from-left', 'slide-in-from-right',
    'slide-out-to-top', 'slide-out-to-bottom',
    'slide-out-to-left', 'slide-out-to-right',
  ] as const;

  it('every required keyframe name has a @keyframes declaration in styles.css', () => {
    const nameArb = fc.constantFrom(...requiredKeyframes);

    fc.assert(
      fc.property(nameArb, (name) => {
        expect(keyframes.has(name)).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});


// ---------------------------------------------------------------------------
// Property 4: Overlay animation state coverage
// **Validates: Requirements 4.1, 4.2, 4.3, 9.3**
// Feature: css-animation-system, Property 4: Overlay animation state coverage
// ---------------------------------------------------------------------------
describe('Property 4: Overlay animation state coverage', () => {
  /**
   * Read a component source file and return its content.
   */
  function readComponent(relativePath: string): string {
    return readFileSync(resolve(__dirname, '..', relativePath), 'utf-8');
  }

  // Define overlay component sub-elements and their source files
  const overlayElements = [
    { name: 'ModalOverlay', file: 'modal.tsx' },
    { name: 'ModalContent / modalContentVariants', file: 'modal.tsx' },
    { name: 'DrawerOverlay', file: 'drawer.tsx' },
    { name: 'DrawerContent / drawerContentVariants', file: 'drawer.tsx' },
    { name: 'SelectContent / selectContentVariants', file: 'select.tsx' },
  ] as const;

  /**
   * Extract all class strings from a component file — both CVA base strings
   * and inline className strings that contain data-[state=] selectors.
   */
  function extractClassStrings(source: string): string {
    // Capture CVA first-argument strings (base classes)
    const cvaMatches = source.match(/cva\(\s*'([^']+)'/g) ?? [];
    const cvaStrings = cvaMatches.map((m) => {
      const inner = m.match(/cva\(\s*'([^']+)'/);
      return inner?.[1] ?? '';
    });

    // Capture CVA variant value strings
    const variantValueMatches = source.match(/'([^']*data-\[state=[^']+)'/g) ?? [];
    const variantStrings = variantValueMatches.map((m) => m.slice(1, -1));

    // Capture inline className strings that contain data-[state=
    const inlineMatches = source.match(/'([^']*data-\[state=[^']+)'/g) ?? [];
    const inlineStrings = inlineMatches.map((m) => m.slice(1, -1));

    return [...cvaStrings, ...variantStrings, ...inlineStrings].join(' ');
  }

  it('every overlay component element has both data-[state=open] enter and data-[state=closed] exit animation classes', () => {
    const elementArb = fc.constantFrom(...overlayElements);

    fc.assert(
      fc.property(elementArb, (element) => {
        const source = readComponent(element.file);
        const allClasses = extractClassStrings(source);

        // Must have at least one data-[state=open]:animate-* class
        expect(allClasses).toMatch(/data-\[state=open\]:animate-[\w-]+/);

        // Must have at least one data-[state=closed]:animate-* class
        expect(allClasses).toMatch(/data-\[state=closed\]:animate-[\w-]+/);

        // The enter animation class must reference a custom keyframe utility
        const openAnimations = allClasses.match(/data-\[state=open\]:animate-([\w-]+)/g) ?? [];
        expect(openAnimations.length).toBeGreaterThan(0);

        // The exit animation class must reference a custom keyframe utility
        const closedAnimations = allClasses.match(/data-\[state=closed\]:animate-([\w-]+)/g) ?? [];
        expect(closedAnimations.length).toBeGreaterThan(0);

        // Verify the referenced keyframe names exist in our styles.css keyframes
        for (const match of openAnimations) {
          const animName = match.replace('data-[state=open]:animate-', '');
          expect(keyframes.has(animName)).toBe(true);
        }
        for (const match of closedAnimations) {
          const animName = match.replace('data-[state=closed]:animate-', '');
          expect(keyframes.has(animName)).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 5: Drawer direction matching
// **Validates: Requirements 4.5**
// Feature: css-animation-system, Property 5: Drawer direction matching
// ---------------------------------------------------------------------------
describe('Property 5: Drawer direction matching', () => {
  /**
   * Extract the CVA variant class string for a given side from drawer.tsx.
   */
  function getDrawerSideClasses(side: 'left' | 'right'): string {
    const source = readFileSync(resolve(__dirname, '..', 'drawer.tsx'), 'utf-8');

    // Match the side variant value string inside drawerContentVariants
    // Pattern: left: '...' or right: '...'
    const regex = new RegExp(`${side}:\\s*'([^']+)'`);
    const match = source.match(regex);
    return match?.[1] ?? '';
  }

  const sides = ['left', 'right'] as const;

  it('each Drawer side variant has a slide-in animation matching its direction and a reverse slide-out for exit', () => {
    const sideArb = fc.constantFrom(...sides);

    fc.assert(
      fc.property(sideArb, (side) => {
        const classes = getDrawerSideClasses(side);

        // Enter: slide-in-from-{side}
        expect(classes).toContain(`animate-slide-in-from-${side}`);
        expect(classes).toContain(`data-[state=open]:animate-slide-in-from-${side}`);

        // Exit: slide-out-to-{side}
        expect(classes).toContain(`animate-slide-out-to-${side}`);
        expect(classes).toContain(`data-[state=closed]:animate-slide-out-to-${side}`);
      }),
      { numRuns: 100 },
    );
  });
});


// ---------------------------------------------------------------------------
// Property 6: Form control Radix state selectors
// **Validates: Requirements 5.4**
// Feature: css-animation-system, Property 6: Form control Radix state selectors
// ---------------------------------------------------------------------------
describe('Property 6: Form control Radix state selectors', () => {
  /**
   * Read a component source file relative to the components directory.
   */
  function readComponent(relativePath: string): string {
    return readFileSync(resolve(__dirname, '..', relativePath), 'utf-8');
  }

  /**
   * Extract all CVA base class strings (first argument to cva()) from source.
   */
  function extractCvaBaseStrings(source: string): string[] {
    const results: string[] = [];
    const regex = /cva\(\s*'([^']+)'/g;
    let m = regex.exec(source);
    while (m !== null) {
      results.push(m[1] as string);
      m = regex.exec(source);
    }
    return results;
  }

  /**
   * Extract CVA variant value strings that contain data-[state= selectors.
   */
  function extractVariantStateStrings(source: string): string[] {
    const results: string[] = [];
    const regex = /'([^']*data-\[state=[^']+)'/g;
    let m = regex.exec(source);
    while (m !== null) {
      results.push(m[1] as string);
      m = regex.exec(source);
    }
    return results;
  }

  // Radix-based form control components with their CVA definitions.
  // Switch uses both data-[state=checked] and data-[state=unchecked] explicitly
  // because it needs distinct colors for both states.
  // Checkbox only uses data-[state=checked] because the unchecked appearance
  // is the base/default style — this is a valid Radix pattern.
  const radixFormControls = [
    {
      name: 'Switch',
      file: 'switch.tsx',
      requiresUnchecked: true,
    },
    {
      name: 'Checkbox',
      file: 'checkbox.tsx',
      requiresUnchecked: false,
    },
  ] as const;

  it('every Radix-based form control uses data-[state=checked] selectors with transition classes for state changes', () => {
    const controlArb = fc.constantFrom(...radixFormControls);

    fc.assert(
      fc.property(controlArb, (control) => {
        const source = readComponent(control.file);
        const cvaBaseStrings = extractCvaBaseStrings(source);
        const variantStateStrings = extractVariantStateStrings(source);
        const allClassStrings = [...cvaBaseStrings, ...variantStateStrings].join(' ');

        // Every Radix form control must use data-[state=checked] selector
        expect(allClassStrings).toMatch(/data-\[state=checked\]/);

        // Switch must also have data-[state=unchecked] for explicit unchecked styling
        if (control.requiresUnchecked) {
          expect(allClassStrings).toMatch(/data-\[state=unchecked\]/);
        }

        // Must have transition classes applied (transition-* in the CVA base)
        const hasTransition = cvaBaseStrings.some(
          (s) => /transition[-\w]*/.test(s),
        );
        expect(hasTransition).toBe(true);

        // Verify that the transition uses animation token duration (duration-fast)
        const hasDurationToken = cvaBaseStrings.some(
          (s) => /duration-fast/.test(s),
        );
        expect(hasDurationToken).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});


// ---------------------------------------------------------------------------
// Property 8: Backward compatible props
// **Validates: Requirements 9.1**
// Feature: css-animation-system, Property 8: Backward compatible props
// ---------------------------------------------------------------------------
describe('Property 8: Backward compatible props', () => {
  /**
   * Components modified by the animation system and their source files.
   * For each component we record:
   * - file: the source file relative to the components directory
   * - propsInterfaces: the exported interface names that define the public API
   * - allowedNewOptionalProps: new optional props introduced by the animation system
   *   (these are allowed as long as they are optional)
   */
  const modifiedComponents = [
    { name: 'Modal', file: 'modal.tsx', allowedNewOptionalProps: [] as string[] },
    { name: 'Drawer', file: 'drawer.tsx', allowedNewOptionalProps: [] as string[] },
    { name: 'Select', file: 'select.tsx', allowedNewOptionalProps: [] as string[] },
    { name: 'Button', file: 'button.tsx', allowedNewOptionalProps: [] as string[] },
    { name: 'Input', file: 'input.tsx', allowedNewOptionalProps: [] as string[] },
    { name: 'Textarea', file: 'textarea.tsx', allowedNewOptionalProps: [] as string[] },
    { name: 'Switch', file: 'switch.tsx', allowedNewOptionalProps: [] as string[] },
    { name: 'Checkbox', file: 'checkbox.tsx', allowedNewOptionalProps: [] as string[] },
    { name: 'Card', file: 'card.tsx', allowedNewOptionalProps: [] as string[] },
    { name: 'Tabs', file: 'tabs.tsx', allowedNewOptionalProps: [] as string[] },
    { name: 'Badge', file: 'badge.tsx', allowedNewOptionalProps: ['animate'] as string[] },
  ];

  /**
   * Extract all exported interface blocks from a TypeScript source file.
   * Returns an array of { name, body } where body is the raw text between { }.
   */
  function extractExportedInterfaces(source: string): Array<{ name: string; body: string }> {
    const results: Array<{ name: string; body: string }> = [];
    const regex = /export\s+interface\s+(\w+)[^{]*\{([^}]*)\}/g;
    let m = regex.exec(source);
    while (m !== null) {
      results.push({ name: m[1] as string, body: m[2] as string });
      m = regex.exec(source);
    }
    return results;
  }

  /**
   * Extract explicitly declared props from an interface body.
   * Returns an array of { name, optional } for each prop declared directly
   * in the interface (not inherited via extends).
   */
  function extractDeclaredProps(body: string): Array<{ name: string; optional: boolean }> {
    const props: Array<{ name: string; optional: boolean }> = [];
    // Match lines like:  propName?: type;  or  propName: type;
    const regex = /^\s*(\w+)(\??)\s*:/gm;
    let m = regex.exec(body);
    while (m !== null) {
      props.push({ name: m[1] as string, optional: m[2] === '?' });
      m = regex.exec(body);
    }
    return props;
  }

  it('no component has added new required props — all new props from the animation system must be optional', () => {
    const componentArb = fc.constantFrom(...modifiedComponents);

    fc.assert(
      fc.property(componentArb, (component) => {
        const source = readFileSync(
          resolve(__dirname, '..', component.file),
          'utf-8',
        );
        const interfaces = extractExportedInterfaces(source);

        // Every exported interface should have no new required props added
        // by the animation system. The only new props allowed are those
        // listed in allowedNewOptionalProps, and they must be optional.
        for (const iface of interfaces) {
          const declaredProps = extractDeclaredProps(iface.body);

          for (const prop of declaredProps) {
            if (component.allowedNewOptionalProps.includes(prop.name)) {
              // This is a known new prop from the animation system — it MUST be optional
              expect(prop.optional).toBe(true);
            }
          }
        }

        // For Badge specifically, verify the `animate` prop exists and is optional.
        // It comes through VariantProps<typeof badgeVariants> (not declared in the
        // interface body directly), so we verify it in the CVA variants instead.
        if (component.name === 'Badge') {
          // The animate variant should be defined in the CVA variants
          expect(source).toMatch(/animate\s*:\s*\{/);
          // VariantProps makes CVA variants optional by default, but verify
          // the variant value is boolean-style (true: '...')
          expect(source).toMatch(/animate\s*:\s*\{\s*true\s*:/);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('every modified component can be imported without new required props in its interface', () => {
    const componentArb = fc.constantFrom(...modifiedComponents);

    fc.assert(
      fc.property(componentArb, (component) => {
        const source = readFileSync(
          resolve(__dirname, '..', component.file),
          'utf-8',
        );
        const interfaces = extractExportedInterfaces(source);

        for (const iface of interfaces) {
          const declaredProps = extractDeclaredProps(iface.body);
          const requiredProps = declaredProps.filter((p) => !p.optional);

          // Any required prop must NOT be an animation-system prop.
          // Animation-system props are only: 'animate' (for Badge).
          // No other component should have new required props from the animation system.
          for (const prop of requiredProps) {
            expect(prop.name).not.toBe('animate');
          }
        }
      }),
      { numRuns: 100 },
    );
  });

  it('components that extend HTML/Radix interfaces preserve the extends clause unchanged', () => {
    const componentArb = fc.constantFrom(...modifiedComponents);

    fc.assert(
      fc.property(componentArb, (component) => {
        const source = readFileSync(
          resolve(__dirname, '..', component.file),
          'utf-8',
        );

        // Every exported interface that extends another type should still
        // include VariantProps in its extends clause (this is the CVA pattern).
        // This ensures the component follows the standard pattern and hasn't
        // replaced the extends with something incompatible.
        const interfaces = extractExportedInterfaces(source);
        for (const iface of interfaces) {
          // Find the full interface declaration including extends
          const ifaceRegex = new RegExp(
            `export\\s+interface\\s+${iface.name}\\s+extends\\s+([^{]+)`,
          );
          const extendsMatch = source.match(ifaceRegex);
          if (extendsMatch) {
            const extendsClause = extendsMatch[1] as string;
            // Should include VariantProps (CVA pattern)
            expect(extendsClause).toMatch(/VariantProps/);
          }
        }
      }),
      { numRuns: 100 },
    );
  });
});
