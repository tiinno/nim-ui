import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '../test/test-utils';
import { ButtonGroup, buttonGroupVariants } from './button-group';
import { Button } from './button';

describe('ButtonGroup', () => {
  describe('Rendering', () => {
    it('renders children buttons', () => {
      render(
        <ButtonGroup aria-label="View density">
          <Button variant="outline">Compact</Button>
          <Button variant="outline">Comfortable</Button>
        </ButtonGroup>
      );
      expect(screen.getByRole('button', { name: 'Compact' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Comfortable' })).toBeInTheDocument();
    });

    it('renders with role group', () => {
      render(
        <ButtonGroup aria-label="Actions">
          <Button>One</Button>
        </ButtonGroup>
      );
      expect(screen.getByRole('group', { name: 'Actions' })).toBeInTheDocument();
    });

    it('applies base child overrides for attachment', () => {
      render(
        <ButtonGroup aria-label="Group" data-testid="group">
          <Button>One</Button>
        </ButtonGroup>
      );
      const group = screen.getByTestId('group');
      expect(group).toHaveClass('inline-flex');
      expect(group).toHaveClass('shadow-control');
      expect(group).toHaveClass('[&>*]:relative');
      expect(group).toHaveClass('[&>*]:rounded-none');
      expect(group).toHaveClass('[&>*]:shadow-none');
      expect(group).toHaveClass('[&>*:focus-visible]:z-10');
    });
  });

  describe('Orientation', () => {
    it('renders horizontal by default', () => {
      render(
        <ButtonGroup aria-label="Group" data-testid="group">
          <Button>One</Button>
        </ButtonGroup>
      );
      const group = screen.getByTestId('group');
      expect(group).toHaveClass('items-stretch');
      expect(group).toHaveClass('[&>*:first-child]:rounded-l-md');
      expect(group).toHaveClass('[&>*:last-child]:rounded-r-md');
      expect(group).toHaveClass('[&>*:not(:first-child)]:-ml-px');
      expect(group).not.toHaveClass('flex-col');
    });

    it('renders vertical orientation', () => {
      render(
        <ButtonGroup aria-label="Group" data-testid="group" orientation="vertical">
          <Button>One</Button>
        </ButtonGroup>
      );
      const group = screen.getByTestId('group');
      expect(group).toHaveClass('flex-col');
      expect(group).toHaveClass('[&>*:first-child]:rounded-t-md');
      expect(group).toHaveClass('[&>*:last-child]:rounded-b-md');
      expect(group).toHaveClass('[&>*:not(:first-child)]:-mt-px');
    });
  });

  describe('Interaction', () => {
    it('keeps child buttons independently clickable and disableable', () => {
      render(
        <ButtonGroup aria-label="Group">
          <Button variant="outline">Enabled</Button>
          <Button variant="outline" disabled>
            Disabled
          </Button>
        </ButtonGroup>
      );
      expect(screen.getByRole('button', { name: 'Enabled' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to the group element', () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <ButtonGroup aria-label="Group" ref={ref}>
          <Button>One</Button>
        </ButtonGroup>
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveAttribute('role', 'group');
    });
  });

  describe('buttonGroupVariants', () => {
    it('returns horizontal classes by default', () => {
      const result = buttonGroupVariants({});
      expect(result).toContain('[&>*:first-child]:rounded-l-md');
    });

    it('returns vertical classes', () => {
      const result = buttonGroupVariants({ orientation: 'vertical' });
      expect(result).toContain('flex-col');
      expect(result).toContain('[&>*:not(:first-child)]:-mt-px');
    });
  });

  describe('Customization', () => {
    it('merges custom className', () => {
      render(
        <ButtonGroup aria-label="Group" data-testid="group" className="w-full">
          <Button>One</Button>
        </ButtonGroup>
      );
      const group = screen.getByTestId('group');
      expect(group).toHaveClass('w-full');
      expect(group).toHaveClass('inline-flex');
    });

    it('passes through HTML attributes', () => {
      render(
        <ButtonGroup aria-label="Group" data-testid="group" id="density-toggle">
          <Button>One</Button>
        </ButtonGroup>
      );
      expect(screen.getByTestId('group')).toHaveAttribute('id', 'density-toggle');
    });
  });
});
