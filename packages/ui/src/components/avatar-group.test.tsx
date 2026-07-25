import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '../test/test-utils';
import { Avatar, AvatarFallback } from './avatar';
import {
  AvatarGroup,
  avatarGroupVariants,
  avatarGroupOverflowVariants,
} from './avatar-group';

const person = (initials: string) => (
  <Avatar key={initials} data-testid={`avatar-${initials}`}>
    <AvatarFallback>{initials}</AvatarFallback>
  </Avatar>
);

describe('AvatarGroup', () => {
  describe('Rendering', () => {
    it('renders a labelled group', () => {
      render(
        <AvatarGroup label="Assignees">
          {person('JD')}
          {person('AM')}
        </AvatarGroup>
      );
      const group = screen.getByRole('group');
      expect(group).toHaveAttribute('aria-label', 'Assignees');
      expect(screen.getByText('JD')).toBeInTheDocument();
      expect(screen.getByText('AM')).toBeInTheDocument();
    });

    it('applies base layout styles', () => {
      render(<AvatarGroup label="Base">{person('JD')}</AvatarGroup>);
      const group = screen.getByRole('group');
      expect(group).toHaveClass('inline-flex');
      expect(group).toHaveClass('items-center');
      expect(group).toHaveClass('-space-x-2');
    });

    it('rings each stacked avatar in the surface color for both themes', () => {
      render(<AvatarGroup label="Rings">{person('JD')}</AvatarGroup>);
      const avatar = screen.getByTestId('avatar-JD');
      expect(avatar).toHaveClass('ring-2');
      expect(avatar).toHaveClass('ring-white');
      expect(avatar).toHaveClass('dark:ring-neutral-950');
    });

    it('keeps DOM order identical to source order', () => {
      const { container } = render(
        <AvatarGroup label="Order">
          {person('AA')}
          {person('BB')}
          {person('CC')}
        </AvatarGroup>
      );
      const group = container.querySelector('[role="group"]') as HTMLElement;
      expect(Array.from(group.children).map((el) => el.textContent)).toEqual([
        'AA',
        'BB',
        'CC',
      ]);
    });

    it('renders an empty group when there are no children', () => {
      render(<AvatarGroup label="Nobody" />);
      const group = screen.getByRole('group');
      expect(group).toBeInTheDocument();
      expect(group.children).toHaveLength(0);
      expect(screen.queryByTestId('avatar-group-overflow')).not.toBeInTheDocument();
    });
  });

  describe('Overflow', () => {
    it('collapses beyond the default max of 4', () => {
      render(
        <AvatarGroup label="Six">
          {['A1', 'A2', 'A3', 'A4', 'A5', 'A6'].map((i) => person(i))}
        </AvatarGroup>
      );
      expect(screen.getByTestId('avatar-A4')).toBeInTheDocument();
      expect(screen.queryByTestId('avatar-A5')).not.toBeInTheDocument();
      expect(screen.getByTestId('avatar-group-overflow')).toHaveTextContent('+2');
    });

    it('honors a custom max', () => {
      render(
        <AvatarGroup label="Max two" max={2}>
          {['A1', 'A2', 'A3', 'A4'].map((i) => person(i))}
        </AvatarGroup>
      );
      expect(screen.queryByTestId('avatar-A3')).not.toBeInTheDocument();
      expect(screen.getByTestId('avatar-group-overflow')).toHaveTextContent('+2');
    });

    it('renders no chip when children fit under max', () => {
      render(
        <AvatarGroup label="Fits">
          {person('JD')}
          {person('AM')}
        </AvatarGroup>
      );
      expect(screen.queryByTestId('avatar-group-overflow')).not.toBeInTheDocument();
    });

    it('uses total to count avatars that were never rendered', () => {
      render(
        <AvatarGroup label="Collaborators" total={37}>
          {['A1', 'A2', 'A3', 'A4'].map((i) => person(i))}
        </AvatarGroup>
      );
      expect(screen.getByTestId('avatar-group-overflow')).toHaveTextContent('+33');
    });

    it('never renders a negative chip when total is smaller than the rendered count', () => {
      render(
        <AvatarGroup label="Bad total" total={2}>
          {['A1', 'A2', 'A3', 'A4'].map((i) => person(i))}
        </AvatarGroup>
      );
      expect(screen.queryByTestId('avatar-group-overflow')).not.toBeInTheDocument();
    });

    it('still signals truncation when total under-counts the rendered children', () => {
      // A stale or filtered `total` must never let avatars disappear silently:
      // the chip is the only signal that `max` truncated the stack.
      render(
        <AvatarGroup label="Stale total" max={2} total={2}>
          {['A1', 'A2', 'A3', 'A4'].map((i) => person(i))}
        </AvatarGroup>
      );
      expect(screen.getByTestId('avatar-A2')).toBeInTheDocument();
      expect(screen.queryByTestId('avatar-A3')).not.toBeInTheDocument();
      expect(screen.getByTestId('avatar-group-overflow')).toHaveTextContent('+2');
    });

    it('counts both truncated children and unfetched people', () => {
      // 4 rendered of a population of 5, only 2 shown: 2 truncated + 1 unfetched.
      render(
        <AvatarGroup label="Mixed overflow" max={2} total={5}>
          {['A1', 'A2', 'A3', 'A4'].map((i) => person(i))}
        </AvatarGroup>
      );
      expect(screen.getByTestId('avatar-group-overflow')).toHaveTextContent('+3');
    });

    it('folds every avatar into the chip when max is 0', () => {
      render(
        <AvatarGroup label="All collapsed" max={0}>
          {['A1', 'A2', 'A3'].map((i) => person(i))}
        </AvatarGroup>
      );
      expect(screen.queryByTestId('avatar-A1')).not.toBeInTheDocument();
      expect(screen.getByTestId('avatar-group-overflow')).toHaveTextContent('+3');
    });

    it('ignores non-element children instead of crashing', () => {
      render(
        <AvatarGroup label="Mixed">
          {person('JD')}
          {'   '}
          {null}
          {false}
          {person('AM')}
        </AvatarGroup>
      );
      const group = screen.getByRole('group');
      expect(group.children).toHaveLength(2);
      expect(screen.queryByTestId('avatar-group-overflow')).not.toBeInTheDocument();
    });

    it('styles the chip as a quiet neutral circle in both themes', () => {
      render(
        <AvatarGroup label="Chip" max={1}>
          {['A1', 'A2', 'A3'].map((i) => person(i))}
        </AvatarGroup>
      );
      const chip = screen.getByTestId('avatar-group-overflow');
      expect(chip).toHaveClass('rounded-full');
      expect(chip).toHaveClass('tabular-nums');
      expect(chip).toHaveClass('bg-neutral-100');
      expect(chip).toHaveClass('text-neutral-600');
      expect(chip).toHaveClass('dark:bg-neutral-800');
      expect(chip).toHaveClass('dark:text-neutral-400');
      expect(chip).toHaveClass('ring-2');
      expect(chip).toHaveClass('ring-white');
      expect(chip).toHaveClass('dark:ring-neutral-950');
    });
  });

  describe('Sizes', () => {
    it.each([
      ['sm', 'h-8', 'w-8'],
      ['md', 'h-10', 'w-10'],
      ['lg', 'h-12', 'w-12'],
      ['xl', 'h-16', 'w-16'],
    ])('forwards %s size to avatar children', (size, heightClass, widthClass) => {
      render(
        <AvatarGroup label="Sized" size={size as any}>
          {person('JD')}
        </AvatarGroup>
      );
      const avatar = screen.getByTestId('avatar-JD');
      expect(avatar).toHaveClass(heightClass);
      expect(avatar).toHaveClass(widthClass);
    });

    it.each([
      ['sm', 'h-8', 'w-8', 'text-xs'],
      ['md', 'h-10', 'w-10', 'text-xs'],
      ['lg', 'h-12', 'w-12', 'text-sm'],
      ['xl', 'h-16', 'w-16', 'text-base'],
    ])(
      'gives the chip the same diameter as %s avatars',
      (size, heightClass, widthClass, textClass) => {
        render(
          <AvatarGroup label="Chip size" size={size as any} max={1}>
            {['A1', 'A2'].map((i) => person(i))}
          </AvatarGroup>
        );
        const avatar = screen.getByTestId('avatar-A1');
        const chip = screen.getByTestId('avatar-group-overflow');
        expect(avatar).toHaveClass(heightClass);
        expect(chip).toHaveClass(heightClass);
        expect(chip).toHaveClass(widthClass);
        expect(chip).toHaveClass(textClass);
      }
    );

    it('defaults to md, matching Avatar', () => {
      render(<AvatarGroup label="Default size">{person('JD')}</AvatarGroup>);
      expect(screen.getByTestId('avatar-JD')).toHaveClass('h-10');
    });

    it('preserves a size the child set explicitly', () => {
      render(
        <AvatarGroup label="Explicit" size="sm">
          <Avatar data-testid="avatar-XL" size="xl">
            <AvatarFallback>XL</AvatarFallback>
          </Avatar>
          {person('JD')}
        </AvatarGroup>
      );
      expect(screen.getByTestId('avatar-XL')).toHaveClass('h-16');
      expect(screen.getByTestId('avatar-JD')).toHaveClass('h-8');
    });

    it('preserves a className the child set explicitly', () => {
      render(
        <AvatarGroup label="Child class">
          <Avatar data-testid="avatar-JD" className="opacity-60">
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </AvatarGroup>
      );
      const avatar = screen.getByTestId('avatar-JD');
      expect(avatar).toHaveClass('opacity-60');
      expect(avatar).toHaveClass('ring-2');
    });
  });

  describe('Spacing', () => {
    it('uses normal overlap by default', () => {
      render(<AvatarGroup label="Normal">{person('JD')}</AvatarGroup>);
      expect(screen.getByRole('group')).toHaveClass('-space-x-2');
    });

    it('uses tight overlap when requested', () => {
      render(
        <AvatarGroup label="Tight" spacing="tight">
          {person('JD')}
        </AvatarGroup>
      );
      expect(screen.getByRole('group')).toHaveClass('-space-x-3');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to the root element', () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <AvatarGroup ref={ref} label="Ref">
          {person('JD')}
        </AvatarGroup>
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveAttribute('role', 'group');
    });
  });

  describe('Variant functions', () => {
    it('avatarGroupVariants returns root classes', () => {
      const result = avatarGroupVariants({ spacing: 'tight' });
      expect(result).toContain('inline-flex');
      expect(result).toContain('-space-x-3');
    });

    it('avatarGroupOverflowVariants returns chip classes', () => {
      const result = avatarGroupOverflowVariants({ size: 'xl' });
      expect(result).toContain('text-base');
      expect(result).toContain('tabular-nums');
      expect(result).toContain('dark:bg-neutral-800');
    });
  });

  describe('Customization', () => {
    it('merges custom className on the root', () => {
      render(
        <AvatarGroup label="Custom" className="rounded-md p-1">
          {person('JD')}
        </AvatarGroup>
      );
      const group = screen.getByRole('group');
      expect(group).toHaveClass('rounded-md');
      expect(group).toHaveClass('p-1');
      expect(group).toHaveClass('inline-flex');
    });

    it('passes through HTML attributes', () => {
      render(
        <AvatarGroup label="Attrs" id="order-assignees" data-state="idle">
          {person('JD')}
        </AvatarGroup>
      );
      const group = screen.getByRole('group');
      expect(group).toHaveAttribute('id', 'order-assignees');
      expect(group).toHaveAttribute('data-state', 'idle');
    });
  });
});
