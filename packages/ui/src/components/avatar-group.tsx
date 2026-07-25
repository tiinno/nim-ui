import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';
import { avatarVariants, type AvatarProps } from './avatar';

/**
 * AvatarGroup component for stacked collaborator and assignee avatars
 *
 * Collapses a list of Avatar children into one overlapping row with a quiet
 * `+N` overflow chip. Reach for it in DataTable assignee columns and
 * RecordInspector collaborator rows, where listing every name would blow the
 * row height. Avatar renders one person; AvatarGroup renders the shape of a
 * team in a single cell.
 *
 * Sizing reuses Avatar's own `sm | md | lg | xl` scale and is forwarded to any
 * child that did not set its own `size`, so the overflow chip always shares the
 * avatars' diameter.
 *
 * Stacking follows DOM order: each avatar overlaps the one before it and the
 * overflow chip sits on top at the end. DOM order therefore stays identical to
 * reading order for assistive technology.
 *
 * @example
 * // Assignees in a dense table cell
 * <AvatarGroup size="sm" label="Assignees">
 *   <Avatar><AvatarFallback>JD</AvatarFallback></Avatar>
 *   <Avatar><AvatarFallback>AM</AvatarFallback></Avatar>
 *   <Avatar><AvatarFallback>RK</AvatarFallback></Avatar>
 * </AvatarGroup>
 *
 * @example
 * // Only four avatars fetched out of 37 collaborators
 * <AvatarGroup max={4} total={37} label="Collaborators">
 *   {people.map((p) => (
 *     <Avatar key={p.id}>
 *       <AvatarImage src={p.avatarUrl} alt={p.name} />
 *       <AvatarFallback>{p.initials}</AvatarFallback>
 *     </Avatar>
 *   ))}
 * </AvatarGroup>
 *
 * @example
 * // Tighter overlap for a wide reviewer row
 * <AvatarGroup spacing="tight" size="lg" label="Reviewers">
 *   <Avatar><AvatarFallback>SB</AvatarFallback></Avatar>
 *   <Avatar><AvatarFallback>TL</AvatarFallback></Avatar>
 * </AvatarGroup>
 */

const avatarGroupVariants = cva('inline-flex items-center', {
  variants: {
    spacing: {
      tight: '-space-x-3',
      normal: '-space-x-2',
    },
  },
  defaultVariants: {
    spacing: 'normal',
  },
});

const avatarGroupOverflowVariants = cva(
  'items-center justify-center bg-neutral-100 font-medium tabular-nums text-neutral-600 ring-2 ring-white dark:bg-neutral-800 dark:text-neutral-400 dark:ring-neutral-950',
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-xs',
        lg: 'text-sm',
        xl: 'text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface AvatarGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarGroupVariants> {
  /** Avatar elements to stack; non-element children (strings, null, false) are ignored */
  children?: React.ReactNode;
  /** How many avatars to render before the rest collapse into the +N chip */
  max?: number;
  /**
   * True population size when only a slice was rendered (e.g. 4 avatars of 37
   * collaborators). Treated as a floor: a `total` below the number of children
   * passed is clamped up to that count, so a stale value never hides people.
   */
  total?: number;
  /** Diameter forwarded to Avatar children that did not set their own size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Accessible name for the group */
  label?: string;
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  (
    { className, children, max = 4, total, size = 'md', spacing, label, ...props },
    ref
  ) => {
    const items = React.Children.toArray(children).filter(
      (child): child is React.ReactElement<AvatarProps> =>
        React.isValidElement<AvatarProps>(child)
    );

    // max={0} renders no avatars and folds everyone into the chip.
    const limit = Number.isFinite(max) ? Math.max(0, Math.floor(max)) : items.length;
    const visible = items.slice(0, limit);

    // `total` is a floor, not an authority: it can only ever add people the
    // caller never rendered. Clamping it to the child count keeps a stale or
    // filtered `total` from suppressing the chip while `max` truncates the
    // stack — the chip is the only signal that anyone was hidden.
    const population =
      typeof total === 'number' && Number.isFinite(total)
        ? Math.max(items.length, Math.floor(total))
        : items.length;
    const overflow = Math.max(0, population - visible.length);

    return (
      <div
        ref={ref}
        role="group"
        aria-label={label}
        className={cn(avatarGroupVariants({ spacing }), className)}
        {...props}
      >
        {visible.map((child) =>
          React.cloneElement(child, {
            size: child.props.size ?? size,
            className: cn('ring-2 ring-white dark:ring-neutral-950', child.props.className),
          })
        )}
        {overflow > 0 && (
          <span
            data-testid="avatar-group-overflow"
            className={cn(
              avatarVariants({ size }),
              avatarGroupOverflowVariants({ size })
            )}
          >
            +{overflow}
          </span>
        )}
      </div>
    );
  }
);
AvatarGroup.displayName = 'AvatarGroup';

export { AvatarGroup, avatarGroupVariants, avatarGroupOverflowVariants };
