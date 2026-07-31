import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Button component with multiple variants and sizes
 *
 * @example
 * // Default button
 * <Button>Click me</Button>
 *
 * @example
 * // Button with variant and size
 * <Button variant="outline" size="lg">Large Outline Button</Button>
 *
 * @example
 * // Destructive button
 * <Button variant="destructive">Delete</Button>
 *
 * @example
 * // Loading — stays focusable and aria-busy, but cannot be clicked or submit
 * <Button loading>Save</Button>
 *
 * @example
 * // Opt into sr-only text; it joins the accessible name ("Saving order Save")
 * <Button loading loadingLabel="Saving order">Save</Button>
 */

/**
 * The `aria-disabled:*` utilities mirror the `disabled:*`/`active:*` ones for the
 * `loading` state, which is **not** natively disabled (see the `Button` note) —
 * `aria-disabled` does not trigger `:disabled`, so without them a loading button
 * would lose the dimming and would still animate on press.
 *
 * A `pointer-events-none` counterpart for the aria-disabled case is deliberately
 * absent (and is not spelled out here, because Tailwind scans comments too and
 * would compile a dead rule for it): `pointer-events: none` lets a click meant for
 * the loading button pass *through* to whatever sits underneath it. The
 * aria-disabled case keeps its pointer events and suppresses activation in the
 * click handler instead; `cursor-not-allowed` carries the affordance. None of the
 * three is colour-bearing, so none needs a `dark:` twin.
 *
 * Keeping pointer events has one consequence the variants below must answer:
 * `:hover` still matches on a loading button. So every variant pairs each of its
 * hover colours with an `aria-disabled:hover:*` counterpart that re-applies that
 * variant's own RESTING utility — otherwise the button lightens under the
 * pointer while `cursor-not-allowed` is showing, and the colour says "clickable"
 * while the cursor says the opposite. Each counterpart carries the same `dark:`
 * prefix as the hover class it answers, so both themes are covered.
 *
 * The counterparts RESTORE rather than suppress on purpose. Tailwind's `not-*`
 * variant would read better, but it compiles to `:not(*[aria-disabled="true"])`
 * on the *enabled* hover — (0,3,0) instead of (0,2,0) — which silently outranks
 * `calendar.tsx`'s `[&>button]:hover:*` override of the composed `ghost` variant
 * at (0,2,1), and outranks any consumer `className` hover, which tailwind-merge
 * can no longer de-duplicate once the modifier set differs. Restoring is purely
 * additive: every rule it adds is gated on the attribute, so the enabled path's
 * cascade is untouched. `src/aria-disabled-hover.test.ts` asserts all of this
 * against the compiled stylesheet.
 *
 * The `active:scale-*` press feedback deliberately ships NO reduced-motion
 * counterpart, and that is a decision rather than an oversight. The press is a
 * 2% in-place squeeze, user-initiated, reverting the moment the pointer or key
 * is released, travelling no distance — a control's own affordance, not the
 * large movement or parallax WCAG 2.3.3 is about. It is worth keeping.
 *
 * Note what that decision does NOT rest on. A narrowed counterpart is entirely
 * possible: Tailwind v4 compiles an arbitrary property list under the
 * reduced-motion variant just as readily as it compiles the off switch, so a
 * counterpart listing only `color`, `background-color` and `border-color` would
 * suppress the squeeze and keep the hover crossfade. (Named as bare CSS
 * properties on purpose — Tailwind scans comments, and the utility spelled out
 * here would compile a rule nothing uses.) That option was considered and
 * rejected on the affordance argument above, not because the cascade left no
 * choice. Re-open the decision on those merits if you disagree.
 *
 * `src/motion-reduce.test.ts` pins this exemption alongside the two other
 * press-feedback sites (`cta.tsx`, the toast action button) and fails if a
 * movement-bearing transition is ever added without one.
 *
 * ALL SIX variants take the same focus indicator — the steel 500 step in light
 * mode, the 400 step in dark — and that uniformity is the decision, not an
 * oversight (NIMUI-54, NIMUI-55). `secondary`, `outline` and `ghost` used to
 * take a much lighter step, on the reasoning that a quieter button deserves a
 * quieter focus indicator. Measured on painted pixels that step reached 1.79:1
 * against white and 1.42:1 against the hovered `secondary` surface, well under
 * the 3:1 WCAG 2.2 SC 1.4.11 (AA) asks of a focus indicator: a keyboard user
 * could not see where they were. Visual weight is a property of the RESTING
 * button — its fill, its border, its text colour — and those still differ
 * variant by variant. The focus indicator is transient, it appears on exactly
 * one control at a time, and it is the only thing telling a keyboard user where
 * they are, so it is held to one appearance across the kit.
 *
 * `destructive` used to be the exception, tinting its indicator to the danger
 * hue on the reasoning that the tint was semantic rather than a reduction in
 * weight. NIMUI-55 ruled against it on three grounds. The tint failed the same
 * contrast bar the quiet variants failed — the error 400 step measures 2.90:1
 * on the 50 surface and 2.77:1 on the 100 surface, painted. It carried no
 * information: the danger of the action is already stated by the fill, the
 * label and whatever confirmation the app puts in front of it, and colour alone
 * reaches no assistive technology anyway. And a danger-hue ring drawn a couple
 * of pixels outside a danger-hue fill separates "focused" from "dangerous"
 * worse than a steel ring does, not better. Focus is one appearance kit-wide;
 * semantics belong to the control, not to the indicator that finds it.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium shadow-control transition-all duration-(--duration-fast) active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:active:scale-100',
  {
    variants: {
      variant: {
        primary: 'bg-neutral-950 text-white hover:bg-neutral-800 aria-disabled:hover:bg-neutral-950 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white dark:aria-disabled:hover:bg-neutral-100',
        default: 'bg-neutral-950 text-white hover:bg-neutral-800 aria-disabled:hover:bg-neutral-950 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white dark:aria-disabled:hover:bg-neutral-100',
        secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 aria-disabled:hover:bg-neutral-100 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 dark:aria-disabled:hover:bg-neutral-800',
        outline: 'border border-neutral-200 bg-white/70 text-neutral-900 hover:border-neutral-300 hover:bg-neutral-50 aria-disabled:hover:border-neutral-200 aria-disabled:hover:bg-white/70 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400 dark:border-neutral-800 dark:bg-neutral-950/60 dark:text-neutral-100 dark:hover:border-neutral-700 dark:hover:bg-neutral-900 dark:aria-disabled:hover:border-neutral-800 dark:aria-disabled:hover:bg-neutral-950/60',
        ghost: 'bg-transparent shadow-none text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 aria-disabled:hover:bg-transparent aria-disabled:hover:text-neutral-700 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-neutral-50 dark:aria-disabled:hover:bg-transparent dark:aria-disabled:hover:text-neutral-300',
        destructive: 'bg-error-700 text-white hover:bg-error-800 aria-disabled:hover:bg-error-700 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400 dark:bg-error-300 dark:text-error-950 dark:hover:bg-error-200 dark:aria-disabled:hover:bg-error-300',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-9 px-3.5 text-sm',
        lg: 'h-10 px-4 text-base',
        xl: 'h-11 px-5 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Show the inline spinner and suppress activation, while keeping the button
   * focusable and in the tab order.
   *
   * Use this — **not** `disabled` — for the in-flight state. `disabled` wins when
   * both are set, which puts the button back out of the tab order and undoes the
   * focus guarantee for exactly the users it exists for. So
   * `disabled={isSubmitting || !isValid}` alongside `loading={isSubmitting}` is a
   * bug: write `disabled={!isValid} loading={isSubmitting}`.
   */
  loading?: boolean;
  /**
   * Opt-in screen-reader-only text rendered next to the spinner while `loading`.
   *
   * Left out by default **on purpose**: the span sits inside the button, so it
   * joins the accessible name (name-from-content). A default would silently
   * rename `<Button loading>Save</Button>` from "Save" to "Loading Save" the
   * moment loading flips — breaking `getByRole('button', { name: 'Save' })` and
   * making NVDA/JAWS re-announce the whole button under the user's focus.
   *
   * Pass it when you want that trade; otherwise the loading state is carried by
   * `aria-busy` and `aria-disabled`. A *guaranteed* status announcement
   * (SC 4.1.3) needs a live region **outside** the button — `Button` cannot own
   * one without wrapping itself, so that is the consumer's job.
   *
   * @default undefined
   */
  loadingLabel?: string;
  fullWidth?: boolean;
}

const spinnerSizeMap: Record<string, string> = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
  xl: 'h-6 w-6',
};

/**
 * `loading` is **not** a native `disabled`.
 *
 * A native `disabled` element leaves the tab order, so a keyboard user who
 * activates a button that then flips to `loading` has focus silently dropped to
 * `<body>` — on the exact interaction they just triggered (WCAG 2.2 SC 2.4.3
 * Focus Order), and the `aria-busy` announcement lands on an element they are no
 * longer on. So `loading` marks the button `aria-disabled` and cancels the
 * activation behaviour in the click handler, keeping it focusable.
 *
 * The explicit `disabled` prop is a different, deliberate intent and stays a real
 * native `disabled` — and it **wins over `loading`**, so `disabled={isSubmitting}`
 * (or `disabled={isSubmitting || !isValid}`) reverts this fix for the very users
 * it was written for. Use `loading` alone for the in-flight state.
 *
 * Suppression is scoped to the click activation steps: pointer clicks, Enter and
 * Space (a native <button> synthesises a click for both) and the form submission
 * that follows. Unlike native `disabled`, every other event still dispatches —
 * `pointerdown`, `mousedown`, `keydown`, and capture-phase click listeners — so a
 * `pointerdown`-driven trigger wrapped around a loading Button (Radix opens on
 * `pointerdown`) needs its own guard.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading,
      loadingLabel,
      disabled,
      fullWidth,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (loading) {
        // `preventDefault` cancels the button's activation behaviour — for the
        // default `type="submit"` that is the form submission — and covers the
        // keyboard too, because a native <button> synthesises a click for both
        // Enter and Space. `stopPropagation` stands in for what native
        // `disabled` gives for free: no click event at all, so no ancestor
        // handler fires for a press that did not count.
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      onClick?.(event);
    };

    return (
      <button
        className={cn(buttonVariants({ variant, size }), fullWidth && 'w-full', className)}
        ref={ref}
        disabled={disabled}
        {...props}
        // After the spread, like `onClick`: these two carry the whole semantic
        // contract of the loading state. A consumer `aria-disabled={false}`
        // landing on top would render the button un-dimmed (the
        // `aria-disabled:*` utilities stop matching) and report *enabled* to
        // assistive tech while the handler still swallows every click.
        //
        // The `||` falls through to the consumer's own value when NOT loading,
        // so `<Button aria-disabled>` still works exactly as it did before.
        aria-disabled={loading || props['aria-disabled']}
        aria-busy={loading || props['aria-busy']}
        onClick={handleClick}
      >
        {loading && (
          // Same wrapper shape as `spinner.tsx` (role="status" + aria-hidden
          // artwork), but the sr-only label is opt-in — see `loadingLabel`.
          <span role="status" className="inline-flex items-center">
            <svg
              className={cn('animate-spin -ml-1 mr-2', spinnerSizeMap[size ?? 'md'])}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {loadingLabel !== undefined && <span className="sr-only">{loadingLabel}</span>}
          </span>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
