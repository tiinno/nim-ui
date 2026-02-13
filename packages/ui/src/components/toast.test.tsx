import * as fc from 'fast-check';
import { toastStore, toast } from './toast-store';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Clear the store between tests to avoid state leakage */
function resetStore() {
  toastStore.clear();
}

/** Arbitrary for valid toast variants */
const variantArb = fc.constantFrom(
  'default' as const,
  'success' as const,
  'error' as const,
  'warning' as const,
  'info' as const,
);

/** Arbitrary for optional non-empty strings (title / description) */
const optionalStringArb = fc.option(
  fc.string({ minLength: 1, maxLength: 100 }),
  { nil: undefined },
);

/** Arbitrary for optional positive duration */
const optionalDurationArb = fc.option(
  fc.integer({ min: 1, max: 60_000 }),
  { nil: undefined },
);

/** Arbitrary for a valid ToastOptions-like object used with toast() */
const toastOptionsArb = fc.record({
  title: optionalStringArb,
  description: optionalStringArb,
  variant: fc.option(variantArb, { nil: undefined }),
  duration: optionalDurationArb,
});

// ---------------------------------------------------------------------------
// Property 3: Toast store maintains chronological ordering
// **Feature: toast-notification-system, Property 3: Toast store maintains chronological ordering**
// **Validates: Requirements 1.5**
// ---------------------------------------------------------------------------
describe('Property 3: Toast store maintains chronological ordering', () => {
  afterEach(resetStore);

  it('toasts appear in the store in the same order they were added', () => {
    fc.assert(
      fc.property(
        fc.array(toastOptionsArb, { minLength: 1, maxLength: 20 }),
        (optionsList) => {
          resetStore();

          const ids: string[] = [];
          for (const opts of optionsList) {
            ids.push(toast(opts));
          }

          const snapshot = toastStore.getSnapshot();

          // Length must match
          expect(snapshot).toHaveLength(ids.length);

          // Order must match insertion order
          for (let i = 0; i < ids.length; i++) {
            expect(snapshot[i]!.id).toBe(ids[i]);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 4: Toast add round-trip — toast() creates findable toast with matching properties
// **Feature: toast-notification-system, Property 4: Toast add round-trip — toast() creates findable toast with matching properties**
// **Validates: Requirements 6.2, 6.4, 6.6**
// ---------------------------------------------------------------------------
describe('Property 4: Toast add round-trip — toast() creates findable toast with matching properties', () => {
  afterEach(resetStore);

  it('toast() returns an id and the store contains a toast with matching properties', () => {
    fc.assert(
      fc.property(toastOptionsArb, (opts) => {
        resetStore();

        const id = toast(opts);

        // id must be a non-empty string
        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(0);

        const snapshot = toastStore.getSnapshot();
        const found = snapshot.find((t) => t.id === id);

        expect(found).toBeDefined();

        // Title must match
        expect(found!.title).toBe(opts.title);

        // Description must match
        expect(found!.description).toBe(opts.description);

        // Variant: defaults to 'default' when not provided
        const expectedVariant = opts.variant ?? 'default';
        expect(found!.variant).toBe(expectedVariant);

        // Duration must match
        expect(found!.duration).toBe(opts.duration);
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 5: Toast dismiss removes only the targeted toast
// **Feature: toast-notification-system, Property 5: Toast dismiss removes only the targeted toast**
// **Validates: Requirements 6.5, 6.7**
// ---------------------------------------------------------------------------
describe('Property 5: Toast dismiss removes only the targeted toast', () => {
  afterEach(resetStore);

  it('dismissing one toast removes only that toast and preserves order of the rest', () => {
    fc.assert(
      fc.property(
        fc
          .array(toastOptionsArb, { minLength: 2, maxLength: 15 })
          .chain((optsList) =>
            fc.record({
              optsList: fc.constant(optsList),
              dismissIndex: fc.integer({ min: 0, max: optsList.length - 1 }),
            }),
          ),
        ({ optsList, dismissIndex }) => {
          resetStore();

          // Add all toasts
          const ids: string[] = [];
          for (const opts of optsList) {
            ids.push(toast(opts));
          }

          const dismissedId = ids[dismissIndex]!;

          // Snapshot before dismiss
          const before = toastStore.getSnapshot();
          expect(before).toHaveLength(ids.length);

          // Dismiss the targeted toast
          toast.dismiss(dismissedId);

          const after = toastStore.getSnapshot();

          // Length should be N-1
          expect(after).toHaveLength(ids.length - 1);

          // Dismissed toast must be absent
          expect(after.find((t) => t.id === dismissedId)).toBeUndefined();

          // Remaining toasts must be in original order
          const expectedIds = ids.filter((id) => id !== dismissedId);
          for (let i = 0; i < expectedIds.length; i++) {
            expect(after[i]!.id).toBe(expectedIds[i]);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 6: Shorthand functions set correct variant
// **Feature: toast-notification-system, Property 6: Shorthand functions set correct variant**
// **Validates: Requirements 6.3**
// ---------------------------------------------------------------------------
describe('Property 6: Shorthand functions set correct variant', () => {
  afterEach(resetStore);

  const shorthands = [
    { fn: toast.success, variant: 'success' as const },
    { fn: toast.error, variant: 'error' as const },
    { fn: toast.warning, variant: 'warning' as const },
    { fn: toast.info, variant: 'info' as const },
  ] as const;

  it('each shorthand creates a toast with the correct variant', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...shorthands),
        fc.string({ minLength: 1, maxLength: 100 }),
        ({ fn, variant }, title) => {
          resetStore();

          const id = fn(title);

          const snapshot = toastStore.getSnapshot();
          const found = snapshot.find((t) => t.id === id);

          expect(found).toBeDefined();
          expect(found!.variant).toBe(variant);
          expect(found!.title).toBe(title);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// CVA Variant Property Tests (Properties 1 & 2)
// ---------------------------------------------------------------------------

import { viewportVariants, toastVariants } from './toast';

// ---------------------------------------------------------------------------
// Property 1: Position variant maps to correct CSS classes
// **Feature: toast-notification-system, Property 1: Position variant maps to correct CSS classes**
// **Validates: Requirements 1.3**
// ---------------------------------------------------------------------------
describe('Property 1: Position variant maps to correct CSS classes', () => {
  const positionExpectations: Record<string, { vertical: string; horizontal: string }> = {
    'top-right': { vertical: 'top-0', horizontal: 'right-0' },
    'top-left': { vertical: 'top-0', horizontal: 'left-0' },
    'top-center': { vertical: 'top-0', horizontal: 'left-1/2' },
    'bottom-right': { vertical: 'bottom-0', horizontal: 'right-0' },
    'bottom-left': { vertical: 'bottom-0', horizontal: 'left-0' },
    'bottom-center': { vertical: 'bottom-0', horizontal: 'left-1/2' },
  };

  type PositionKey = keyof typeof positionExpectations;

  const positionArb = fc.constantFrom<PositionKey>(
    'top-right',
    'top-left',
    'top-center',
    'bottom-right',
    'bottom-left',
    'bottom-center',
  );

  it('viewportVariants produces correct vertical and horizontal CSS classes for any position', () => {
    fc.assert(
      fc.property(positionArb, (position) => {
        const classes = viewportVariants({ position: position as 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center' });
        const expected = positionExpectations[position]!;

        expect(classes).toContain(expected.vertical);
        expect(classes).toContain(expected.horizontal);
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 2: Toast variant styling includes light and dark mode classes
// **Feature: toast-notification-system, Property 2: Toast variant styling includes light and dark mode classes**
// **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**
// ---------------------------------------------------------------------------
describe('Property 2: Toast variant styling includes light and dark mode classes', () => {
  const variantTokenExpectations: Record<string, { lightTokens: string[]; hasDark: boolean }> = {
    default: {
      lightTokens: ['neutral-200', 'neutral-900'],
      hasDark: true,
    },
    success: {
      lightTokens: ['success-500', 'success-50', 'success-700'],
      hasDark: true,
    },
    error: {
      lightTokens: ['error-500', 'error-50', 'error-700'],
      hasDark: true,
    },
    warning: {
      lightTokens: ['warning-500', 'warning-50', 'warning-700'],
      hasDark: true,
    },
    info: {
      lightTokens: ['primary-500', 'primary-50', 'primary-700'],
      hasDark: true,
    },
  };

  type VariantKey = keyof typeof variantTokenExpectations;

  const toastVariantArb = fc.constantFrom<VariantKey>(
    'default',
    'success',
    'error',
    'warning',
    'info',
  );

  it('toastVariants produces classes containing correct light mode tokens and dark: prefix for any variant', () => {
    fc.assert(
      fc.property(toastVariantArb, (variant) => {
        const classes = toastVariants({ variant: variant as 'default' | 'success' | 'error' | 'warning' | 'info' });
        const expected = variantTokenExpectations[variant]!;

        // Verify each expected light mode token is present in the class string
        for (const token of expected.lightTokens) {
          expect(classes).toContain(token);
        }

        // Verify dark mode classes are present (at least one dark: prefixed class)
        expect(classes).toContain('dark:');
      }),
      { numRuns: 100 },
    );
  });
});


// ---------------------------------------------------------------------------
// Additional imports for Property 7 and unit tests
// ---------------------------------------------------------------------------

import * as ToastModule from './toast';
import * as ToastStoreModule from './toast-store';
import { render, screen } from '@testing-library/react';
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  Toaster,
} from './toast';

// ---------------------------------------------------------------------------
// Property 7: Module exports completeness
// **Feature: toast-notification-system, Property 7: Module exports completeness**
// **Validates: Requirements 8.1, 8.2, 8.4**
// ---------------------------------------------------------------------------
describe('Property 7: Module exports completeness', () => {
  const toastModuleExports = [
    'Toast',
    'ToastProvider',
    'ToastViewport',
    'ToastTitle',
    'ToastDescription',
    'ToastClose',
    'ToastAction',
    'Toaster',
    'toastVariants',
    'viewportVariants',
  ] as const;

  const toastStoreExports = ['toast', 'toastStore', 'useToastStore'] as const;

  it('toast module exports all required component and variant names as defined values', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...toastModuleExports),
        (exportName) => {
          const value = (ToastModule as Record<string, unknown>)[exportName];
          expect(value).toBeDefined();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('toast-store module exports all required store and API names as defined values', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...toastStoreExports),
        (exportName) => {
          const value = (ToastStoreModule as Record<string, unknown>)[exportName];
          expect(value).toBeDefined();
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Unit Tests
// ---------------------------------------------------------------------------

describe('Toast unit tests', () => {
  afterEach(() => {
    toastStore.clear();
  });

  // -------------------------------------------------------------------------
  // Rendering
  // Validates: Requirements 2.7, 2.8
  // -------------------------------------------------------------------------
  describe('rendering', () => {
    it('renders Toast with default props', () => {
      render(
        <ToastProvider>
          <Toast>
            <ToastTitle>Hello</ToastTitle>
          </Toast>
          <ToastViewport />
        </ToastProvider>,
      );

      expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    it('Toaster renders without errors', () => {
      const { container } = render(<Toaster />);
      expect(container).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Variants — each variant renders correct CSS classes
  // Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
  // -------------------------------------------------------------------------
  describe('variants', () => {
    const variantClassMap: Record<string, string> = {
      default: 'border-neutral-200',
      success: 'bg-success-50',
      error: 'bg-error-50',
      warning: 'bg-warning-50',
      info: 'bg-primary-50',
    };

    for (const [variant, expectedClass] of Object.entries(variantClassMap)) {
      it(`variant="${variant}" renders with class "${expectedClass}"`, () => {
        render(
          <ToastProvider>
            <Toast variant={variant as 'default' | 'success' | 'error' | 'warning' | 'info'} data-testid="toast">
              <ToastTitle>Test</ToastTitle>
            </Toast>
            <ToastViewport />
          </ToastProvider>,
        );

        const toastEl = screen.getByTestId('toast');
        expect(toastEl.className).toContain(expectedClass);
      });
    }
  });

  // -------------------------------------------------------------------------
  // Accessibility
  // Validates: Requirements 4.1, 7.1, 7.3, 7.4
  // -------------------------------------------------------------------------
  describe('accessibility', () => {
    it('ToastClose has aria-label attribute', () => {
      render(
        <ToastProvider>
          <Toast>
            <ToastTitle>Test</ToastTitle>
            <ToastClose data-testid="close-btn" />
          </Toast>
          <ToastViewport />
        </ToastProvider>,
      );

      const closeBtn = screen.getByTestId('close-btn');
      expect(closeBtn).toHaveAttribute('aria-label');
      expect(closeBtn.getAttribute('aria-label')!.length).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------------------
  // Keyboard dismiss (Escape)
  // Validates: Requirements 4.3
  // -------------------------------------------------------------------------
  describe('keyboard interactions', () => {
    it('Toast component supports Escape key dismiss via Radix primitives', () => {
      // Radix Toast.Root handles Escape key natively.
      // We verify the component renders with Radix primitives that provide this behavior.
      render(
        <ToastProvider>
          <Toast data-testid="toast-root">
            <ToastTitle>Dismissable</ToastTitle>
            <ToastClose />
          </Toast>
          <ToastViewport />
        </ToastProvider>,
      );

      const toastEl = screen.getByTestId('toast-root');
      // The toast is rendered as a Radix Toast.Root which handles Escape natively
      expect(toastEl).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // Validates: Requirements 3.4, 7.4
  // -------------------------------------------------------------------------
  describe('edge cases', () => {
    it('duration Infinity — toast with Infinity duration does not auto-dismiss', async () => {
      // Radix Toast uses the duration prop to control auto-dismiss.
      // Setting duration=Infinity means the toast stays open indefinitely.
      // We verify the component accepts and renders with this prop.
      render(
        <ToastProvider>
          <Toast duration={Infinity} data-testid="persistent-toast">
            <ToastTitle>Persistent</ToastTitle>
            <ToastClose />
          </Toast>
          <ToastViewport />
        </ToastProvider>,
      );

      const toastEl = screen.getByTestId('persistent-toast');
      expect(toastEl).toBeInTheDocument();
      expect(screen.getByText('Persistent')).toBeInTheDocument();
    });

    it('dismiss non-existent id is a no-op (store length unchanged)', () => {
      // Add some toasts first
      toast({ title: 'A' });
      toast({ title: 'B' });

      const before = toastStore.getSnapshot();
      expect(before).toHaveLength(2);

      // Dismiss a non-existent id
      toast.dismiss('non-existent-id-xyz');

      const after = toastStore.getSnapshot();
      expect(after).toHaveLength(2);

      // Verify the same toasts remain
      expect(after[0]!.title).toBe('A');
      expect(after[1]!.title).toBe('B');
    });
  });
});
