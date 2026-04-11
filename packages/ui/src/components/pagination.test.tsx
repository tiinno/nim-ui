import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  usePagination,
} from './pagination';

describe('Pagination', () => {
  describe('Rendering', () => {
    it('renders navigation landmark', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      expect(screen.getByRole('navigation')).toHaveAttribute(
        'aria-label',
        'pagination'
      );
    });

    it('renders page links', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('Active state', () => {
    it('sets aria-current="page" when isActive', () => {
      render(<PaginationLink href="#" isActive>5</PaginationLink>);
      expect(screen.getByText('5')).toHaveAttribute('aria-current', 'page');
    });

    it('does not set aria-current when not active', () => {
      render(<PaginationLink href="#">5</PaginationLink>);
      expect(screen.getByText('5')).not.toHaveAttribute('aria-current');
    });
  });

  describe('Previous and Next', () => {
    it('Previous has aria-label', () => {
      render(<PaginationPrevious href="#" />);
      expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument();
    });

    it('Next has aria-label', () => {
      render(<PaginationNext href="#" />);
      expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();
    });

    it('Previous renders default label', () => {
      render(<PaginationPrevious href="#" />);
      expect(screen.getByText('Previous')).toBeInTheDocument();
    });

    it('Next renders default label', () => {
      render(<PaginationNext href="#" />);
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('Previous accepts custom children', () => {
      render(<PaginationPrevious href="#">Prev</PaginationPrevious>);
      expect(screen.getByText('Prev')).toBeInTheDocument();
    });
  });

  describe('Ellipsis', () => {
    it('renders ellipsis marker', () => {
      render(<PaginationEllipsis data-testid="ellipsis" />);
      expect(screen.getByTestId('ellipsis')).toBeInTheDocument();
      expect(screen.getByText('More pages')).toBeInTheDocument();
    });

    it('ellipsis is aria-hidden', () => {
      render(<PaginationEllipsis data-testid="ellipsis" />);
      expect(screen.getByTestId('ellipsis')).toHaveAttribute(
        'aria-hidden',
        'true'
      );
    });
  });

  describe('Click handlers', () => {
    it('handles click on link', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <PaginationLink href="#" onClick={handleClick}>
          3
        </PaginationLink>
      );
      await user.click(screen.getByText('3'));
      expect(handleClick).toHaveBeenCalled();
    });
  });
});

describe('usePagination helper', () => {
  it('returns empty array for 0 pages', () => {
    expect(usePagination({ totalPages: 0, currentPage: 1 })).toEqual([]);
  });

  it('returns [1] for single page', () => {
    expect(usePagination({ totalPages: 1, currentPage: 1 })).toEqual([1]);
  });

  it('returns full range when total <= totalSlots', () => {
    expect(usePagination({ totalPages: 5, currentPage: 3 })).toEqual([
      1, 2, 3, 4, 5,
    ]);
  });

  it('adds ellipsis on right when current is near start', () => {
    const result = usePagination({ totalPages: 20, currentPage: 2 });
    expect(result[0]).toBe(1);
    expect(result[result.length - 1]).toBe(20);
    expect(result).toContain('ellipsis');
  });

  it('adds ellipsis on left when current is near end', () => {
    const result = usePagination({ totalPages: 20, currentPage: 19 });
    expect(result[0]).toBe(1);
    expect(result[result.length - 1]).toBe(20);
    expect(result).toContain('ellipsis');
  });

  it('adds ellipsis on both sides when current is in middle', () => {
    const result = usePagination({
      totalPages: 20,
      currentPage: 10,
      siblingCount: 1,
    });
    expect(result[0]).toBe(1);
    expect(result[result.length - 1]).toBe(20);
    expect(result).toContain(9);
    expect(result).toContain(10);
    expect(result).toContain(11);
    const ellipsisCount = result.filter((r) => r === 'ellipsis').length;
    expect(ellipsisCount).toBe(2);
  });

  it('respects siblingCount', () => {
    const result = usePagination({
      totalPages: 20,
      currentPage: 10,
      siblingCount: 2,
    });
    expect(result).toContain(8);
    expect(result).toContain(9);
    expect(result).toContain(10);
    expect(result).toContain(11);
    expect(result).toContain(12);
  });
});

