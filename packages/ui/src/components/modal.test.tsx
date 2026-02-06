import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, waitFor } from '../test/test-utils';
import {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalTitle,
  ModalDescription,
  ModalHeader,
  ModalBody,
  ModalClose,
} from './modal';

describe('Modal', () => {
  describe('Basic Rendering', () => {
    it('does not render content by default (closed)', () => {
      render(
        <Modal>
          <ModalTrigger>Open</ModalTrigger>
          <ModalContent>
            <ModalTitle>Title</ModalTitle>
          </ModalContent>
        </Modal>
      );

      expect(screen.queryByText('Title')).not.toBeInTheDocument();
    });

    it('renders content when defaultOpen is true', () => {
      render(
        <Modal defaultOpen>
          <ModalContent>
            <ModalTitle>Title</ModalTitle>
          </ModalContent>
        </Modal>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
    });
  });

  describe('Opening and Closing', () => {
    it('opens modal when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Modal>
          <ModalTrigger>Open Modal</ModalTrigger>
          <ModalContent>
            <ModalTitle>Modal Title</ModalTitle>
          </ModalContent>
        </Modal>
      );

      await user.click(screen.getByText('Open Modal'));

      await waitFor(() => {
        expect(screen.getByText('Modal Title')).toBeInTheDocument();
      });
    });

    it('closes modal when close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Modal>
          <ModalTrigger>Open</ModalTrigger>
          <ModalContent>
            <ModalTitle>Title</ModalTitle>
            <ModalClose>Close</ModalClose>
          </ModalContent>
        </Modal>
      );

      await user.click(screen.getByText('Open'));
      await waitFor(() => expect(screen.getByText('Title')).toBeInTheDocument());

      await user.click(screen.getByText('Close'));
      await waitFor(() => {
        expect(screen.queryByText('Title')).not.toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('closes modal on Escape key', async () => {
      const user = userEvent.setup();
      render(
        <Modal defaultOpen>
          <ModalContent>
            <ModalTitle>Title</ModalTitle>
          </ModalContent>
        </Modal>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Title')).not.toBeInTheDocument();
      });
    });

    it('traps focus within modal when open', async () => {
      const user = userEvent.setup();
      render(
        <Modal defaultOpen>
          <ModalContent>
            <ModalTitle>Title</ModalTitle>
            <button>Button 1</button>
            <button>Button 2</button>
          </ModalContent>
        </Modal>
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
        <Modal defaultOpen>
          <ModalContent>
            <ModalTitle>Title</ModalTitle>
          </ModalContent>
        </Modal>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('links title to dialog with aria-labelledby', async () => {
      render(
        <Modal defaultOpen>
          <ModalContent>
            <ModalTitle>Accessible Title</ModalTitle>
          </ModalContent>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');

      await waitFor(() => {
        expect(dialog).toHaveAttribute('aria-labelledby');
      });
    });

    it('links description to dialog with aria-describedby', async () => {
      render(
        <Modal defaultOpen>
          <ModalContent>
            <ModalTitle>Title</ModalTitle>
            <ModalDescription>Description text</ModalDescription>
          </ModalContent>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');

      await waitFor(() => {
        expect(dialog).toHaveAttribute('aria-describedby');
      });
    });
  });

  describe('Portal Rendering', () => {
    it('renders modal content outside root container', () => {
      const { container } = render(
        <Modal defaultOpen>
          <ModalContent>
            <ModalTitle>Portal Test</ModalTitle>
          </ModalContent>
        </Modal>
      );

      // Modal content should not be in the render container
      expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();

      // But should exist in document body
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Controlled Mode', () => {
    it('supports controlled open state', () => {
      const { rerender } = render(
        <Modal open={false}>
          <ModalContent>
            <ModalTitle>Controlled</ModalTitle>
          </ModalContent>
        </Modal>
      );

      expect(screen.queryByText('Controlled')).not.toBeInTheDocument();

      rerender(
        <Modal open={true}>
          <ModalContent>
            <ModalTitle>Controlled</ModalTitle>
          </ModalContent>
        </Modal>
      );

      expect(screen.getByText('Controlled')).toBeInTheDocument();
    });

    it('calls onOpenChange when modal state changes', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <Modal onOpenChange={handleOpenChange}>
          <ModalTrigger>Open</ModalTrigger>
          <ModalContent>
            <ModalTitle>Title</ModalTitle>
          </ModalContent>
        </Modal>
      );

      await user.click(screen.getByText('Open'));
      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Sub-components', () => {
    it('renders ModalHeader correctly', () => {
      render(
        <Modal defaultOpen>
          <ModalContent>
            <ModalHeader data-testid="header">
              <ModalTitle>Header Title</ModalTitle>
            </ModalHeader>
          </ModalContent>
        </Modal>
      );

      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByText('Header Title')).toBeInTheDocument();
    });

    it('renders ModalBody correctly', () => {
      render(
        <Modal defaultOpen>
          <ModalContent>
            <ModalTitle>Title</ModalTitle>
            <ModalBody data-testid="body">Body content</ModalBody>
          </ModalContent>
        </Modal>
      );

      expect(screen.getByTestId('body')).toBeInTheDocument();
      expect(screen.getByText('Body content')).toBeInTheDocument();
    });
  });

  describe('Overlay', () => {
    it('renders overlay backdrop when open', () => {
      render(
        <Modal defaultOpen>
          <ModalContent>
            <ModalTitle>Title</ModalTitle>
          </ModalContent>
        </Modal>
      );

      // Check for backdrop element with data-state attribute
      const backdrop = document.querySelector('[data-state="open"]');
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(
        <Modal defaultOpen>
          <ModalContent className="custom-modal">
            <ModalTitle>Title</ModalTitle>
          </ModalContent>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('custom-modal');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to content element', () => {
      const ref = { current: null };
      render(
        <Modal defaultOpen>
          <ModalContent ref={ref}>
            <ModalTitle>Title</ModalTitle>
          </ModalContent>
        </Modal>
      );

      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });
});
