import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Card component with header, content, and footer sections
 *
 * @example
 * // Basic card
 * <Card>
 *   <CardContent>Card content here</CardContent>
 * </Card>
 *
 * @example
 * // Full card with all sections
 * <Card>
 *   <CardHeader>
 *     <h3>Card Title</h3>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Card content goes here</p>
 *   </CardContent>
 *   <CardFooter>
 *     <button>Action</button>
 *   </CardFooter>
 * </Card>
 *
 * @example
 * // A card that is a navigation target: the link owns the role and the name,
 * // and its overlay makes the whole card clickable.
 * <Card hoverable>
 *   <CardHeader>
 *     <h3><CardLink href="/orders/1042">Order #1042</CardLink></h3>
 *   </CardHeader>
 *   <CardContent>Awaiting fulfilment</CardContent>
 * </Card>
 */

/*
 * Two things about the property list below are deliberate (NIMUI-48).
 *
 * 1. It names `translate`, not `transform`. The hoverable variant lifts the card
 *    with a negative vertical translate utility, and Tailwind v4 compiles that to
 *    the INDEPENDENT `translate` property — it stopped writing the combined
 *    `transform` one that v3 used. A list carried over from v3 therefore named a
 *    property nothing on this element ever set, so the browser had nothing to
 *    interpolate and the lift snapped, for everyone, for as long as the class
 *    existed. Tailwind's own named transform transition dodges this by
 *    enumerating all four transform-family properties; a hand-written list gets
 *    no such expansion. `src/transition-property.test.ts` now fails on this class
 *    of mistake — read the compiled rule in `dist/styles.css` before editing the
 *    list, do not reason from the utility name.
 *
 * 2. The reduced-motion counterpart is NARROWED rather than switching the whole
 *    list off. It re-declares only the colour and shadow properties, so the lift
 *    is suppressed while the depth crossfade still runs. That is what the kit's
 *    policy already says elsewhere: `src/motion-reduce.test.ts` classifies colour
 *    and `box-shadow` as non-motion and leaves them undamped at every other site,
 *    because a crossfade is not a vestibular trigger. Switching the whole list
 *    off here would have contradicted that — it was only ever doing so because
 *    the lift it was written to suppress never ran.
 */
/*
 * NIMUI-50 split the pointer AFFORDANCE from the TARGET.
 *
 * `hoverable` used to carry a pointer cursor as well as the lift, which told a
 * mouse user the card was clickable while a keyboard or screen-reader user had
 * nothing to reach — the card is a plain container element and always was. It
 * now ships an honest hover RESPONSE (a lift and a deeper shadow) and nothing
 * that claims a role it does not have. `product-card.tsx` already shipped that
 * shape.
 *
 * The target is `CardLink` below. Two base classes exist for it:
 *
 * - `relative`, so the link's overlay resolves against the CARD rather than
 *   against whatever ancestor happens to be positioned. Any positioned element
 *   BETWEEN the card and the link shrinks the clickable area to itself.
 * - a `:has()` focus treatment, so keyboard focus on the link draws the
 *   indicator around the whole card instead of around the title text. It is
 *   scoped to the link's own data attribute, not to any focused anchor, or an
 *   incidental link in the body would ring the entire card.
 *
 * The focus treatment deepens the shadow but deliberately does NOT lift: a card
 * that moved under focus would drag the indicator drawn around it.
 *
 * The indicator is the ONE place this component departs from the design
 * contract's spelling, and it was decided on a rendered comparison rather than
 * on principle. The contract's indicator is a ring, which is a box-shadow, and
 * a shadow ring paints its offset band in an opaque colour — white by default.
 * At a control's scale that is a 2px sliver; traced around a whole card in dark
 * mode it is a bright white halo that swamps the steel line inside it (the
 * unfixed defect `focus-ring-contrast.test.ts` records for the kit at large).
 * The same two classes drawn with outline-width and outline-color instead leave
 * a TRANSPARENT gap, so the page shows through and the indicator reads as one
 * steel line in both themes. It also follows the corner radius on its own, and
 * it is not a box-shadow — so unlike a ring it does not inherit the fade from
 * the box-shadow entry in the transition list below and appears at once, which
 * is what a focus indicator should do. Colour is still the mandated pair, and
 * `src/focus-ring-contrast.test.ts` measures it like every other indicator.
 */
const cardVariants = cva(
  'relative rounded-md transition-[box-shadow,translate,border-color,background-color] motion-reduce:transition-[box-shadow,border-color,background-color] duration-(--duration-fast) ease-out has-[[data-card-link]:focus-visible]:outline-2 has-[[data-card-link]:focus-visible]:outline-offset-2 has-[[data-card-link]:focus-visible]:outline-primary-500 dark:has-[[data-card-link]:focus-visible]:outline-primary-400 has-[[data-card-link]:focus-visible]:shadow-panel',
  {
    variants: {
      variant: {
        default: 'border border-neutral-200 bg-white shadow-soft dark:border-neutral-800 dark:bg-neutral-950',
        outlined: 'border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950',
        elevated: 'border border-neutral-100 bg-white shadow-panel dark:border-neutral-900 dark:bg-neutral-950',
        ghost: 'border border-transparent bg-transparent',
      },
      hoverable: {
        true: 'hover:-translate-y-0.5 hover:shadow-panel',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      hoverable: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hoverable, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, hoverable }), className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-5 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

/**
 * The card's navigation target: a real anchor whose generated box covers the
 * whole card, so a pointer can click anywhere while the keyboard, the screen
 * reader and the browser's own link handling see one ordinary link.
 *
 * The card is never the control — the link inside it is. So the card is not a
 * tab stop, tab order stays document order, and a nested button keeps its own
 * role and name.
 *
 * **Every interactive element inside the card needs a stacking context above the
 * overlay** — position it and give it a positive stack level — or the overlay
 * swallows its click. That is deliberately per-control: putting it on
 * `CardHeader` or `CardFooter` would raise the whole box, and clicking empty
 * space in that box would then stop reaching the link.
 *
 * Known limitation: the overlay also swallows drag-selection across the card
 * body. Reach for `CardLink` when the card is primarily a navigation target; if
 * copying text out of it matters more, put a plain `Link` on the title instead.
 *
 * `Card` must stay the nearest positioned ancestor, which its base class
 * provides. Anything positioned in between shrinks the clickable area to itself.
 *
 * @example
 * // A whole tile that navigates
 * <Card hoverable>
 *   <CardHeader>
 *     <h3><CardLink href="/customers/acme">Acme Corporation</CardLink></h3>
 *   </CardHeader>
 *   <CardContent>14 open invoices</CardContent>
 * </Card>
 *
 * @example
 * // A control inside the card, kept above the overlay
 * <Card hoverable>
 *   <CardHeader>
 *     <h3><CardLink href="/customers/acme">Acme Corporation</CardLink></h3>
 *   </CardHeader>
 *   <CardFooter>
 *     <Button className="relative z-10" size="sm">Export</Button>
 *   </CardFooter>
 * </Card>
 *
 * @example
 * // Compose with a router link, without adding a Slot dependency. Spread the
 * // data attribute alongside — it is what the card's focus treatment keys on.
 * <NextLink href="/queues" data-card-link className={cardLinkVariants()}>All queues</NextLink>
 */
const cardLinkVariants = cva(
  "rounded-sm focus-visible:outline-none after:absolute after:inset-0 after:rounded-md after:content-['']"
);

export interface CardLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof cardLinkVariants> {}

const CardLink = React.forwardRef<HTMLAnchorElement, CardLinkProps>(
  ({ className, ...props }, ref) => (
    <a
      ref={ref}
      data-card-link
      className={cn(cardLinkVariants(), className)}
      {...props}
    />
  )
);
CardLink.displayName = 'CardLink';

export { Card, CardHeader, CardContent, CardFooter, CardLink, cardVariants, cardLinkVariants };
