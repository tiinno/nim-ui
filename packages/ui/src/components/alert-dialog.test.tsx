import { createRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, waitFor } from '../test/test-utils';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  alertDialogContentVariants,
} from './alert-dialog';
import * as AlertDialogModule from './alert-dialog';

/**
 * Helper: renders a basic AlertDialog setup for testing.
 */
function renderAlertDialog(
  contentProps: React.ComponentProps<typeof AlertDialogContent> = {},
  rootProps: React.ComponentProps<typeof AlertDialog> = {},
  triggerLabel = 'open alert',
) {
  return render(
    <AlertDialog {...rootProps}>
      <AlertDialogTrigger>{triggerLabel}</AlertDialogTrigger>
      <AlertDialogContent {...contentProps}>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>,
  );
}

/**
 * Radix AlertDialog renders content with role="alertdialog".
 */
function getAlertDialogContent() {
  return screen.getByRole('alertdialog');
}

describe('AlertDialog', () => {
  // -----------------------------------------------------------------------
  // Rendering
  // -----------------------------------------------------------------------
  describe('rendering', () => {
    it('renders trigger text', () => {
      renderAlertDialog();
      expect(screen.getByText('open alert')).toBeInTheDocument();
    });

    it('does not show alert dialog content by default', () => {
      renderAlertDialog();
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('renders alert dialog content in a portal when open', async () => {
      const user = userEvent.setup();
      const { container } = renderAlertDialog();

      await user.click(screen.getByText('open alert'));

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      // Portal renders outside the render container
      expect(container.querySelector('[role="alertdialog"]')).not.toBeInTheDocument();
    });

    it('renders overlay when open', async () => {
      const user = userEvent.setup();
      renderAlertDialog();

      await user.click(screen.getByText('open alert'));

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      // Overlay should be present (fixed inset-0 element)
      const overlay = document.querySelector('[data-state="open"].fixed');
      expect(overlay).toBeTruthy();
    });
  });

  // -----------------------------------------------------------------------
  // Variants
  // -----------------------------------------------------------------------
  describe('variants', () => {
    it('default variant includes bg-white and border', () => {
      const classes = alertDialogContentVariants({ variant: 'default' });
      expect(classes).toContain('bg-white');
      expect(classes).toContain('border');
      expect(classes).toContain('border-neutral-200');
    });

    it('destructive variant includes border-t-error-500', () => {
      const classes = alertDialogContentVariants({ variant: 'destructive' });
      expect(classes).toContain('bg-white');
      expect(classes).toContain('border-t-error-500');
      expect(classes).toContain('border-t-4');
    });

    it('applies default variant classes when no variant specified', () => {
      const classes = alertDialogContentVariants();
      expect(classes).toContain('bg-white');
      expect(classes).toContain('border-neutral-200');
      expect(classes).not.toContain('border-t-error-500');
    });
  });

  // -----------------------------------------------------------------------
  // Interactions
  // -----------------------------------------------------------------------
  describe('interactions', () => {
    it('opens alert dialog on trigger click', async () => {
      const user = userEvent.setup();
      renderAlertDialog();

      await user.click(screen.getByText('open alert'));

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });
    });

    it('closes alert dialog when Action is clicked', async () => {
      const user = userEvent.setup();
      renderAlertDialog();

      await user.click(screen.getByText('open alert'));
      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Continue'));

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('closes alert dialog when Cancel is clicked', async () => {
      const user = userEvent.setup();
      renderAlertDialog();

      await user.click(screen.getByText('open alert'));
      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Cancel'));

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('closes alert dialog on Escape key', async () => {
      const user = userEvent.setup();
      renderAlertDialog();

      await user.click(screen.getByText('open alert'));
      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });
  });

  // -----------------------------------------------------------------------
  // Accessibility
  // -----------------------------------------------------------------------
  describe('accessibility', () => {
    it('content has role="alertdialog"', async () => {
      const user = userEvent.setup();
      renderAlertDialog();

      await user.click(screen.getByText('open alert'));

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });
    });

    it('has aria-labelledby linked to title', async () => {
      const user = userEvent.setup();
      renderAlertDialog();

      await user.click(screen.getByText('open alert'));

      await waitFor(() => {
        const dialog = getAlertDialogContent();
        const labelledBy = dialog.getAttribute('aria-labelledby');
        expect(labelledBy).toBeTruthy();

        const title = document.getElementById(labelledBy!);
        expect(title).toBeTruthy();
        expect(title!.textContent).toBe('Are you sure?');
      });
    });

    it('has aria-describedby linked to description', async () => {
      const user = userEvent.setup();
      renderAlertDialog();

      await user.click(screen.getByText('open alert'));

      await waitFor(() => {
        const dialog = getAlertDialogContent();
        const describedBy = dialog.getAttribute('aria-describedby');
        expect(describedBy).toBeTruthy();

        const description = document.getElementById(describedBy!);
        expect(description).toBeTruthy();
        expect(description!.textContent).toBe('This action cannot be undone.');
      });
    });

    it('focus moves to content on open', async () => {
      const user = userEvent.setup();
      renderAlertDialog();

      await user.click(screen.getByText('open alert'));

      await waitFor(() => {
        const dialog = getAlertDialogContent();
        // Focus should be within the alert dialog content
        expect(dialog.contains(document.activeElement)).toBe(true);
      });
    });

    it('focus returns to trigger on close', async () => {
      const user = userEvent.setup();
      renderAlertDialog();

      const trigger = screen.getByText('open alert');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Cancel'));

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(trigger.closest('button')).toHaveFocus();
      });
    });
  });

  // -----------------------------------------------------------------------
  // Overlay
  // -----------------------------------------------------------------------
  describe('overlay', () => {
    it('does not close dialog when clicking overlay', async () => {
      const user = userEvent.setup();
      renderAlertDialog();

      await user.click(screen.getByText('open alert'));
      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      // Click the overlay (outside the dialog content)
      const overlay = document.querySelector('[data-state="open"].fixed');
      expect(overlay).toBeTruthy();
      await user.click(overlay as Element);

      // Alert dialog should still be open
      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });
    });
  });

  // -----------------------------------------------------------------------
  // Sub-components
  // -----------------------------------------------------------------------
  describe('sub-components', () => {
    it('Header renders with flex-col layout', async () => {
      const user = userEvent.setup();
      renderAlertDialog();

      await user.click(screen.getByText('open alert'));

      await waitFor(() => {
        const title = screen.getByText('Are you sure?');
        const header = title.parentElement;
        expect(header).toHaveClass('flex', 'flex-col', 'gap-2');
      });
    });

    it('Footer renders with justify-end layout', async () => {
      const user = userEvent.setup();
      renderAlertDialog();

      await user.click(screen.getByText('open alert'));

      await waitFor(() => {
        const cancelBtn = screen.getByText('Cancel');
        const footer = cancelBtn.parentElement;
        expect(footer).toHaveClass('flex', 'justify-end', 'gap-2');
      });
    });

    it('Title renders with correct styling', async () => {
      const user = userEvent.setup();
      renderAlertDialog();

      await user.click(screen.getByText('open alert'));

      await waitFor(() => {
        const title = screen.getByText('Are you sure?');
        expect(title).toHaveClass('text-lg', 'font-semibold');
      });
    });

    it('Description renders with correct styling', async () => {
      const user = userEvent.setup();
      renderAlertDialog();

      await user.click(screen.getByText('open alert'));

      await waitFor(() => {
        const desc = screen.getByText('This action cannot be undone.');
        expect(desc).toHaveClass('text-sm', 'text-neutral-500');
      });
    });
  });

  // -----------------------------------------------------------------------
  // Edge cases
  // -----------------------------------------------------------------------
  describe('edge cases', () => {
    it('supports controlled mode with open prop', () => {
      render(
        <AlertDialog open>
          <AlertDialogTrigger>trigger</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Title</AlertDialogTitle>
              <AlertDialogDescription>Description</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>,
      );

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('calls onOpenChange when state changes', async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <AlertDialog onOpenChange={handleOpenChange}>
          <AlertDialogTrigger>trigger</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Title</AlertDialogTitle>
              <AlertDialogDescription>Description</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>,
      );

      await user.click(screen.getByText('trigger'));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it('merges custom className with variant classes', async () => {
      const user = userEvent.setup();
      renderAlertDialog({ className: 'my-custom-class' });

      await user.click(screen.getByText('open alert'));

      await waitFor(() => {
        const dialog = getAlertDialogContent();
        expect(dialog).toHaveClass('my-custom-class');
      });
    });

    it('forwards ref to AlertDialogContent', async () => {
      const ref = createRef<HTMLDivElement>();

      render(
        <AlertDialog open>
          <AlertDialogTrigger>trigger</AlertDialogTrigger>
          <AlertDialogContent ref={ref}>
            <AlertDialogHeader>
              <AlertDialogTitle>Title</AlertDialogTitle>
              <AlertDialogDescription>Description</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>,
      );

      await waitFor(() => {
        expect(ref.current).toBeInstanceOf(HTMLElement);
      });
    });

    it('forwards ref to AlertDialogTrigger', () => {
      const ref = createRef<HTMLButtonElement>();

      render(
        <AlertDialog>
          <AlertDialogTrigger ref={ref}>trigger</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Title</AlertDialogTitle>
              <AlertDialogDescription>Description</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>,
      );

      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  // -----------------------------------------------------------------------
  // Properties (property-based tests)
  // -----------------------------------------------------------------------
  describe('properties', () => {
    /**
     * Feature: alert-dialog, Property 1: Variant styling includes correct light and dark mode classes
     * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.7
     */
    it('Property 1: variant styling includes correct light and dark mode classes', async () => {
      const { default: fc } = await import('fast-check');

      const expectedClasses: Record<string, { light: string[]; dark: string[] }> = {
        default: {
          light: ['bg-white', 'text-neutral-900', 'border', 'border-neutral-200'],
          dark: ['dark:border-neutral-700', 'dark:bg-neutral-800', 'dark:text-neutral-100'],
        },
        destructive: {
          light: ['bg-white', 'text-neutral-900', 'border-t-4', 'border-t-error-500'],
          dark: ['dark:border-neutral-700', 'dark:border-t-error-500', 'dark:bg-neutral-800', 'dark:text-neutral-100'],
        },
      };

      fc.assert(
        fc.property(
          fc.constantFrom('default' as const, 'destructive' as const),
          (variant) => {
            const classes = alertDialogContentVariants({ variant });
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
     * Feature: alert-dialog, Property 2: Module exports completeness
     * Validates: Requirements 7.1, 7.2, 7.3, 7.4
     */
    it('Property 2: Module exports completeness', async () => {
      const { default: fc } = await import('fast-check');

      fc.assert(
        fc.property(
          fc.constantFrom(
            'AlertDialog',
            'AlertDialogTrigger',
            'AlertDialogOverlay',
            'AlertDialogContent',
            'AlertDialogHeader',
            'AlertDialogFooter',
            'AlertDialogTitle',
            'AlertDialogDescription',
            'AlertDialogAction',
            'AlertDialogCancel',
            'alertDialogContentVariants',
          ),
          (exportName) => {
            expect(
              (AlertDialogModule as Record<string, unknown>)[exportName],
            ).toBeDefined();
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
