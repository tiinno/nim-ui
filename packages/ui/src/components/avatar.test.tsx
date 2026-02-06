import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import { Avatar, AvatarImage, AvatarFallback, avatarVariants } from './avatar';

describe('Avatar', () => {
  describe('Avatar - Rendering', () => {
    it('renders avatar element', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByTestId('avatar')).toBeInTheDocument();
    });

    it('applies base styles', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('relative');
      expect(avatar).toHaveClass('flex');
      expect(avatar).toHaveClass('shrink-0');
      expect(avatar).toHaveClass('overflow-hidden');
      expect(avatar).toHaveClass('rounded-full');
    });

    it('renders with default size', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('h-10');
      expect(avatar).toHaveClass('w-10');
    });
  });

  describe('Avatar Sizes', () => {
    it.each([
      ['sm', 'h-8', 'w-8'],
      ['md', 'h-10', 'w-10'],
      ['lg', 'h-12', 'w-12'],
      ['xl', 'h-16', 'w-16'],
    ])('renders %s size with correct dimensions', (size, heightClass, widthClass) => {
      render(
        <Avatar data-testid="avatar" size={size as any}>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass(heightClass);
      expect(avatar).toHaveClass(widthClass);
    });

    it('applies small size', () => {
      render(
        <Avatar size="sm" data-testid="avatar">
          <AvatarFallback>S</AvatarFallback>
        </Avatar>
      );
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('h-8');
      expect(avatar).toHaveClass('w-8');
    });

    it('applies extra large size', () => {
      render(
        <Avatar size="xl" data-testid="avatar">
          <AvatarFallback>XL</AvatarFallback>
        </Avatar>
      );
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('h-16');
      expect(avatar).toHaveClass('w-16');
    });
  });

  describe('AvatarImage - Rendering', () => {
    it('can be included in Avatar composition', () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="/test.jpg" alt="Test" />
          <AvatarFallback>T</AvatarFallback>
        </Avatar>
      );
      // In jsdom, AvatarImage doesn't render (shows fallback), but component should render without error
      expect(container.querySelector('span')).toBeInTheDocument();
    });

    it('fallback is shown in test environment', () => {
      render(
        <Avatar>
          <AvatarImage src="/test.jpg" alt="Test" />
          <AvatarFallback>T</AvatarFallback>
        </Avatar>
      );
      // In jsdom, fallback is always shown
      expect(screen.getByText('T')).toBeInTheDocument();
    });
  });

  describe('AvatarFallback - Rendering', () => {
    it('renders fallback element', () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('applies fallback styles', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="fallback">JD</AvatarFallback>
        </Avatar>
      );
      const fallback = screen.getByTestId('fallback');
      expect(fallback).toHaveClass('flex');
      expect(fallback).toHaveClass('h-full');
      expect(fallback).toHaveClass('w-full');
      expect(fallback).toHaveClass('items-center');
      expect(fallback).toHaveClass('justify-center');
      expect(fallback).toHaveClass('rounded-full');
      expect(fallback).toHaveClass('font-medium');
    });

    it('applies fallback background color', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="fallback">JD</AvatarFallback>
        </Avatar>
      );
      const fallback = screen.getByTestId('fallback');
      expect(fallback).toHaveClass('bg-neutral-200');
      expect(fallback).toHaveClass('text-neutral-900');
    });

    it('renders single character initials', () => {
      render(
        <Avatar>
          <AvatarFallback>J</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('renders two character initials', () => {
      render(
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText('AB')).toBeInTheDocument();
    });

    it('renders three character initials', () => {
      render(
        <Avatar>
          <AvatarFallback>ABC</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText('ABC')).toBeInTheDocument();
    });
  });

  describe('Fallback Behavior', () => {
    it('shows fallback when image is not provided', () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('shows fallback in test environment', () => {
      render(
        <Avatar>
          <AvatarImage src="/test.jpg" alt="Test" />
          <AvatarFallback>T</AvatarFallback>
        </Avatar>
      );
      // In jsdom, fallback is always shown (images don't load)
      expect(screen.getByText('T')).toBeInTheDocument();
    });
  });

  describe('Composition', () => {
    it('renders avatar with image component and fallback', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarImage src="/user.jpg" alt="User" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByTestId('avatar')).toBeInTheDocument();
      // Fallback is shown in test environment
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('renders avatar with only fallback', () => {
      render(
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText('AB')).toBeInTheDocument();
    });

    it('maintains size when using image and fallback', () => {
      render(
        <Avatar size="lg" data-testid="avatar">
          <AvatarImage src="/test.jpg" alt="Test" />
          <AvatarFallback>T</AvatarFallback>
        </Avatar>
      );
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('h-12');
      expect(avatar).toHaveClass('w-12');
    });
  });

  describe('Dark Mode', () => {
    it('applies dark mode to fallback background', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="fallback">JD</AvatarFallback>
        </Avatar>
      );
      const fallback = screen.getByTestId('fallback');
      expect(fallback).toHaveClass('dark:bg-neutral-700');
      expect(fallback).toHaveClass('dark:text-neutral-100');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to Avatar element', () => {
      const ref = { current: null };
      render(
        <Avatar ref={ref}>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });

    it('forwards ref to AvatarFallback element', () => {
      const ref = { current: null };
      render(
        <Avatar>
          <AvatarFallback ref={ref}>JD</AvatarFallback>
        </Avatar>
      );
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });
  });

  describe('CVA Variants', () => {
    it('exports avatarVariants function', () => {
      expect(typeof avatarVariants).toBe('function');
    });

    it('generates correct classes for size', () => {
      const classes = avatarVariants({ size: 'lg' });
      expect(classes).toContain('h-12');
      expect(classes).toContain('w-12');
      expect(classes).toContain('rounded-full');
    });

    it('generates correct classes for default size', () => {
      const classes = avatarVariants();
      expect(classes).toContain('h-10');
      expect(classes).toContain('w-10');
    });
  });

  describe('Custom className', () => {
    it('merges custom className on Avatar', () => {
      render(
        <Avatar className="border-2" data-testid="avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('border-2');
      expect(avatar).toHaveClass('rounded-full');
    });

    it('merges custom className on AvatarFallback', () => {
      render(
        <Avatar>
          <AvatarFallback className="text-lg" data-testid="fallback">
            JD
          </AvatarFallback>
        </Avatar>
      );
      const fallback = screen.getByTestId('fallback');
      expect(fallback).toHaveClass('text-lg');
      expect(fallback).toHaveClass('bg-neutral-200');
    });
  });

  describe('Common Use Cases', () => {
    it('renders user profile avatar with initials', () => {
      render(
        <Avatar size="md">
          <AvatarImage src="/john-doe.jpg" alt="John Doe" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      // Fallback is shown in test environment
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('renders small avatar for list items', () => {
      render(
        <Avatar size="sm">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText('U')).toBeInTheDocument();
    });

    it('renders large avatar for profile pages', () => {
      render(
        <Avatar size="xl" data-testid="avatar">
          <AvatarImage src="/profile.jpg" alt="Profile" />
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('h-16');
      expect(screen.getByText('AB')).toBeInTheDocument();
    });

    it('renders avatar group member', () => {
      render(
        <div>
          <Avatar size="md">
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <Avatar size="md">
            <AvatarFallback>B</AvatarFallback>
          </Avatar>
          <Avatar size="md">
            <AvatarFallback>C</AvatarFallback>
          </Avatar>
        </div>
      );
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('supports aria-label on Avatar', () => {
      render(
        <Avatar aria-label="User avatar" data-testid="avatar">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByTestId('avatar')).toHaveAttribute('aria-label', 'User avatar');
    });

    it('fallback is accessible via text content', () => {
      render(
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText('AB')).toBeInTheDocument();
    });
  });

  describe('Visual Consistency', () => {
    it('all sizes have rounded-full shape', () => {
      const { rerender } = render(
        <Avatar size="sm" data-testid="avatar">
          <AvatarFallback>S</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByTestId('avatar')).toHaveClass('rounded-full');

      rerender(
        <Avatar size="lg" data-testid="avatar">
          <AvatarFallback>L</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByTestId('avatar')).toHaveClass('rounded-full');
    });

    it('maintains aspect ratio', () => {
      render(
        <Avatar size="md" data-testid="avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('h-10');
      expect(avatar).toHaveClass('w-10');
    });
  });
});
