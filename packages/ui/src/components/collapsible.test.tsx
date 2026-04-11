import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from './collapsible';

describe('Collapsible', () => {
  describe('Rendering', () => {
    it('renders trigger', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );
      expect(screen.getByText('Toggle')).toBeInTheDocument();
    });

    it('hides content by default', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Hidden content</CollapsibleContent>
        </Collapsible>
      );
      expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
    });

    it('shows content when defaultOpen', () => {
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Visible content</CollapsibleContent>
        </Collapsible>
      );
      expect(screen.getByText('Visible content')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('toggles content on trigger click', async () => {
      const user = userEvent.setup();
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Toggled content</CollapsibleContent>
        </Collapsible>
      );
      expect(screen.queryByText('Toggled content')).not.toBeInTheDocument();
      await user.click(screen.getByText('Toggle'));
      expect(screen.getByText('Toggled content')).toBeInTheDocument();
    });

    it('fires onOpenChange', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      render(
        <Collapsible onOpenChange={handleOpenChange}>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );
      await user.click(screen.getByText('Toggle'));
      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });

    it('supports controlled open state', () => {
      const { rerender } = render(
        <Collapsible open={false}>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Controlled</CollapsibleContent>
        </Collapsible>
      );
      expect(screen.queryByText('Controlled')).not.toBeInTheDocument();
      rerender(
        <Collapsible open={true}>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Controlled</CollapsibleContent>
        </Collapsible>
      );
      expect(screen.getByText('Controlled')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('trigger has aria-expanded=false when closed', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );
      expect(screen.getByText('Toggle')).toHaveAttribute(
        'aria-expanded',
        'false'
      );
    });

    it('trigger has aria-expanded=true when open', () => {
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );
      expect(screen.getByText('Toggle')).toHaveAttribute(
        'aria-expanded',
        'true'
      );
    });
  });

  describe('Disabled state', () => {
    it('does not toggle when disabled', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      render(
        <Collapsible disabled onOpenChange={handleOpenChange}>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );
      await user.click(screen.getByText('Toggle'));
      expect(handleOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('Custom className', () => {
    it('merges custom className on trigger', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger className="custom-trigger">
            Toggle
          </CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );
      expect(screen.getByText('Toggle')).toHaveClass('custom-trigger');
    });

    it('merges custom className on content', () => {
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent className="custom-content" data-testid="content">
            Visible
          </CollapsibleContent>
        </Collapsible>
      );
      expect(screen.getByTestId('content')).toHaveClass('custom-content');
    });
  });
});
