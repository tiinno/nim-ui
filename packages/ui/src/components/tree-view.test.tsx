import { describe, it, expect, vi } from 'vitest';
import { createRef, useState } from 'react';
import { act, render, screen, userEvent } from '../test/test-utils';
import { TreeView, treeViewVariants, treeItemVariants, type TreeNode } from './tree-view';

const catalog: TreeNode[] = [
  {
    id: 'apparel',
    label: 'Apparel',
    badge: 24,
    children: [
      { id: 'tees', label: 'T-shirts' },
      { id: 'jackets', label: 'Jackets' },
    ],
  },
  {
    id: 'home',
    label: 'Home',
    children: [
      {
        id: 'kitchen',
        label: 'Kitchen',
        children: [{ id: 'cookware', label: 'Cookware' }],
      },
    ],
  },
  { id: 'archive', label: 'Archive', disabled: true },
];

const item = (name: string) => screen.getByRole('treeitem', { name });
const row = (id: string) => screen.getByTestId(`tree-view-row-${id}`);
const focusItem = (name: string) => {
  const element = item(name);
  act(() => {
    element.focus();
  });
  return element;
};

describe('TreeView', () => {
  describe('Rendering', () => {
    it('renders a tree with an accessible name', () => {
      render(<TreeView label="Catalog" data={catalog} />);
      expect(screen.getByRole('tree', { name: 'Catalog' })).toBeInTheDocument();
    });

    it('renders only root items while collapsed', () => {
      render(<TreeView label="Catalog" data={catalog} />);
      expect(screen.getAllByRole('treeitem')).toHaveLength(3);
      expect(screen.queryByRole('treeitem', { name: 'T-shirts' })).not.toBeInTheDocument();
    });

    it('renders expanded children inside a group', () => {
      render(<TreeView label="Catalog" data={catalog} defaultExpandedIds={['apparel']} />);
      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(item('T-shirts')).toBeInTheDocument();
    });

    it('sets aria-level per depth', () => {
      render(<TreeView label="Catalog" data={catalog} defaultExpandedIds={['home', 'kitchen']} />);
      expect(item('Home')).toHaveAttribute('aria-level', '1');
      expect(item('Kitchen')).toHaveAttribute('aria-level', '2');
      expect(item('Cookware')).toHaveAttribute('aria-level', '3');
    });

    it('sets aria-expanded on branches only', () => {
      render(<TreeView label="Catalog" data={catalog} defaultExpandedIds={['apparel']} />);
      expect(item('Apparel')).toHaveAttribute('aria-expanded', 'true');
      expect(item('Home')).toHaveAttribute('aria-expanded', 'false');
      expect(item('T-shirts')).not.toHaveAttribute('aria-expanded');
    });

    it('marks disabled nodes with aria-disabled', () => {
      render(<TreeView label="Catalog" data={catalog} />);
      expect(item('Archive')).toHaveAttribute('aria-disabled', 'true');
      expect(item('Apparel')).not.toHaveAttribute('aria-disabled');
    });

    it('renders icons and badges', () => {
      render(
        <TreeView
          label="Catalog"
          data={[{ id: 'a', label: 'Alpha', icon: <span data-testid="node-icon" />, badge: 7 }]}
        />
      );
      expect(screen.getByTestId('node-icon')).toBeInTheDocument();
      const badge = screen.getByText('7');
      expect(badge).toHaveClass('tabular-nums');
      expect(badge).toHaveClass('bg-neutral-100');
      expect(badge).toHaveClass('dark:bg-neutral-800');
    });

    it('indents by depth and caps the visual indent', () => {
      render(<TreeView label="Catalog" data={catalog} defaultExpandedIds={['home', 'kitchen']} />);
      expect(row('home').querySelectorAll('[data-testid="tree-view-indent"]')).toHaveLength(0);
      expect(row('kitchen').querySelectorAll('[data-testid="tree-view-indent"]')).toHaveLength(1);
      expect(row('cookware').querySelectorAll('[data-testid="tree-view-indent"]')).toHaveLength(2);
    });

    it('renders an empty tree without crashing', () => {
      render(<TreeView label="Empty" data={[]} />);
      expect(screen.getByRole('tree')).toBeEmptyDOMElement();
      expect(screen.queryAllByRole('treeitem')).toHaveLength(0);
    });

    it('names each row from its own label only, even for lookalike ids', () => {
      render(
        <TreeView
          label="Catalog"
          data={[
            { id: 'a b', label: 'Spaced' },
            { id: 'a-b', label: 'Dashed' },
          ]}
        />
      );
      expect(item('Spaced')).toBeInTheDocument();
      expect(item('Dashed')).toBeInTheDocument();
    });

    it('names a branch without its descendants', () => {
      render(<TreeView label="Catalog" data={catalog} defaultExpandedIds={['apparel']} />);
      expect(item('Apparel')).toHaveAccessibleName('Apparel');
    });

    it('renders a self-referencing node once without hanging', () => {
      const cycle: TreeNode = { id: 'loop', label: 'Loop', children: [] };
      cycle.children = [cycle];
      render(<TreeView label="Cycle" data={[cycle]} defaultExpandedIds={['loop']} />);
      expect(screen.getAllByRole('treeitem')).toHaveLength(1);
    });
  });

  describe('Expansion', () => {
    it('toggles a branch from the chevron without selecting it', async () => {
      const user = userEvent.setup();
      render(<TreeView label="Catalog" data={catalog} />);
      await user.click(screen.getByTestId('tree-view-toggle-apparel'));
      expect(item('Apparel')).toHaveAttribute('aria-expanded', 'true');
      expect(item('Apparel')).toHaveAttribute('aria-selected', 'false');
      await user.click(screen.getByTestId('tree-view-toggle-apparel'));
      expect(item('Apparel')).toHaveAttribute('aria-expanded', 'false');
    });

    it('rotates the chevron when expanded', () => {
      render(<TreeView label="Catalog" data={catalog} defaultExpandedIds={['apparel']} />);
      const chevrons = screen.getAllByTestId('tree-view-chevron');
      expect(chevrons[0]).toHaveClass('rotate-90');
      expect(chevrons[0]).toHaveClass('transition-transform');
      expect(chevrons[1]).not.toHaveClass('rotate-90');
    });

    it('supports controlled expansion', async () => {
      const user = userEvent.setup();
      const onExpandedChange = vi.fn();
      render(
        <TreeView
          label="Catalog"
          data={catalog}
          expandedIds={[]}
          onExpandedChange={onExpandedChange}
        />
      );
      await user.click(screen.getByTestId('tree-view-toggle-apparel'));
      expect(onExpandedChange).toHaveBeenCalledWith(['apparel']);
      expect(item('Apparel')).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Selection', () => {
    it('selects a node on click and reports the node', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<TreeView label="Catalog" data={catalog} onSelect={onSelect} />);
      await user.click(row('home'));
      expect(item('Home')).toHaveAttribute('aria-selected', 'true');
      expect(onSelect).toHaveBeenCalledWith('home', expect.objectContaining({ id: 'home' }));
    });

    it('honors defaultSelectedId', () => {
      render(<TreeView label="Catalog" data={catalog} defaultSelectedId="home" />);
      expect(item('Home')).toHaveAttribute('aria-selected', 'true');
    });

    it('supports controlled selection', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<TreeView label="Catalog" data={catalog} selectedId="home" onSelect={onSelect} />);
      await user.click(row('archive'));
      expect(onSelect).not.toHaveBeenCalled();
      await user.click(row('apparel'));
      expect(onSelect).toHaveBeenCalledWith('apparel', expect.objectContaining({ id: 'apparel' }));
      expect(item('Apparel')).toHaveAttribute('aria-selected', 'false');
      expect(item('Home')).toHaveAttribute('aria-selected', 'true');
    });

    it('does not select disabled nodes', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<TreeView label="Catalog" data={catalog} onSelect={onSelect} />);
      await user.click(row('archive'));
      expect(onSelect).not.toHaveBeenCalled();
      expect(item('Archive')).toHaveAttribute('aria-selected', 'false');
    });

    it('applies the steel selection treatment in both themes', () => {
      render(<TreeView label="Catalog" data={catalog} defaultSelectedId="home" />);
      const selected = row('home');
      expect(selected).toHaveClass('bg-primary-100');
      expect(selected).toHaveClass('text-primary-900');
      expect(selected).toHaveClass('dark:bg-primary-500/20');
      expect(selected).toHaveClass('dark:text-primary-100');
      expect(selected).toHaveClass('font-medium');
    });

    it('applies quiet neutral styling to unselected rows', () => {
      render(<TreeView label="Catalog" data={catalog} />);
      const unselected = row('home');
      expect(unselected).toHaveClass('text-neutral-700');
      expect(unselected).toHaveClass('dark:text-neutral-300');
      expect(unselected).toHaveClass('hover:bg-neutral-100');
      expect(unselected).toHaveClass('dark:hover:bg-neutral-900');
    });

    it('styles disabled rows without hover affordance', () => {
      render(<TreeView label="Catalog" data={catalog} />);
      const disabled = row('archive');
      expect(disabled).toHaveClass('cursor-not-allowed');
      expect(disabled).toHaveClass('opacity-50');
      expect(disabled).not.toHaveClass('hover:bg-neutral-100');
    });
  });

  describe('Roving tabindex', () => {
    it('gives exactly one item tabIndex 0', () => {
      render(<TreeView label="Catalog" data={catalog} />);
      const tabbable = screen.getAllByRole('treeitem').filter((el) => el.tabIndex === 0);
      expect(tabbable).toHaveLength(1);
      expect(tabbable[0]).toHaveAccessibleName('Apparel');
    });

    it('moves the tab stop to the selected item', () => {
      render(<TreeView label="Catalog" data={catalog} defaultSelectedId="home" />);
      expect(item('Home').tabIndex).toBe(0);
      expect(item('Apparel').tabIndex).toBe(-1);
      expect(screen.getAllByRole('treeitem').filter((el) => el.tabIndex === 0)).toHaveLength(1);
    });

    it('falls back to the first visible item when the selection is hidden', () => {
      render(<TreeView label="Catalog" data={catalog} selectedId="tees" />);
      expect(item('Apparel').tabIndex).toBe(0);
    });

    it('skips disabled items when picking the tab stop', () => {
      render(
        <TreeView
          label="Catalog"
          data={[
            { id: 'a', label: 'Alpha', disabled: true },
            { id: 'b', label: 'Beta' },
          ]}
        />
      );
      expect(item('Beta').tabIndex).toBe(0);
      expect(item('Alpha').tabIndex).toBe(-1);
    });

    it('still exposes a tab stop when every item is disabled', () => {
      render(
        <TreeView label="Catalog" data={[{ id: 'a', label: 'Alpha', disabled: true }]} />
      );
      expect(screen.getAllByRole('treeitem').filter((el) => el.tabIndex === 0)).toHaveLength(1);
    });

    it('recovers the tab stop when the focused node is collapsed away', async () => {
      const user = userEvent.setup();
      render(<TreeView label="Catalog" data={catalog} defaultExpandedIds={['apparel']} />);
      focusItem('T-shirts');
      expect(item('T-shirts').tabIndex).toBe(0);
      await user.click(screen.getByTestId('tree-view-toggle-apparel'));
      expect(screen.queryByRole('treeitem', { name: 'T-shirts' })).not.toBeInTheDocument();
      const tabbable = screen.getAllByRole('treeitem').filter((el) => el.tabIndex === 0);
      expect(tabbable).toHaveLength(1);
      expect(tabbable[0]).toHaveAccessibleName('Apparel');
    });

    it('follows keyboard focus', async () => {
      const user = userEvent.setup();
      render(<TreeView label="Catalog" data={catalog} />);
      focusItem('Apparel');
      await user.keyboard('{ArrowDown}');
      expect(item('Home').tabIndex).toBe(0);
      expect(item('Apparel').tabIndex).toBe(-1);
    });
  });

  describe('Keyboard navigation', () => {
    it('moves down and up through visible items only', async () => {
      const user = userEvent.setup();
      render(<TreeView label="Catalog" data={catalog} />);
      focusItem('Apparel');
      await user.keyboard('{ArrowDown}');
      expect(item('Home')).toHaveFocus();
      await user.keyboard('{ArrowUp}');
      expect(item('Apparel')).toHaveFocus();
    });

    it('walks into expanded children with ArrowDown', async () => {
      const user = userEvent.setup();
      render(<TreeView label="Catalog" data={catalog} defaultExpandedIds={['apparel']} />);
      focusItem('Apparel');
      await user.keyboard('{ArrowDown}');
      expect(item('T-shirts')).toHaveFocus();
    });

    it('skips disabled items during arrow navigation', async () => {
      const user = userEvent.setup();
      render(<TreeView label="Catalog" data={catalog} />);
      focusItem('Home');
      await user.keyboard('{ArrowDown}');
      expect(item('Home')).toHaveFocus();
      expect(item('Archive')).not.toHaveFocus();
    });

    it('expands a collapsed branch with ArrowRight', async () => {
      const user = userEvent.setup();
      render(<TreeView label="Catalog" data={catalog} />);
      focusItem('Apparel');
      await user.keyboard('{ArrowRight}');
      expect(item('Apparel')).toHaveAttribute('aria-expanded', 'true');
      expect(item('Apparel')).toHaveFocus();
    });

    it('moves to the first child with ArrowRight when already expanded', async () => {
      const user = userEvent.setup();
      render(<TreeView label="Catalog" data={catalog} defaultExpandedIds={['apparel']} />);
      focusItem('Apparel');
      await user.keyboard('{ArrowRight}');
      expect(item('T-shirts')).toHaveFocus();
    });

    it('does nothing on ArrowRight from a leaf', async () => {
      const user = userEvent.setup();
      render(<TreeView label="Catalog" data={catalog} defaultExpandedIds={['apparel']} />);
      focusItem('T-shirts');
      await user.keyboard('{ArrowRight}');
      expect(item('T-shirts')).toHaveFocus();
    });

    it('does nothing on ArrowRight when every child is disabled', async () => {
      const user = userEvent.setup();
      render(
        <TreeView
          label="Catalog"
          data={[
            { id: 'root', label: 'Root', children: [{ id: 'kid', label: 'Kid', disabled: true }] },
          ]}
          defaultExpandedIds={['root']}
        />
      );
      focusItem('Root');
      await user.keyboard('{ArrowRight}');
      expect(item('Root')).toHaveFocus();
    });

    it('collapses an expanded branch with ArrowLeft', async () => {
      const user = userEvent.setup();
      render(<TreeView label="Catalog" data={catalog} defaultExpandedIds={['apparel']} />);
      focusItem('Apparel');
      await user.keyboard('{ArrowLeft}');
      expect(item('Apparel')).toHaveAttribute('aria-expanded', 'false');
    });

    it('moves to the parent with ArrowLeft from a leaf without collapsing it', async () => {
      const user = userEvent.setup();
      render(<TreeView label="Catalog" data={catalog} defaultExpandedIds={['apparel']} />);
      focusItem('T-shirts');
      await user.keyboard('{ArrowLeft}');
      expect(item('Apparel')).toHaveFocus();
      expect(item('Apparel')).toHaveAttribute('aria-expanded', 'true');
    });

    it('moves between siblings with ArrowDown from a nested item', async () => {
      const user = userEvent.setup();
      render(<TreeView label="Catalog" data={catalog} defaultExpandedIds={['apparel']} />);
      focusItem('T-shirts');
      await user.keyboard('{ArrowDown}');
      expect(item('Jackets')).toHaveFocus();
      await user.keyboard('{ArrowUp}');
      expect(item('T-shirts')).toHaveFocus();
    });

    it('leaves a nested branch expanded when ArrowRight walks into it', async () => {
      const user = userEvent.setup();
      render(<TreeView label="Catalog" data={catalog} defaultExpandedIds={['home', 'kitchen']} />);
      focusItem('Kitchen');
      await user.keyboard('{ArrowRight}');
      expect(item('Cookware')).toHaveFocus();
      expect(item('Home')).toHaveAttribute('aria-expanded', 'true');
      expect(item('Kitchen')).toHaveAttribute('aria-expanded', 'true');
    });

    it('jumps to the first and last visible enabled items with Home and End', async () => {
      const user = userEvent.setup();
      render(<TreeView label="Catalog" data={catalog} defaultExpandedIds={['home', 'kitchen']} />);
      focusItem('Home');
      await user.keyboard('{End}');
      expect(item('Cookware')).toHaveFocus();
      await user.keyboard('{Home}');
      expect(item('Apparel')).toHaveFocus();
    });

    it('selects with Enter and Space', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<TreeView label="Catalog" data={catalog} onSelect={onSelect} />);
      focusItem('Home');
      await user.keyboard('{Enter}');
      expect(item('Home')).toHaveAttribute('aria-selected', 'true');
      await user.keyboard('{ArrowUp}');
      await user.keyboard(' ');
      expect(item('Apparel')).toHaveAttribute('aria-selected', 'true');
      expect(onSelect).toHaveBeenCalledTimes(2);
    });

    it('fires selection once when Enter lands on a nested item', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(
        <TreeView
          label="Catalog"
          data={catalog}
          defaultExpandedIds={['apparel']}
          onSelect={onSelect}
        />
      );
      focusItem('T-shirts');
      await user.keyboard('{Enter}');
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith('tees', expect.objectContaining({ id: 'tees' }));
      expect(item('T-shirts')).toHaveAttribute('aria-selected', 'true');
      expect(item('Apparel')).toHaveAttribute('aria-selected', 'false');
    });

    it('does not select a disabled node from the keyboard', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<TreeView label="Catalog" data={catalog} onSelect={onSelect} />);
      focusItem('Archive');
      await user.keyboard('{Enter}');
      expect(onSelect).not.toHaveBeenCalled();
      expect(item('Archive')).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Sizes', () => {
    it('renders md density by default', () => {
      render(<TreeView label="Catalog" data={catalog} />);
      expect(screen.getByRole('tree')).toHaveClass('text-sm');
      expect(row('apparel')).toHaveClass('h-8');
      expect(row('apparel')).toHaveClass('gap-2');
    });

    it('renders sm density', () => {
      render(<TreeView label="Catalog" data={catalog} size="sm" />);
      expect(screen.getByRole('tree')).toHaveClass('text-xs');
      expect(row('apparel')).toHaveClass('h-7');
      expect(row('apparel')).toHaveClass('gap-1.5');
    });
  });

  describe('Focus ring', () => {
    it('scopes the steel focus ring to the row in both themes', () => {
      render(<TreeView label="Catalog" data={catalog} />);
      const treeitem = item('Apparel');
      expect(treeitem).toHaveClass('[&:focus-visible>div]:ring-2');
      // Both halves of the pair, mirroring the ring-offset override on the same line.
      expect(treeitem).toHaveClass('[&:focus-visible>div]:ring-primary-500');
      expect(treeitem).toHaveClass('dark:[&:focus-visible>div]:ring-primary-400');
      expect(treeitem).toHaveClass('[&:focus-visible>div]:ring-offset-2');
      expect(treeitem).toHaveClass('dark:[&:focus-visible>div]:ring-offset-neutral-950');
    });
  });

  describe('Controlled integration', () => {
    it('drives expansion and selection from parent state', async () => {
      const user = userEvent.setup();
      function Harness() {
        const [expandedIds, setExpandedIds] = useState<string[]>([]);
        const [selected, setSelected] = useState<string | undefined>(undefined);
        return (
          <TreeView
            label="Catalog"
            data={catalog}
            expandedIds={expandedIds}
            onExpandedChange={setExpandedIds}
            selectedId={selected}
            onSelect={(id) => setSelected(id)}
          />
        );
      }
      render(<Harness />);
      await user.click(screen.getByTestId('tree-view-toggle-apparel'));
      expect(item('T-shirts')).toBeInTheDocument();
      await user.click(row('tees'));
      expect(item('T-shirts')).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to the tree element', () => {
      const ref = createRef<HTMLUListElement>();
      render(<TreeView ref={ref} label="Catalog" data={catalog} />);
      expect(ref.current).toBeInstanceOf(HTMLUListElement);
      expect(ref.current).toHaveAttribute('role', 'tree');
    });
  });

  describe('Variant functions', () => {
    it('treeViewVariants returns root classes', () => {
      const result = treeViewVariants({ size: 'sm' });
      expect(result).toContain('text-xs');
      expect(result).toContain('select-none');
    });

    it('treeItemVariants returns selected row classes', () => {
      const result = treeItemVariants({ size: 'md', selected: true });
      expect(result).toContain('bg-primary-100');
      expect(result).toContain('dark:bg-primary-500/20');
      expect(result).not.toContain('hover:bg-neutral-100');
    });

    it('treeItemVariants returns disabled row classes', () => {
      const result = treeItemVariants({ disabled: true });
      expect(result).toContain('cursor-not-allowed');
      expect(result).not.toContain('hover:bg-neutral-100');
    });
  });

  describe('Customization', () => {
    it('merges custom className on the root', () => {
      render(<TreeView label="Catalog" data={catalog} className="max-w-xs" />);
      const tree = screen.getByRole('tree');
      expect(tree).toHaveClass('max-w-xs');
      expect(tree).toHaveClass('w-full');
    });

    it('passes through HTML attributes', () => {
      render(<TreeView label="Catalog" data={catalog} id="catalog-tree" data-scope="nav" />);
      const tree = screen.getByRole('tree');
      expect(tree).toHaveAttribute('id', 'catalog-tree');
      expect(tree).toHaveAttribute('data-scope', 'nav');
    });
  });
});
