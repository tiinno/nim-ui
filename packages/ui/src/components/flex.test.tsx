import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { Flex, flexVariants } from './flex';

describe('Flex', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(
        <Flex>
          <div>Item 1</div>
          <div>Item 2</div>
        </Flex>
      );
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('applies base flex styles', () => {
      render(<Flex data-testid="flex">Content</Flex>);
      expect(screen.getByTestId('flex')).toHaveClass('flex');
    });

    it('applies default direction (row)', () => {
      render(<Flex data-testid="flex">Content</Flex>);
      expect(screen.getByTestId('flex')).toHaveClass('flex-row');
    });

    it('applies default wrap (false)', () => {
      render(<Flex data-testid="flex">Content</Flex>);
      expect(screen.getByTestId('flex')).toHaveClass('flex-nowrap');
    });
  });

  describe('Direction Variants', () => {
    it.each([
      ['row', 'flex-row'],
      ['column', 'flex-col'],
      ['row-reverse', 'flex-row-reverse'],
      ['column-reverse', 'flex-col-reverse'],
    ])('renders %s direction', (direction, expectedClass) => {
      render(
        <Flex direction={direction as any} data-testid="flex">
          Content
        </Flex>
      );
      expect(screen.getByTestId('flex')).toHaveClass(expectedClass);
    });

    it('applies row direction', () => {
      render(<Flex direction="row" data-testid="flex">Content</Flex>);
      expect(screen.getByTestId('flex')).toHaveClass('flex-row');
    });

    it('applies column direction', () => {
      render(<Flex direction="column" data-testid="flex">Content</Flex>);
      expect(screen.getByTestId('flex')).toHaveClass('flex-col');
    });

    it('applies row-reverse direction', () => {
      render(<Flex direction="row-reverse" data-testid="flex">Content</Flex>);
      expect(screen.getByTestId('flex')).toHaveClass('flex-row-reverse');
    });

    it('applies column-reverse direction', () => {
      render(<Flex direction="column-reverse" data-testid="flex">Content</Flex>);
      expect(screen.getByTestId('flex')).toHaveClass('flex-col-reverse');
    });
  });

  describe('Justify Variants', () => {
    it.each([
      ['start', 'justify-start'],
      ['center', 'justify-center'],
      ['end', 'justify-end'],
      ['between', 'justify-between'],
      ['around', 'justify-around'],
      ['evenly', 'justify-evenly'],
    ])('renders %s justify variant', (justify, expectedClass) => {
      render(
        <Flex justify={justify as any} data-testid="flex">
          Content
        </Flex>
      );
      expect(screen.getByTestId('flex')).toHaveClass(expectedClass);
    });

    it('applies justify start', () => {
      render(<Flex justify="start" data-testid="flex">Content</Flex>);
      expect(screen.getByTestId('flex')).toHaveClass('justify-start');
    });

    it('applies justify center', () => {
      render(<Flex justify="center" data-testid="flex">Content</Flex>);
      expect(screen.getByTestId('flex')).toHaveClass('justify-center');
    });

    it('applies justify between', () => {
      render(<Flex justify="between" data-testid="flex">Content</Flex>);
      expect(screen.getByTestId('flex')).toHaveClass('justify-between');
    });

    it('applies justify around', () => {
      render(<Flex justify="around" data-testid="flex">Content</Flex>);
      expect(screen.getByTestId('flex')).toHaveClass('justify-around');
    });

    it('applies justify evenly', () => {
      render(<Flex justify="evenly" data-testid="flex">Content</Flex>);
      expect(screen.getByTestId('flex')).toHaveClass('justify-evenly');
    });
  });

  describe('Align Variants', () => {
    it.each([
      ['start', 'items-start'],
      ['center', 'items-center'],
      ['end', 'items-end'],
      ['stretch', 'items-stretch'],
      ['baseline', 'items-baseline'],
    ])('renders %s align variant', (align, expectedClass) => {
      render(
        <Flex align={align as any} data-testid="flex">
          Content
        </Flex>
      );
      expect(screen.getByTestId('flex')).toHaveClass(expectedClass);
    });

    it('applies align start', () => {
      render(<Flex align="start" data-testid="flex">Content</Flex>);
      expect(screen.getByTestId('flex')).toHaveClass('items-start');
    });

    it('applies align center', () => {
      render(<Flex align="center" data-testid="flex">Content</Flex>);
      expect(screen.getByTestId('flex')).toHaveClass('items-center');
    });

    it('applies align baseline', () => {
      render(<Flex align="baseline" data-testid="flex">Content</Flex>);
      expect(screen.getByTestId('flex')).toHaveClass('items-baseline');
    });
  });

  describe('Wrap Variants', () => {
    it('applies nowrap by default', () => {
      render(<Flex data-testid="flex">Content</Flex>);
      expect(screen.getByTestId('flex')).toHaveClass('flex-nowrap');
    });

    it('applies wrap when true', () => {
      render(<Flex wrap={true} data-testid="flex">Content</Flex>);
      expect(screen.getByTestId('flex')).toHaveClass('flex-wrap');
    });

    it('applies nowrap when false', () => {
      render(<Flex wrap={false} data-testid="flex">Content</Flex>);
      expect(screen.getByTestId('flex')).toHaveClass('flex-nowrap');
    });
  });

  describe('Gap Variants', () => {
    it.each([
      ['none', 'gap-0'],
      ['xs', 'gap-1'],
      ['sm', 'gap-2'],
      ['md', 'gap-4'],
      ['lg', 'gap-6'],
      ['xl', 'gap-8'],
    ])('renders %s gap variant', (gap, expectedClass) => {
      render(
        <Flex gap={gap as any} data-testid="flex">
          Content
        </Flex>
      );
      expect(screen.getByTestId('flex')).toHaveClass(expectedClass);
    });

    it('applies no gap', () => {
      render(<Flex gap="none" data-testid="flex">Content</Flex>);
      expect(screen.getByTestId('flex')).toHaveClass('gap-0');
    });

    it('applies small gap', () => {
      render(<Flex gap="sm" data-testid="flex">Content</Flex>);
      expect(screen.getByTestId('flex')).toHaveClass('gap-2');
    });

    it('applies large gap', () => {
      render(<Flex gap="lg" data-testid="flex">Content</Flex>);
      expect(screen.getByTestId('flex')).toHaveClass('gap-6');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to div element', () => {
      const ref = { current: null };
      render(<Flex ref={ref}>Content</Flex>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CVA Variants', () => {
    it('exports flexVariants function', () => {
      expect(typeof flexVariants).toBe('function');
    });

    it('generates correct base classes', () => {
      const classes = flexVariants();
      expect(classes).toContain('flex');
    });

    it('generates correct direction classes', () => {
      const row = flexVariants({ direction: 'row' });
      expect(row).toContain('flex-row');

      const column = flexVariants({ direction: 'column' });
      expect(column).toContain('flex-col');
    });

    it('generates correct justify classes', () => {
      const center = flexVariants({ justify: 'center' });
      expect(center).toContain('justify-center');

      const between = flexVariants({ justify: 'between' });
      expect(between).toContain('justify-between');
    });

    it('generates correct align classes', () => {
      const alignCenter = flexVariants({ align: 'center' });
      expect(alignCenter).toContain('items-center');

      const alignEnd = flexVariants({ align: 'end' });
      expect(alignEnd).toContain('items-end');
    });

    it('generates correct wrap classes', () => {
      const wrap = flexVariants({ wrap: true });
      expect(wrap).toContain('flex-wrap');

      const nowrap = flexVariants({ wrap: false });
      expect(nowrap).toContain('flex-nowrap');
    });

    it('generates correct gap classes', () => {
      const gapMd = flexVariants({ gap: 'md' });
      expect(gapMd).toContain('gap-4');

      const gapLg = flexVariants({ gap: 'lg' });
      expect(gapLg).toContain('gap-6');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(
        <Flex className="p-4 bg-gray-50" data-testid="flex">
          Content
        </Flex>
      );
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('p-4');
      expect(flex).toHaveClass('bg-gray-50');
      expect(flex).toHaveClass('flex');
    });
  });

  describe('HTML Attributes', () => {
    it('supports data attributes', () => {
      render(
        <Flex data-testid="flex" data-layout="horizontal">
          Content
        </Flex>
      );
      expect(screen.getByTestId('flex')).toHaveAttribute('data-layout', 'horizontal');
    });

    it('supports aria attributes', () => {
      render(
        <Flex aria-label="Toolbar" data-testid="flex">
          Content
        </Flex>
      );
      expect(screen.getByTestId('flex')).toHaveAttribute('aria-label', 'Toolbar');
    });

    it('supports id attribute', () => {
      render(<Flex id="toolbar">Content</Flex>);
      expect(document.getElementById('toolbar')).toBeInTheDocument();
    });
  });

  describe('Common Use Cases', () => {
    it('renders space-between header', () => {
      render(
        <Flex justify="between" align="center">
          <span>Logo</span>
          <nav>Menu</nav>
        </Flex>
      );
      expect(screen.getByText('Logo')).toBeInTheDocument();
      expect(screen.getByText('Menu')).toBeInTheDocument();
    });

    it('renders centered content', () => {
      render(
        <Flex justify="center" align="center" data-testid="flex">
          <h1>Centered Title</h1>
        </Flex>
      );
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('justify-center');
      expect(flex).toHaveClass('items-center');
    });

    it('renders button group', () => {
      render(
        <Flex gap="sm">
          <button>Edit</button>
          <button>Delete</button>
          <button>Share</button>
        </Flex>
      );
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.getByText('Share')).toBeInTheDocument();
    });
  });

  describe('Combination of Variants', () => {
    it('applies multiple variants together', () => {
      render(
        <Flex
          direction="row"
          justify="between"
          align="center"
          gap="md"
          data-testid="flex"
        >
          Content
        </Flex>
      );
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('flex-row');
      expect(flex).toHaveClass('justify-between');
      expect(flex).toHaveClass('items-center');
      expect(flex).toHaveClass('gap-4');
    });

    it('renders column with centered content and large gap', () => {
      render(
        <Flex
          direction="column"
          justify="center"
          align="center"
          gap="lg"
          data-testid="flex"
        >
          Content
        </Flex>
      );
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('flex-col');
      expect(flex).toHaveClass('justify-center');
      expect(flex).toHaveClass('items-center');
      expect(flex).toHaveClass('gap-6');
    });
  });

  describe('Wrap Behavior', () => {
    it('renders wrapping flex container', () => {
      render(
        <Flex wrap={true} gap="sm" data-testid="flex">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i}>Item {i}</div>
          ))}
        </Flex>
      );
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('flex-wrap');
    });
  });
});
