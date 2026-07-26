import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * TreeView component for hierarchical data
 *
 * Renders category pickers, permission trees, and file-like structures with
 * the full WAI-ARIA tree keyboard model: roving tabindex, arrow navigation
 * across visible items only, Home/End, and Enter/Space to select. Distinct
 * from Accordion, which discloses independent panels of prose rather than
 * exposing a single navigable, selectable hierarchy.
 *
 * @example
 * // Uncontrolled category picker
 * <TreeView
 *   label="Catalog"
 *   data={[{ id: 'apparel', label: 'Apparel', children: [{ id: 'tees', label: 'T-shirts' }] }]}
 *   defaultExpandedIds={['apparel']}
 *   defaultSelectedId="tees"
 * />
 *
 * @example
 * // Controlled selection + expansion
 * <TreeView
 *   label="Permissions"
 *   data={nodes}
 *   expandedIds={expanded}
 *   onExpandedChange={setExpanded}
 *   selectedId={selected}
 *   onSelect={(id) => setSelected(id)}
 * />
 *
 * @example
 * // Compact density with counts
 * <TreeView size="sm" label="Regions" data={[{ id: 'emea', label: 'EMEA', badge: 12 }]} />
 */

/** Maximum traversal depth — protects against malformed, deeply self-nesting data */
const MAX_DEPTH = 100;
/** Visual indent stops; deeper levels stay truthful in `aria-level` but stop indenting */
const MAX_INDENT = 8;

/** A single node in the tree. Every `id` must be unique across the whole tree. */
export interface TreeNode {
  /** Unique identifier — duplicates are dropped during traversal */
  id: string;
  /** Visible label content */
  label: React.ReactNode;
  /** Child nodes; omit or leave empty for a leaf */
  children?: TreeNode[];
  /** Leading icon rendered before the label */
  icon?: React.ReactNode;
  /** Trailing content, typically a count */
  badge?: React.ReactNode;
  /** Non-selectable and skipped by arrow navigation */
  disabled?: boolean;
}

interface TreeViewNode {
  node: TreeNode;
  /** Position in the visible pre-order list — used for collision-free label ids */
  index: number;
  level: number;
  parentId: string | null;
  hasChildren: boolean;
  expanded: boolean;
  children: TreeViewNode[];
}

const treeViewVariants = cva('w-full min-w-0 select-none', {
  variants: {
    size: {
      sm: 'space-y-px text-xs',
      md: 'space-y-0.5 text-sm',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const treeItemVariants = cva(
  'flex w-full min-w-0 items-center rounded-md text-left transition-colors duration-(--duration-fast)',
  {
    variants: {
      size: {
        sm: 'h-7 gap-1.5 px-1.5 text-xs',
        md: 'h-8 gap-2 px-2 text-sm',
      },
      selected: {
        true: 'bg-primary-100 font-medium text-primary-900 dark:bg-primary-500/20 dark:text-primary-100',
        false: 'text-neutral-700 dark:text-neutral-300',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50',
        false: 'cursor-pointer',
      },
    },
    compoundVariants: [
      {
        selected: false,
        disabled: false,
        className:
          'hover:bg-neutral-100 hover:text-neutral-950 dark:hover:bg-neutral-900 dark:hover:text-neutral-50',
      },
    ],
    defaultVariants: {
      size: 'md',
      selected: false,
      disabled: false,
    },
  }
);

export interface TreeViewProps
  extends Omit<React.HTMLAttributes<HTMLUListElement>, 'onSelect'>,
    VariantProps<typeof treeViewVariants> {
  /** Hierarchical node data */
  data: TreeNode[];
  /** Accessible name for the tree */
  label: string;
  /** Initially expanded branch ids (uncontrolled) */
  defaultExpandedIds?: string[];
  /** Expanded branch ids (controlled) */
  expandedIds?: string[];
  /** Fires whenever the expanded set changes */
  onExpandedChange?: (ids: string[]) => void;
  /** Initially selected node id (uncontrolled) */
  defaultSelectedId?: string;
  /** Selected node id (controlled) */
  selectedId?: string;
  /** Fires when a node is selected via click, Enter, or Space */
  onSelect?: (id: string, node: TreeNode) => void;
  /** Row density */
  size?: 'sm' | 'md';
}

/** Builds the render tree and its pre-order flat list of visible items. */
function buildTree(data: TreeNode[], expandedSet: Set<string>) {
  const flat: TreeViewNode[] = [];
  const seen = new Set<string>();

  const walk = (nodes: TreeNode[] | undefined, level: number, parentId: string | null) => {
    const result: TreeViewNode[] = [];
    if (!Array.isArray(nodes) || nodes.length === 0 || level > MAX_DEPTH) return result;

    for (const node of nodes) {
      if (!node || typeof node.id !== 'string' || seen.has(node.id)) continue;
      seen.add(node.id);

      const hasChildren = Array.isArray(node.children) && node.children.length > 0;
      const expanded = hasChildren && expandedSet.has(node.id);
      const view: TreeViewNode = {
        node,
        index: flat.length,
        level,
        parentId,
        hasChildren,
        expanded,
        children: [],
      };
      result.push(view);
      flat.push(view);
      if (expanded) {
        view.children = walk(node.children, level + 1, node.id);
      }
    }
    return result;
  };

  return { tree: walk(data, 1, null), flat };
}

const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    data-testid="tree-view-chevron"
    className={cn(
      'shrink-0 transition-transform duration-(--duration-fast) ease-out',
      expanded && 'rotate-90'
    )}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const TreeView = React.forwardRef<HTMLUListElement, TreeViewProps>(
  (
    {
      className,
      data,
      label,
      defaultExpandedIds,
      expandedIds,
      onExpandedChange,
      defaultSelectedId,
      selectedId,
      onSelect,
      size = 'md',
      ...props
    },
    ref
  ) => {
    const baseId = React.useId();
    const itemRefs = React.useRef<Map<string, HTMLLIElement>>(new Map());
    const [focusedId, setFocusedId] = React.useState<string | null>(null);
    const [uncontrolledExpanded, setUncontrolledExpanded] = React.useState<string[]>(
      defaultExpandedIds ?? []
    );
    const [uncontrolledSelected, setUncontrolledSelected] = React.useState<string | undefined>(
      defaultSelectedId
    );

    const isExpandedControlled = expandedIds !== undefined;
    const isSelectedControlled = selectedId !== undefined;
    const expanded = isExpandedControlled ? expandedIds : uncontrolledExpanded;
    const selected = isSelectedControlled ? selectedId : uncontrolledSelected;

    const expandedSet = React.useMemo(() => new Set(expanded ?? []), [expanded]);
    const { tree, flat } = React.useMemo(
      () => buildTree(Array.isArray(data) ? data : [], expandedSet),
      [data, expandedSet]
    );

    const tabbableId = React.useMemo(() => {
      if (flat.length === 0) return null;
      const enabled = flat.filter((item) => !item.node.disabled);
      if (focusedId && enabled.some((item) => item.node.id === focusedId)) return focusedId;
      if (selected && enabled.some((item) => item.node.id === selected)) return selected;
      // Fall back to the first visible item so the tree always has one tab stop
      return enabled[0]?.node.id ?? flat[0]?.node.id ?? null;
    }, [flat, focusedId, selected]);

    const setExpanded = React.useCallback(
      (next: string[]) => {
        if (!isExpandedControlled) setUncontrolledExpanded(next);
        onExpandedChange?.(next);
      },
      [isExpandedControlled, onExpandedChange]
    );

    const toggleExpanded = React.useCallback(
      (id: string, force?: boolean) => {
        const isOpen = expandedSet.has(id);
        const shouldOpen = force ?? !isOpen;
        if (shouldOpen === isOpen) return;
        const current = expanded ?? [];
        setExpanded(shouldOpen ? [...current, id] : current.filter((entry) => entry !== id));
      },
      [expanded, expandedSet, setExpanded]
    );

    const selectNode = React.useCallback(
      (item: TreeViewNode) => {
        if (item.node.disabled) return;
        if (!isSelectedControlled) setUncontrolledSelected(item.node.id);
        onSelect?.(item.node.id, item.node);
      },
      [isSelectedControlled, onSelect]
    );

    const focusItem = React.useCallback((id: string | undefined) => {
      if (!id) return;
      setFocusedId(id);
      itemRefs.current.get(id)?.focus();
    }, []);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLLIElement>, item: TreeViewNode) => {
      // Child treeitems are DOM descendants of their parent `li`, so a keystroke on a
      // nested row would otherwise bubble up and be re-handled by every ancestor row.
      if (event.target !== event.currentTarget) return;
      const index = item.index;
      const enabled = flat.filter((entry) => !entry.node.disabled);

      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          const next = flat.slice(index + 1).find((entry) => !entry.node.disabled);
          focusItem(next?.node.id);
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();
          const previous = [...flat.slice(0, index)]
            .reverse()
            .find((entry) => !entry.node.disabled);
          focusItem(previous?.node.id);
          break;
        }
        case 'ArrowRight': {
          event.preventDefault();
          if (!item.hasChildren) break;
          if (!item.expanded) {
            toggleExpanded(item.node.id, true);
          } else {
            const firstChild = flat.find(
              (entry) => entry.parentId === item.node.id && !entry.node.disabled
            );
            focusItem(firstChild?.node.id);
          }
          break;
        }
        case 'ArrowLeft': {
          event.preventDefault();
          if (item.hasChildren && item.expanded) {
            toggleExpanded(item.node.id, false);
          } else if (item.parentId) {
            focusItem(item.parentId);
          }
          break;
        }
        case 'Home': {
          event.preventDefault();
          focusItem(enabled[0]?.node.id);
          break;
        }
        case 'End': {
          event.preventDefault();
          focusItem(enabled[enabled.length - 1]?.node.id);
          break;
        }
        case 'Enter':
        case ' ': {
          event.preventDefault();
          selectNode(item);
          break;
        }
        default:
          break;
      }
    };

    const renderItems = (items: TreeViewNode[]): React.ReactNode =>
      items.map((item) => {
        const { node } = item;
        const isSelected = selected === node.id;
        const isDisabled = Boolean(node.disabled);
        const labelId = `${baseId}-label-${item.index}`;
        const indent = Math.max(0, Math.min(item.level - 1, MAX_INDENT));

        return (
          <li
            key={node.id}
            ref={(element) => {
              if (element) itemRefs.current.set(node.id, element);
              else itemRefs.current.delete(node.id);
            }}
            role="treeitem"
            aria-labelledby={labelId}
            aria-level={item.level}
            aria-selected={isSelected}
            aria-expanded={item.hasChildren ? item.expanded : undefined}
            aria-disabled={isDisabled || undefined}
            tabIndex={tabbableId === node.id ? 0 : -1}
            onKeyDown={(event) => handleKeyDown(event, item)}
            onFocus={(event) => {
              if (event.target === event.currentTarget) setFocusedId(node.id);
            }}
            className="block outline-none [&:focus-visible>div]:ring-2 [&:focus-visible>div]:ring-primary-400 [&:focus-visible>div]:ring-offset-2 dark:[&:focus-visible>div]:ring-offset-neutral-950"
          >
            <div
              data-testid={`tree-view-row-${node.id}`}
              onClick={() => selectNode(item)}
              className={cn(
                treeItemVariants({ size, selected: isSelected, disabled: isDisabled })
              )}
            >
              {Array.from({ length: indent }).map((_, spacer) => (
                <span
                  key={spacer}
                  aria-hidden="true"
                  data-testid="tree-view-indent"
                  className="w-4 shrink-0"
                />
              ))}
              {item.hasChildren ? (
                <span
                  aria-hidden="true"
                  data-testid={`tree-view-toggle-${node.id}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleExpanded(node.id);
                  }}
                  className="flex size-4 shrink-0 items-center justify-center rounded-sm text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200"
                >
                  <ChevronIcon expanded={item.expanded} />
                </span>
              ) : (
                <span aria-hidden="true" className="size-4 shrink-0" />
              )}
              {node.icon && (
                <span
                  aria-hidden="true"
                  className="flex size-4 shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-400"
                >
                  {node.icon}
                </span>
              )}
              <span id={labelId} className="min-w-0 flex-1 truncate">
                {node.label}
              </span>
              {node.badge !== undefined && node.badge !== null && (
                <span className="ml-auto shrink-0 rounded-full bg-neutral-100 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {node.badge}
                </span>
              )}
            </div>
            {item.hasChildren && item.expanded && item.children.length > 0 && (
              <ul role="group" className={cn(size === 'sm' ? 'space-y-px' : 'space-y-0.5', 'mt-px')}>
                {renderItems(item.children)}
              </ul>
            )}
          </li>
        );
      });

    return (
      <ul
        ref={ref}
        role="tree"
        aria-label={label}
        className={cn(treeViewVariants({ size }), className)}
        {...props}
      >
        {renderItems(tree)}
      </ul>
    );
  }
);
TreeView.displayName = 'TreeView';

export { TreeView, treeViewVariants, treeItemVariants };
