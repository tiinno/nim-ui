import * as React from 'react';
import { cn } from '../lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Skeleton — a pulsing placeholder for content that is loading.
 *
 * The placeholder is `aria-hidden` by default: it carries no information a
 * screen-reader user can act on, and surfaces render 2–5 of them at once, so
 * leaving them exposed just floods the accessibility tree with anonymous boxes.
 * The *announcement* belongs to the surface, not to the placeholder — wrap the
 * region in `SkeletonGroup` (WCAG 2.2 SC 4.1.3 Status Messages).
 *
 * **Never put focusable content inside a Skeleton.** `aria-hidden` on a
 * focusable element's ancestor is the axe `aria-hidden-focus` violation and a
 * real keyboard trap: the element still takes tab focus, but assistive tech is
 * told it does not exist, so the user lands on nothing. Skeletons are inert
 * shapes — render the real control instead, or render nothing.
 *
 * @example
 * // Text placeholder
 * <Skeleton className="h-4 w-48" />
 *
 * @example
 * // Card placeholder — layout lives on the container, not on Skeleton
 * <div className="space-y-3">
 *   <Skeleton className="h-40 w-full" />
 *   <Skeleton className="h-4 w-3/4" />
 * </div>
 *
 * @example
 * // Escape hatch — `aria-hidden` is a default, not the contract, so it can be
 * // overridden (it is applied before the prop spread, unlike Button's aria-busy)
 * <Skeleton aria-hidden={false} />
 */
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800',
        className
      )}
      // BEFORE the spread, deliberately — the opposite of Button's `aria-busy`,
      // which sits after it because there `loading` IS the semantic contract.
      // Here hiding the placeholder is only a sensible default, so a consumer
      // must be able to opt out: React overwrites a key only when it is
      // actually present in the spread, so `<Skeleton aria-hidden={false} />`
      // wins and anything else keeps the default.
      aria-hidden="true"
      {...props}
    />
  )
);
Skeleton.displayName = 'Skeleton';

export interface SkeletonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the surface is still loading. Required, so the state is always wired. */
  loading: boolean;
  /** The skeletons shown while `loading`. */
  fallback: React.ReactNode;
  /**
   * Live-region text announced while loading.
   *
   * Defaults to `'Loading'`, matching `spinner.tsx`. The `Button.loadingLabel`
   * precedent (which defaults to `undefined`) deliberately does **not** transfer:
   * that one had to be opt-in because its `sr-only` span sits *inside* the
   * `<button>` and joins its accessible name (name-from-content), renaming
   * "Save" to "Loading Save". This span contributes to no element's accessible
   * name, so a default costs nothing.
   *
   * @default 'Loading'
   */
  label?: string;
  /**
   * Live-region text after loading finishes.
   *
   * Left `undefined` (renders `''`) on purpose: a dashboard that refetches would
   * announce "Loaded" on every poll, which is noise. Note that swapping text to
   * `''` does **not** reliably announce anything, so the default is deliberately
   * *silent* rather than a broken announcement — set it only when the completion
   * genuinely needs to be spoken.
   *
   * @default undefined
   */
  loadedLabel?: string;
}

/**
 * SkeletonGroup — the loading *surface*, which is what owns the status message.
 *
 * `Skeleton` itself must never be `role="status"`: every real surface renders
 * 2–5 of them, which would mint 3–5 competing live regions per load. So the
 * region belongs to the container, exactly as `spinner.tsx` splits
 * `role="status"` wrapper from `aria-hidden` artwork.
 *
 * Four things about this shape are load-bearing. Please do not "simplify" them:
 *
 * 1. **The live region is a *sibling* of the `aria-busy` host, never a
 *    descendant.** `aria-busy` tells assistive tech to *defer* announcements for
 *    the subtree it is on — that is, for exactly the window we are trying to
 *    announce in. Collapsing the two onto one element is the specific regression
 *    this shape exists to prevent.
 * 2. **Use `fallback` + `children`, not `{loading && <SkeletonGroup … />}`.** The
 *    region has to be mounted and *empty* before the text arrives; a wrapper that
 *    unmounts with the skeletons puts you back to a region inserted together with
 *    its content, which screen readers handle inconsistently.
 * 3. **`label` defaults to `'Loading'`** — safe here, unlike `Button.loadingLabel`;
 *    see that prop's note.
 * 4. **`loadedLabel` defaults to `undefined`** so a refetching dashboard stays
 *    quiet; see that prop's note.
 *
 * One thing the component cannot defend against: `{...props}` lands on the
 * **root**, so a consumer passing `aria-busy` or `role` through it puts that
 * attribute on the region's own ancestor — which is exactly the deferral trap
 * point 1 avoids. TypeScript permits both (they are valid `HTMLAttributes`) and
 * there is no runtime way to stop it, so it is documented rather than blocked:
 * put loading semantics on the group's props, never around them.
 *
 * Known limitation: on *initial* mount the region already contains its text, so
 * most screen readers will not fire a live announcement for it. The `sr-only`
 * text is still in the accessibility tree and discoverable in browse mode, and
 * SC 4.1.3's live case is the *transition* — which this shape does handle.
 *
 * Ships no layout classes of its own; put `space-y-*` / `flex` on the markup
 * inside `fallback` and `children`.
 *
 * @example
 * // The region stays mounted across the transition — that is the whole point
 * <SkeletonGroup
 *   loading={isLoading}
 *   fallback={
 *     <div className="space-y-2">
 *       <Skeleton className="h-4 w-40" />
 *       <Skeleton className="h-3 w-28" />
 *     </div>
 *   }
 * >
 *   <p>{user.name}</p>
 * </SkeletonGroup>
 *
 * @example
 * // Announce completion too, for a one-shot load worth confirming
 * <SkeletonGroup loading={isLoading} label="Loading orders" loadedLabel="Orders loaded" fallback={<Skeleton className="h-40 w-full" />}>
 *   <OrdersTable rows={rows} />
 * </SkeletonGroup>
 */
const SkeletonGroup = React.forwardRef<HTMLDivElement, SkeletonGroupProps>(
  (
    { className, loading, fallback, label = 'Loading', loadedLabel, children, ...props },
    ref
  ) => (
    <div ref={ref} className={className} {...props}>
      <span role="status" className="sr-only">
        {loading ? label : (loadedLabel ?? '')}
      </span>
      <div aria-busy={loading || undefined}>{loading ? fallback : children}</div>
    </div>
  )
);
SkeletonGroup.displayName = 'SkeletonGroup';

export { Skeleton, SkeletonGroup };
