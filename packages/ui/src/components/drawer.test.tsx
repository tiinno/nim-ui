import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, waitFor } from '../test/test-utils';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
  DrawerHeader,
  DrawerBody,
  DrawerClose,
} from './drawer';

describe('Drawer', () => {
  describe('Basic Rendering', () => {
    it('does not render content by default (closed)', () => {
      render(
        <Drawer>
          <DrawerTrigger>Open</DrawerTrigger>
          <DrawerContent>
            <DrawerTitle>Title</DrawerTitle>
          </DrawerContent>
        </Drawer>
      );

      expect(screen.queryByText('Title')).not.toBeInTheDocument();
    });

    it('renders content when defaultOpen is true', () => {
      render(
        <Drawer defaultOpen>
          <DrawerContent>
            <DrawerTitle>Title</DrawerTitle>
          </DrawerContent>
        </Drawer>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
    });
  });

  describe('Opening and Closing', () => {
    it('opens drawer when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Drawer>
          <DrawerTrigger>Open Drawer</DrawerTrigger>
          <DrawerContent>
            <DrawerTitle>Drawer Title</DrawerTitle>
          </DrawerContent>
        </Drawer>
      );

      await user.click(screen.getByText('Open Drawer'));

      await waitFor(() => {
        expect(screen.getByText('Drawer Title')).toBeInTheDocument();
      });
    });

    it('closes drawer when close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Drawer>
          <DrawerTrigger>Open</DrawerTrigger>
          <DrawerContent>
            <DrawerTitle>Title</DrawerTitle>
            <DrawerClose>Close</DrawerClose>
          </DrawerContent>
        </Drawer>
      );

      await user.click(screen.getByText('Open'));
      await waitFor(() => expect(screen.getByText('Title')).toBeInTheDocument());

      await user.click(screen.getByText('Close'));
      await waitFor(() => {
        expect(screen.queryByText('Title')).not.toBeInTheDocument();
      });
    });
  });

  describe('Side Positioning', () => {
    it('renders drawer on right side by default', () => {
      render(
        <Drawer defaultOpen>
          <DrawerContent>
            <DrawerTitle>Title</DrawerTitle>
          </DrawerContent>
        </Drawer>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('right-0');
    });

    it('renders drawer on left side when specified', () => {
      render(
        <Drawer defaultOpen>
          <DrawerContent side="left">
            <DrawerTitle>Title</DrawerTitle>
          </DrawerContent>
        </Drawer>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('left-0');
    });

    it('applies correct slide animation for left side', () => {
      render(
        <Drawer defaultOpen>
          <DrawerContent side="left">
            <DrawerTitle>Title</DrawerTitle>
          </DrawerContent>
        </Drawer>
      );

      const dialog = screen.getByRole('dialog');
      // Check for data attribute animation class
      expect(dialog.className).toContain('slide-in-from-left');
    });

    it('applies correct slide animation for right side', () => {
      render(
        <Drawer defaultOpen>
          <DrawerContent side="right">
            <DrawerTitle>Title</DrawerTitle>
          </DrawerContent>
        </Drawer>
      );

      const dialog = screen.getByRole('dialog');
      // Check for data attribute animation class
      expect(dialog.className).toContain('slide-in-from-right');
    });
  });

  describe('Keyboard Navigation', () => {
    it('closes drawer on Escape key', async () => {
      const user = userEvent.setup();
      render(
        <Drawer defaultOpen>
          <DrawerContent>
            <DrawerTitle>Title</DrawerTitle>
          </DrawerContent>
        </Drawer>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Title')).not.toBeInTheDocument();
      });
    });

    it('traps focus within drawer when open', async () => {
      const user = userEvent.setup();
      render(
        <Drawer defaultOpen>
          <DrawerContent>
            <DrawerTitle>Title</DrawerTitle>
            <button>Button 1</button>
            <button>Button 2</button>
          </DrawerContent>
        </Drawer>
      );

      const button1 = screen.getByText('Button 1');
      const button2 = screen.getByText('Button 2');

      // Tab through focusable elements - Radix UI manages focus order
      await user.tab();
      const firstFocus = document.activeElement;
      expect([button1, button2]).toContain(firstFocus);

      await user.tab();
      const secondFocus = document.activeElement;
      expect([button1, button2]).toContain(secondFocus);
    });
  });

  describe('Accessibility', () => {
    it('has correct dialog role', () => {
      render(
        <Drawer defaultOpen>
          <DrawerContent>
            <DrawerTitle>Title</DrawerTitle>
          </DrawerContent>
        </Drawer>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('links title to dialog with aria-labelledby', async () => {
      render(
        <Drawer defaultOpen>
          <DrawerContent>
            <DrawerTitle>Accessible Title</DrawerTitle>
          </DrawerContent>
        </Drawer>
      );

      const dialog = screen.getByRole('dialog');

      await waitFor(() => {
        expect(dialog).toHaveAttribute('aria-labelledby');
      });
    });

    it('links description to dialog with aria-describedby', async () => {
      render(
        <Drawer defaultOpen>
          <DrawerContent>
            <DrawerTitle>Title</DrawerTitle>
            <DrawerDescription>Description text</DrawerDescription>
          </DrawerContent>
        </Drawer>
      );

      const dialog = screen.getByRole('dialog');

      await waitFor(() => {
        expect(dialog).toHaveAttribute('aria-describedby');
      });
    });
  });

  describe('Portal Rendering', () => {
    it('renders drawer content outside root container', () => {
      const { container } = render(
        <Drawer defaultOpen>
          <DrawerContent>
            <DrawerTitle>Portal Test</DrawerTitle>
          </DrawerContent>
        </Drawer>
      );

      // Drawer content should not be in the container
      expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();

      // But should exist in document body
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Controlled Mode', () => {
    it('supports controlled open state', () => {
      const { rerender } = render(
        <Drawer open={false}>
          <DrawerContent>
            <DrawerTitle>Controlled</DrawerTitle>
          </DrawerContent>
        </Drawer>
      );

      expect(screen.queryByText('Controlled')).not.toBeInTheDocument();

      rerender(
        <Drawer open={true}>
          <DrawerContent>
            <DrawerTitle>Controlled</DrawerTitle>
          </DrawerContent>
        </Drawer>
      );

      expect(screen.getByText('Controlled')).toBeInTheDocument();
    });

    it('calls onOpenChange when drawer state changes', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <Drawer onOpenChange={handleOpenChange}>
          <DrawerTrigger>Open</DrawerTrigger>
          <DrawerContent>
            <DrawerTitle>Title</DrawerTitle>
          </DrawerContent>
        </Drawer>
      );

      await user.click(screen.getByText('Open'));
      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Sub-components', () => {
    it('renders DrawerHeader correctly', () => {
      render(
        <Drawer defaultOpen>
          <DrawerContent>
            <DrawerHeader data-testid="header">
              <DrawerTitle>Header Title</DrawerTitle>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      );

      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByText('Header Title')).toBeInTheDocument();
    });

    it('renders DrawerBody correctly', () => {
      render(
        <Drawer defaultOpen>
          <DrawerContent>
            <DrawerTitle>Title</DrawerTitle>
            <DrawerBody data-testid="body">Body content</DrawerBody>
          </DrawerContent>
        </Drawer>
      );

      expect(screen.getByTestId('body')).toBeInTheDocument();
      expect(screen.getByText('Body content')).toBeInTheDocument();
    });
  });

  describe('Overlay', () => {
    it('renders overlay backdrop when open', () => {
      render(
        <Drawer defaultOpen>
          <DrawerContent>
            <DrawerTitle>Title</DrawerTitle>
          </DrawerContent>
        </Drawer>
      );

      // Check for backdrop element with data-state attribute
      const backdrop = document.querySelector('[data-state="open"]');
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(
        <Drawer defaultOpen>
          <DrawerContent className="custom-drawer">
            <DrawerTitle>Title</DrawerTitle>
          </DrawerContent>
        </Drawer>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('custom-drawer');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to content element', () => {
      const ref = { current: null };
      render(
        <Drawer defaultOpen>
          <DrawerContent ref={ref}>
            <DrawerTitle>Title</DrawerTitle>
          </DrawerContent>
        </Drawer>
      );

      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });
});
