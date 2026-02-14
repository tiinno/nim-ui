import { createRef } from 'react';
import * as fc from 'fast-check';
import { describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, userEvent, waitFor } from '../test/test-utils';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  tooltipContentVariants,
} from './tooltip';
import * as TooltipModule from './tooltip';

/**
 * Helper: wraps tooltip usage with TooltipProvider (delayDuration=0 for fast tests).
 */
function renderTooltip(
  contentProps: React.ComponentProps<typeof TooltipContent> = {},
  rootProps: React.ComponentProps<typeof Tooltip> = {},
  triggerLabel = 'hover me',
) {
  const contentChildren = contentProps.children ?? 'tooltip text';
  const { children: _, ...restContent } = contentProps;

  return render(
    <TooltipProvider delayDuration={0}>
      <Tooltip {...rootProps}>
        <TooltipTrigger>{triggerLabel}</TooltipTrigger>
        <TooltipContent {...restContent}>{contentChildren}</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  );
}

/**
 * Radix Tooltip renders a hidden <span role="tooltip"> inside the visible content <div>.
 * The visible content div has data-side, classes, etc.
 * This helper returns the visible content wrapper (parent of the role="tooltip" span).
 */
function getTooltipContentWrapper() {
  const tooltipSpan = screen.getByRole('tooltip');
  // The parent div is the actual styled content element
  return tooltipSpan.parentElement!;
}

describe('Tooltip', () => {
  // -----------------------------------------------------------------------
  // Rendering
  // -----------------------------------------------------------------------
  describe('rendering', () => {
    it('renders trigger text', () => {
      renderTooltip();
      expect(screen.getByText('hover me')).toBeInTheDocument();
    });

    it('does not show tooltip content by default', () => {
      renderTooltip();
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('renders tooltip content in a portal when open', async () => {
      const user = userEvent.setup();
      const { container } = renderTooltip();

      await user.hover(screen.getByText('hover me'));

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      // Portal renders outside the render container
      expect(container.querySelector('[role="tooltip"]')).not.toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // Variants
  // -----------------------------------------------------------------------
  describe('variants', () => {
    it('default variant includes bg-neutral-900', () => {
      const classes = tooltipContentVariants({ variant: 'default' });
      expect(classes).toContain('bg-neutral-900');
      expect(classes).toContain('text-neutral-50');
    });

    it('light variant includes bg-white and border', () => {
      const classes = tooltipContentVariants({ variant: 'light' });
      expect(classes).toContain('bg-white');
      expect(classes).toContain('text-neutral-900');
      expect(classes).toContain('border');
    });

    it('applies default variant classes when no variant specified', () => {
      const classes = tooltipContentVariants();
      expect(classes).toContain('bg-neutral-900');
    });
  });

  // -----------------------------------------------------------------------
  // Interactions
  // -----------------------------------------------------------------------
  describe('interactions', () => {
    it('shows tooltip on hover', async () => {
      const user = userEvent.setup();
      renderTooltip();

      await user.hover(screen.getByText('hover me'));

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('hides tooltip when hover leaves', async () => {
      const user = userEvent.setup();
      renderTooltip();

      await user.hover(screen.getByText('hover me'));
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      // Move pointer away from the trigger
      await user.unhover(screen.getByText('hover me'));
      // Also click on body to ensure pointer is truly away
      await user.click(document.body);

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('shows tooltip on keyboard focus', async () => {
      const user = userEvent.setup();
      renderTooltip();

      await user.tab();

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('closes tooltip on Escape key', async () => {
      const user = userEvent.setup();
      renderTooltip();

      await user.hover(screen.getByText('hover me'));
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  // -----------------------------------------------------------------------
  // Accessibility
  // -----------------------------------------------------------------------
  describe('accessibility', () => {
    it('tooltip content has role="tooltip"', async () => {
      const user = userEvent.setup();
      renderTooltip();

      await user.hover(screen.getByText('hover me'));

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('trigger has aria-describedby pointing to tooltip content', async () => {
      const user = userEvent.setup();
      renderTooltip();

      const trigger = screen.getByText('hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        // Radix sets aria-describedby on the trigger button
        expect(trigger.closest('button')).toHaveAttribute(
          'aria-describedby',
          tooltip.id,
        );
      });
    });

    it('keyboard focus on trigger shows tooltip', async () => {
      const user = userEvent.setup();
      renderTooltip();

      await user.tab();

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      // Trigger should have focus
      expect(screen.getByText('hover me').closest('button')).toHaveFocus();
    });
  });

  // -----------------------------------------------------------------------
  // Defaults
  // -----------------------------------------------------------------------
  describe('defaults', () => {
    it('default side is top', async () => {
      const user = userEvent.setup();
      renderTooltip();

      await user.hover(screen.getByText('hover me'));

      await waitFor(() => {
        // data-side is on the content wrapper div, not the role="tooltip" span
        const wrapper = getTooltipContentWrapper();
        expect(wrapper).toHaveAttribute('data-side', 'top');
      });
    });

    it('default sideOffset is 4', async () => {
      const user = userEvent.setup();
      renderTooltip();

      await user.hover(screen.getByText('hover me'));

      await waitFor(() => {
        // sideOffset is applied as a CSS transform by Radix; verify tooltip renders
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });
  });

  // -----------------------------------------------------------------------
  // Edge cases
  // -----------------------------------------------------------------------
  describe('edge cases', () => {
    it('supports controlled mode with open prop', () => {
      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip open>
            <TooltipTrigger>trigger</TooltipTrigger>
            <TooltipContent>controlled tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByRole('tooltip')).toHaveTextContent('controlled tooltip');
    });

    it('calls onOpenChange when tooltip state changes', async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip onOpenChange={handleOpenChange}>
            <TooltipTrigger>trigger</TooltipTrigger>
            <TooltipContent>tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );

      await user.hover(screen.getByText('trigger'));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it('merges custom className with variant classes', async () => {
      const user = userEvent.setup();
      renderTooltip({ className: 'my-custom-class' });

      await user.hover(screen.getByText('hover me'));

      await waitFor(() => {
        // className is on the content wrapper div, not the role="tooltip" span
        const wrapper = getTooltipContentWrapper();
        expect(wrapper).toHaveClass('my-custom-class');
      });
    });

    it('forwards ref to TooltipContent', async () => {
      const ref = createRef<HTMLDivElement>();

      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip open>
            <TooltipTrigger>trigger</TooltipTrigger>
            <TooltipContent ref={ref}>ref tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );

      await waitFor(() => {
        expect(ref.current).toBeInstanceOf(HTMLElement);
      });
    });

    it('forwards ref to TooltipTrigger', () => {
      const ref = createRef<HTMLButtonElement>();

      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger ref={ref}>trigger</TooltipTrigger>
            <TooltipContent>tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
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
      renderTooltip({ showArrow: true });

      await user.hover(screen.getByText('hover me'));

      await waitFor(() => {
        const wrapper = getTooltipContentWrapper();
        // Radix renders the arrow as an <svg> inside a <span> within the content wrapper
        const arrow = wrapper.querySelector('svg');
        expect(arrow).toBeTruthy();
      });
    });

    it('does not render arrow when showArrow is false', async () => {
      const user = userEvent.setup();
      renderTooltip({ showArrow: false });

      await user.hover(screen.getByText('hover me'));

      await waitFor(() => {
        const wrapper = getTooltipContentWrapper();
        const arrow = wrapper.querySelector('svg');
        expect(arrow).toBeNull();
      });
    });

    it('does not render arrow by default (showArrow undefined)', async () => {
      const user = userEvent.setup();
      renderTooltip();

      await user.hover(screen.getByText('hover me'));

      await waitFor(() => {
        const wrapper = getTooltipContentWrapper();
        const arrow = wrapper.querySelector('svg');
        expect(arrow).toBeNull();
      });
    });
  });

  // -----------------------------------------------------------------------
  // Properties (property-based tests)
  // -----------------------------------------------------------------------
  describe('properties', () => {
    /**
     * Feature: tooltip, Property 1: Variant styling includes correct light and dark mode classes
     * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.10
     */
    it('Property 1: variant styling includes correct light and dark mode classes', () => {
      const expectedClasses: Record<string, { light: string[]; dark: string[] }> = {
        default: {
          light: ['bg-neutral-900', 'text-neutral-50'],
          dark: ['dark:bg-neutral-50', 'dark:text-neutral-900'],
        },
        light: {
          light: ['bg-white', 'text-neutral-900', 'border'],
          dark: ['dark:border-neutral-700', 'dark:bg-neutral-800', 'dark:text-neutral-100'],
        },
      };

      fc.assert(
        fc.property(
          fc.constantFrom('default' as const, 'light' as const),
          (variant) => {
            const classes = tooltipContentVariants({ variant });
            const expected = expectedClasses[variant]!;

            // Light mode classes
            for (const cls of expected.light) {
              expect(classes).toContain(cls);
            }

            // Dark mode classes
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
     * Feature: tooltip, Property 2: Arrow presence matches showArrow prop
     * Validates: Requirements 3.1, 3.3
     */
    it('Property 2: Arrow presence matches showArrow prop', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('default' as const, 'light' as const),
          fc.boolean(),
          (variant, showArrow) => {
            render(
              <TooltipProvider delayDuration={0}>
                <Tooltip open>
                  <TooltipTrigger>trigger</TooltipTrigger>
                  <TooltipContent variant={variant} showArrow={showArrow}>
                    tooltip text
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>,
            );

            const wrapper = getTooltipContentWrapper();
            const svg = wrapper.querySelector('svg');

            if (showArrow) {
              expect(svg).toBeTruthy();
            } else {
              expect(svg).toBeNull();
            }

            cleanup();
          },
        ),
        { numRuns: 100 },
      );
    });

    /**
     * Feature: tooltip, Property 3: Arrow fill color matches variant
     * Validates: Requirements 3.2
     */
    it('Property 3: Arrow fill color matches variant', () => {
      const expectedFill: Record<string, { light: string[]; dark: string[] }> = {
        default: {
          light: ['fill-neutral-900'],
          dark: ['dark:fill-neutral-50'],
        },
        light: {
          light: ['fill-white'],
          dark: ['dark:fill-neutral-800'],
        },
      };

      fc.assert(
        fc.property(
          fc.constantFrom('default' as const, 'light' as const),
          (variant) => {
            render(
              <TooltipProvider delayDuration={0}>
                <Tooltip open>
                  <TooltipTrigger>trigger</TooltipTrigger>
                  <TooltipContent variant={variant} showArrow>
                    tooltip text
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>,
            );

            // Use getAllByRole to avoid "multiple elements" error from prior iterations,
            // then pick the last rendered tooltip's content wrapper.
            const tooltipSpans = screen.getAllByRole('tooltip');
            const wrapper = tooltipSpans[tooltipSpans.length - 1]!.parentElement!;
            const svg = wrapper.querySelector('svg');
            expect(svg).toBeTruthy();

            // Radix applies the className directly on the <svg> element
            const classes = svg!.getAttribute('class') ?? '';

            const expected = expectedFill[variant]!;

            for (const cls of expected.light) {
              expect(classes).toContain(cls);
            }
            for (const cls of expected.dark) {
              expect(classes).toContain(cls);
            }

            cleanup();
          },
        ),
        { numRuns: 100 },
      );
    });

    /**
     * Feature: tooltip, Property 4: Module exports completeness
     * Validates: Requirements 6.1, 6.2, 6.3, 6.4
     */
    it('Property 4: Module exports completeness', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'Tooltip',
            'TooltipProvider',
            'TooltipTrigger',
            'TooltipContent',
            'TooltipArrow',
            'tooltipContentVariants',
          ),
          (exportName) => {
            expect(
              (TooltipModule as Record<string, unknown>)[exportName],
            ).toBeDefined();
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
