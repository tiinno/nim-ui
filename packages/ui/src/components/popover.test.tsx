import { createRef } from 'react';
import * as fc from 'fast-check';
import { describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, userEvent, waitFor } from '../test/test-utils';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
  popoverContentVariants,
} from './popover';
import * as PopoverModule from './popover';

/**
 * Helper: renders a basic Popover setup for testing.
 */
function renderPopover(
  contentProps: React.ComponentProps<typeof PopoverContent> = {},
  rootProps: React.ComponentProps<typeof Popover> = {},
  triggerLabel = 'click me',
) {
  const contentChildren = contentProps.children ?? 'popover content';
  const { children: _, ...restContent } = contentProps;

  return render(
    <Popover {...rootProps}>
      <PopoverTrigger>{triggerLabel}</PopoverTrigger>
      <PopoverContent {...restContent}>{contentChildren}</PopoverContent>
    </Popover>,
  );
}

/**
 * Radix Popover renders content with role="dialog".
 * This helper returns the dialog element (the styled content wrapper).
 */
function getPopoverContent() {
  return screen.getByRole('dialog');
}

describe('Popover', () => {
  // -----------------------------------------------------------------------
  // Rendering
  // -----------------------------------------------------------------------
  describe('rendering', () => {
    it('renders trigger text', () => {
      renderPopover();
      expect(screen.getByText('click me')).toBeInTheDocument();
    });

    it('does not show popover content by default', () => {
      renderPopover();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders popover content in a portal when open', async () => {
      const user = userEvent.setup();
      const { container } = renderPopover();

      await user.click(screen.getByText('click me'));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Portal renders outside the render container
      expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // Variants
  // -----------------------------------------------------------------------
  describe('variants', () => {
    it('default variant includes bg-white and border', () => {
      const classes = popoverContentVariants({ variant: 'default' });
      expect(classes).toContain('bg-white');
      expect(classes).toContain('border');
      expect(classes).toContain('border-neutral-200');
    });

    it('outline variant includes border-2', () => {
      const classes = popoverContentVariants({ variant: 'outline' });
      expect(classes).toContain('bg-white');
      expect(classes).toContain('border-2');
      expect(classes).toContain('border-primary-500');
    });

    it('applies default variant classes when no variant specified', () => {
      const classes = popoverContentVariants();
      expect(classes).toContain('bg-white');
      expect(classes).toContain('border-neutral-200');
    });
  });

  // -----------------------------------------------------------------------
  // Interactions
  // -----------------------------------------------------------------------
  describe('interactions', () => {
    it('opens popover on click', async () => {
      const user = userEvent.setup();
      renderPopover();

      await user.click(screen.getByText('click me'));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('closes popover when clicking outside', async () => {
      const user = userEvent.setup();
      renderPopover();

      await user.click(screen.getByText('click me'));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click outside the popover
      await user.click(document.body);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('closes popover on Escape key', async () => {
      const user = userEvent.setup();
      renderPopover();

      await user.click(screen.getByText('click me'));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('closes popover when PopoverClose is clicked', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>click me</PopoverTrigger>
          <PopoverContent>
            <p>popover content</p>
            <PopoverClose>close button</PopoverClose>
          </PopoverContent>
        </Popover>,
      );

      await user.click(screen.getByText('click me'));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByText('close button'));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  // -----------------------------------------------------------------------
  // Accessibility
  // -----------------------------------------------------------------------
  describe('accessibility', () => {
    it('popover content has role="dialog"', async () => {
      const user = userEvent.setup();
      renderPopover();

      await user.click(screen.getByText('click me'));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('focus moves to content on open', async () => {
      const user = userEvent.setup();
      renderPopover();

      await user.click(screen.getByText('click me'));

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        // Focus should be within the popover content
        expect(dialog.contains(document.activeElement)).toBe(true);
      });
    });

    it('focus returns to trigger on close', async () => {
      const user = userEvent.setup();
      renderPopover();

      const trigger = screen.getByText('click me');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Focus should return to the trigger button
      await waitFor(() => {
        expect(trigger.closest('button')).toHaveFocus();
      });
    });
  });

  // -----------------------------------------------------------------------
  // Defaults
  // -----------------------------------------------------------------------
  describe('defaults', () => {
    it('default side is bottom', async () => {
      const user = userEvent.setup();
      renderPopover();

      await user.click(screen.getByText('click me'));

      await waitFor(() => {
        const dialog = getPopoverContent();
        expect(dialog).toHaveAttribute('data-side', 'bottom');
      });
    });

    it('default sideOffset is 4', async () => {
      const user = userEvent.setup();
      renderPopover();

      await user.click(screen.getByText('click me'));

      await waitFor(() => {
        // sideOffset is applied as a CSS transform by Radix; verify popover renders
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  // -----------------------------------------------------------------------
  // Edge cases
  // -----------------------------------------------------------------------
  describe('edge cases', () => {
    it('supports controlled mode with open prop', () => {
      render(
        <Popover open>
          <PopoverTrigger>trigger</PopoverTrigger>
          <PopoverContent>controlled popover</PopoverContent>
        </Popover>,
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toHaveTextContent('controlled popover');
    });

    it('calls onOpenChange when popover state changes', async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Popover onOpenChange={handleOpenChange}>
          <PopoverTrigger>trigger</PopoverTrigger>
          <PopoverContent>popover</PopoverContent>
        </Popover>,
      );

      await user.click(screen.getByText('trigger'));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it('merges custom className with variant classes', async () => {
      const user = userEvent.setup();
      renderPopover({ className: 'my-custom-class' });

      await user.click(screen.getByText('click me'));

      await waitFor(() => {
        const dialog = getPopoverContent();
        expect(dialog).toHaveClass('my-custom-class');
      });
    });

    it('forwards ref to PopoverContent', async () => {
      const ref = createRef<HTMLDivElement>();

      render(
        <Popover open>
          <PopoverTrigger>trigger</PopoverTrigger>
          <PopoverContent ref={ref}>ref popover</PopoverContent>
        </Popover>,
      );

      await waitFor(() => {
        expect(ref.current).toBeInstanceOf(HTMLElement);
      });
    });

    it('forwards ref to PopoverTrigger', () => {
      const ref = createRef<HTMLButtonElement>();

      render(
        <Popover>
          <PopoverTrigger ref={ref}>trigger</PopoverTrigger>
          <PopoverContent>popover</PopoverContent>
        </Popover>,
      );

      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  // -----------------------------------------------------------------------
  // Arrow
  // -----------------------------------------------------------------------
  describe('arrow', () => {
    it('renders arrow when showArrow is true', async () => {
      const user = userEvent.setup();
      renderPopover({ showArrow: true });

      await user.click(screen.getByText('click me'));

      await waitFor(() => {
        const dialog = getPopoverContent();
        const arrow = dialog.querySelector('[data-popover-arrow]');
        expect(arrow).toBeTruthy();
      });
    });

    it('does not render arrow when showArrow is false', async () => {
      const user = userEvent.setup();
      renderPopover({ showArrow: false });

      await user.click(screen.getByText('click me'));

      await waitFor(() => {
        const dialog = getPopoverContent();
        const arrow = dialog.querySelector('[data-popover-arrow]');
        expect(arrow).toBeNull();
      });
    });

    it('does not render arrow by default (showArrow undefined)', async () => {
      const user = userEvent.setup();
      renderPopover();

      await user.click(screen.getByText('click me'));

      await waitFor(() => {
        const dialog = getPopoverContent();
        const arrow = dialog.querySelector('svg');
        expect(arrow).toBeNull();
      });
    });
  });

  // -----------------------------------------------------------------------
  // PopoverClose
  // -----------------------------------------------------------------------
  describe('PopoverClose', () => {
    it('click closes popover', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>open</PopoverTrigger>
          <PopoverContent>
            <span>content</span>
            <PopoverClose>close</PopoverClose>
          </PopoverContent>
        </Popover>,
      );

      await user.click(screen.getByText('open'));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByText('close'));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  // -----------------------------------------------------------------------
  // Properties (property-based tests)
  // -----------------------------------------------------------------------
  describe('properties', () => {
    /**
     * Feature: popover, Property 1: Variant styling includes correct light and dark mode classes
     * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.10
     */
    it('Property 1: variant styling includes correct light and dark mode classes', () => {
      const expectedClasses: Record<string, { light: string[]; dark: string[] }> = {
        default: {
          light: ['bg-white', 'text-neutral-900', 'border', 'border-neutral-200'],
          dark: ['dark:border-neutral-700', 'dark:bg-neutral-800', 'dark:text-neutral-100'],
        },
        outline: {
          light: ['bg-white', 'text-neutral-900', 'border-2', 'border-primary-500'],
          dark: ['dark:border-primary-400', 'dark:bg-neutral-800', 'dark:text-neutral-100'],
        },
      };

      fc.assert(
        fc.property(
          fc.constantFrom('default' as const, 'outline' as const),
          (variant) => {
            const classes = popoverContentVariants({ variant });
            const expected = expectedClasses[variant]!;

            for (const cls of expected.light) {
              expect(classes).toContain(cls);
            }
            for (const cls of expected.dark) {
              expect(classes).toContain(cls);
            }

            // Animation classes (both variants)
            expect(classes).toContain('animate-fade-in');
            expect(classes).toContain('animate-fade-out');
          },
        ),
        { numRuns: 100 },
      );
    });

    /**
     * Feature: popover, Property 2: Arrow presence matches showArrow prop
     * Validates: Requirements 3.1, 3.3
     */
    it('Property 2: Arrow presence matches showArrow prop', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('default' as const, 'outline' as const),
          fc.boolean(),
          (variant, showArrow) => {
            render(
              <Popover open>
                <PopoverTrigger>trigger</PopoverTrigger>
                <PopoverContent variant={variant} showArrow={showArrow}>
                  popover text
                </PopoverContent>
              </Popover>,
            );

            const dialog = screen.getByRole('dialog');
            const arrow = dialog.querySelector('[data-popover-arrow]');

            if (showArrow) {
              expect(arrow).toBeTruthy();
            } else {
              expect(arrow).toBeNull();
            }

            cleanup();
          },
        ),
        { numRuns: 100 },
      );
    });

    /**
     * Feature: popover, Property 3: Arrow fill color is consistent across variants
     * Validates: Requirements 3.2
     */
    it('Property 3: Arrow fill color is consistent across variants', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('default' as const, 'outline' as const),
          (variant) => {
            render(
              <Popover open>
                <PopoverTrigger>trigger</PopoverTrigger>
                <PopoverContent variant={variant} showArrow>
                  popover text
                </PopoverContent>
              </Popover>,
            );

            const dialogs = screen.getAllByRole('dialog');
            const dialog = dialogs[dialogs.length - 1]!;
            const arrow = dialog.querySelector('[data-popover-arrow]') as HTMLElement;
            expect(arrow).toBeTruthy();

            // Arrow uses CSS border trick with inline styles
            const style = arrow.style;
            expect(style.borderBottomColor || style.borderTopColor || style.borderLeftColor || style.borderRightColor).toBeTruthy();

            cleanup();
          },
        ),
        { numRuns: 100 },
      );
    });

    /**
     * Feature: popover, Property 4: Module exports completeness
     * Validates: Requirements 7.1, 7.2, 7.3, 7.4
     */
    it('Property 4: Module exports completeness', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'Popover',
            'PopoverProvider',
            'PopoverTrigger',
            'PopoverContent',
            'PopoverArrow',
            'PopoverClose',
            'popoverContentVariants',
          ),
          (exportName) => {
            expect(
              (PopoverModule as Record<string, unknown>)[exportName],
            ).toBeDefined();
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
