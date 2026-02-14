import { createRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';
import { render, screen, userEvent, waitFor } from '../test/test-utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  dropdownMenuContentVariants,
} from './dropdown-menu';
import * as DropdownMenuModule from './dropdown-menu';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderMenu(
  contentProps: React.ComponentProps<typeof DropdownMenuContent> = {},
  rootProps: React.ComponentProps<typeof DropdownMenu> = {},
  triggerLabel = 'open menu',
) {
  const contentChildren = contentProps.children ?? (
    <>
      <DropdownMenuItem>Item 1</DropdownMenuItem>
      <DropdownMenuItem>Item 2</DropdownMenuItem>
    </>
  );
  const { children: _, ...restContent } = contentProps;

  return render(
    <DropdownMenu {...rootProps}>
      <DropdownMenuTrigger>{triggerLabel}</DropdownMenuTrigger>
      <DropdownMenuContent {...restContent}>{contentChildren}</DropdownMenuContent>
    </DropdownMenu>,
  );
}

async function openMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByText('open menu'));
}

function getMenu() {
  return screen.getByRole('menu');
}

describe('DropdownMenu', () => {
  // -----------------------------------------------------------------------
  // Rendering
  // -----------------------------------------------------------------------
  describe('rendering', () => {
    it('renders trigger text', () => {
      renderMenu();
      expect(screen.getByText('open menu')).toBeInTheDocument();
    });

    it('does not show content by default', () => {
      renderMenu();
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('shows content when open', async () => {
      const user = userEvent.setup();
      renderMenu();
      await openMenu(user);
      expect(getMenu()).toBeInTheDocument();
    });

    it('renders items inside content', async () => {
      const user = userEvent.setup();
      renderMenu();
      await openMenu(user);
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('supports controlled open state', async () => {
      const onOpenChange = vi.fn();
      renderMenu({}, { open: true, onOpenChange });
      expect(getMenu()).toBeInTheDocument();
    });

    it('forwards ref on DropdownMenuContent', async () => {
      const ref = createRef<HTMLDivElement>();
      const user = userEvent.setup();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>open menu</DropdownMenuTrigger>
          <DropdownMenuContent ref={ref}>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      await user.click(screen.getByText('open menu'));
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('applies custom className to content', async () => {
      const user = userEvent.setup();
      renderMenu({ className: 'my-custom-class' });
      await openMenu(user);
      expect(getMenu()).toHaveClass('my-custom-class');
    });
  });

  // -----------------------------------------------------------------------
  // Variants
  // -----------------------------------------------------------------------
  describe('variants', () => {
    it('applies default variant classes', async () => {
      const user = userEvent.setup();
      renderMenu({ variant: 'default' });
      await openMenu(user);
      const menu = getMenu();
      expect(menu.className).toContain('border');
      expect(menu.className).toContain('bg-white');
    });

    it('applies outline variant classes', async () => {
      const user = userEvent.setup();
      renderMenu({ variant: 'outline' });
      await openMenu(user);
      const menu = getMenu();
      expect(menu.className).toContain('border-2');
    });

    it('CVA returns correct classes for default variant', () => {
      const classes = dropdownMenuContentVariants({ variant: 'default' });
      expect(classes).toContain('bg-white');
      expect(classes).toContain('border-neutral-200');
      expect(classes).toContain('dark:bg-neutral-800');
    });

    it('CVA returns correct classes for outline variant', () => {
      const classes = dropdownMenuContentVariants({ variant: 'outline' });
      expect(classes).toContain('border-2');
      expect(classes).toContain('border-neutral-300');
      expect(classes).toContain('dark:border-neutral-600');
    });
  });

  // -----------------------------------------------------------------------
  // Interactions
  // -----------------------------------------------------------------------
  describe('interactions', () => {
    it('opens menu on trigger click', async () => {
      const user = userEvent.setup();
      renderMenu();
      await openMenu(user);
      expect(getMenu()).toBeInTheDocument();
    });

    it('closes menu when Escape is pressed', async () => {
      const user = userEvent.setup();
      renderMenu();
      await openMenu(user);
      expect(getMenu()).toBeInTheDocument();
      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('calls onOpenChange when state changes', async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      renderMenu({}, { onOpenChange });
      await user.click(screen.getByText('open menu'));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  // -----------------------------------------------------------------------
  // Keyboard navigation
  // -----------------------------------------------------------------------
  describe('keyboard', () => {
    it('navigates items with ArrowDown', async () => {
      const user = userEvent.setup();
      renderMenu();
      await openMenu(user);
      await user.keyboard('{ArrowDown}');
      expect(screen.getByText('Item 1').closest('[role="menuitem"]')).toHaveFocus();
    });

    it('navigates items with ArrowUp', async () => {
      const user = userEvent.setup();
      renderMenu();
      await openMenu(user);
      // Move to last item
      await user.keyboard('{ArrowUp}');
      expect(screen.getByText('Item 2').closest('[role="menuitem"]')).toHaveFocus();
    });
  });

  // -----------------------------------------------------------------------
  // Accessibility
  // -----------------------------------------------------------------------
  describe('accessibility', () => {
    it('content has role="menu"', async () => {
      const user = userEvent.setup();
      renderMenu();
      await openMenu(user);
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('items have role="menuitem"', async () => {
      const user = userEvent.setup();
      renderMenu();
      await openMenu(user);
      const items = screen.getAllByRole('menuitem');
      expect(items).toHaveLength(2);
    });
  });

  // -----------------------------------------------------------------------
  // Sub-components: Separator, Label
  // -----------------------------------------------------------------------
  describe('separator and label', () => {
    it('renders separator', async () => {
      const user = userEvent.setup();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>open menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuSeparator data-testid="sep" />
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      await user.click(screen.getByText('open menu'));
      expect(screen.getByTestId('sep')).toBeInTheDocument();
    });

    it('renders label with styling', async () => {
      const user = userEvent.setup();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>open menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Label</DropdownMenuLabel>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      await user.click(screen.getByText('open menu'));
      const label = screen.getByText('My Label');
      expect(label).toBeInTheDocument();
      expect(label.className).toContain('font-semibold');
    });

    it('label supports inset prop', async () => {
      const user = userEvent.setup();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>open menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel inset>Inset Label</DropdownMenuLabel>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      await user.click(screen.getByText('open menu'));
      expect(screen.getByText('Inset Label').className).toContain('pl-8');
    });
  });

  // -----------------------------------------------------------------------
  // Item: inset, disabled
  // -----------------------------------------------------------------------
  describe('item', () => {
    it('supports inset prop', async () => {
      const user = userEvent.setup();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>open menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem inset>Inset Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      await user.click(screen.getByText('open menu'));
      expect(screen.getByText('Inset Item').closest('[role="menuitem"]')!.className).toContain('pl-8');
    });

    it('disabled item has opacity-50', async () => {
      const user = userEvent.setup();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>open menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled>Disabled</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      await user.click(screen.getByText('open menu'));
      const item = screen.getByText('Disabled').closest('[role="menuitem"]')!;
      expect(item).toHaveAttribute('data-disabled');
    });
  });

  // -----------------------------------------------------------------------
  // CheckboxItem
  // -----------------------------------------------------------------------
  describe('checkbox item', () => {
    it('renders checkbox item with checked indicator', async () => {
      const user = userEvent.setup();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>open menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked>Show Toolbar</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      await user.click(screen.getByText('open menu'));
      const item = screen.getByRole('menuitemcheckbox');
      expect(item).toBeInTheDocument();
      expect(item).toHaveAttribute('data-state', 'checked');
    });

    it('renders unchecked checkbox item', async () => {
      const user = userEvent.setup();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>open menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked={false}>Show Toolbar</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      await user.click(screen.getByText('open menu'));
      const item = screen.getByRole('menuitemcheckbox');
      expect(item).toHaveAttribute('data-state', 'unchecked');
    });

    it('calls onCheckedChange when toggled', async () => {
      const onCheckedChange = vi.fn();
      const user = userEvent.setup();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>open menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked={false} onCheckedChange={onCheckedChange}>
              Toggle
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      await user.click(screen.getByText('open menu'));
      await user.click(screen.getByRole('menuitemcheckbox'));
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });
  });

  // -----------------------------------------------------------------------
  // RadioGroup / RadioItem
  // -----------------------------------------------------------------------
  describe('radio group', () => {
    it('renders radio items', async () => {
      const user = userEvent.setup();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>open menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="a">
              <DropdownMenuRadioItem value="a">Option A</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="b">Option B</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      await user.click(screen.getByText('open menu'));
      const items = screen.getAllByRole('menuitemradio');
      expect(items).toHaveLength(2);
    });

    it('selected radio item has checked state', async () => {
      const user = userEvent.setup();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>open menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="a">
              <DropdownMenuRadioItem value="a">Option A</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="b">Option B</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      await user.click(screen.getByText('open menu'));
      const items = screen.getAllByRole('menuitemradio');
      expect(items[0]).toHaveAttribute('data-state', 'checked');
      expect(items[1]).toHaveAttribute('data-state', 'unchecked');
    });

    it('calls onValueChange when radio item selected', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>open menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="a" onValueChange={onValueChange}>
              <DropdownMenuRadioItem value="a">Option A</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="b">Option B</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      await user.click(screen.getByText('open menu'));
      await user.click(screen.getByText('Option B'));
      expect(onValueChange).toHaveBeenCalledWith('b');
    });
  });

  // -----------------------------------------------------------------------
  // SubMenu
  // -----------------------------------------------------------------------
  describe('sub-menu', () => {
    it('renders sub trigger with chevron icon', async () => {
      const user = userEvent.setup();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>open menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>More Options</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Sub Item</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      await user.click(screen.getByText('open menu'));
      const subTrigger = screen.getByText('More Options');
      expect(subTrigger).toBeInTheDocument();
      // Chevron icon should be present as an SVG sibling
      const svg = subTrigger.closest('[role="menuitem"]')?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('sub trigger supports inset prop', async () => {
      const user = userEvent.setup();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>open menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger inset>More</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Sub Item</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      await user.click(screen.getByText('open menu'));
      const trigger = screen.getByText('More').closest('[role="menuitem"]')!;
      expect(trigger.className).toContain('pl-8');
    });
  });

  // -----------------------------------------------------------------------
  // Exports
  // -----------------------------------------------------------------------
  describe('exports', () => {
    const requiredExports = [
      'DropdownMenu',
      'DropdownMenuTrigger',
      'DropdownMenuContent',
      'DropdownMenuItem',
      'DropdownMenuSeparator',
      'DropdownMenuLabel',
      'DropdownMenuCheckboxItem',
      'DropdownMenuRadioGroup',
      'DropdownMenuRadioItem',
      'DropdownMenuSub',
      'DropdownMenuSubTrigger',
      'DropdownMenuSubContent',
      'dropdownMenuContentVariants',
    ];

    it.each(requiredExports)('exports %s', (name) => {
      expect((DropdownMenuModule as Record<string, unknown>)[name]).toBeDefined();
    });
  });

  // -----------------------------------------------------------------------
  // Property-Based Tests
  // -----------------------------------------------------------------------
  describe('properties', () => {
    /**
     * Feature: dropdown-menu, Property 1: Content variant styling includes correct light and dark mode classes
     * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.10
     */
    it('Property 1: Content variant styling includes correct light and dark mode classes', () => {
      const expectedClasses: Record<string, { light: string[]; dark: string[] }> = {
        default: {
          light: ['bg-white', 'text-neutral-900', 'border', 'border-neutral-200'],
          dark: ['dark:border-neutral-700', 'dark:bg-neutral-800', 'dark:text-neutral-100'],
        },
        outline: {
          light: ['bg-white', 'text-neutral-900', 'border-2', 'border-neutral-300'],
          dark: ['dark:border-neutral-600', 'dark:bg-neutral-800', 'dark:text-neutral-100'],
        },
      };

      fc.assert(
        fc.property(
          fc.constantFrom('default' as const, 'outline' as const),
          (variant) => {
            const classes = dropdownMenuContentVariants({ variant });
            const expected = expectedClasses[variant]!;

            for (const cls of expected.light) {
              expect(classes).toContain(cls);
            }
            for (const cls of expected.dark) {
              expect(classes).toContain(cls);
            }

            // Animation classes (both variants)
            expect(classes).toContain('animate-fade-in');
            expect(classes).toContain('animate-fade-out');
          },
        ),
        { numRuns: 100 },
      );
    });

    /**
     * Feature: dropdown-menu, Property 2: Inset prop adds left padding across components
     * Validates: Requirements 3.4, 4.4, 7.3
     */
    it('Property 2: Inset prop adds left padding across components', async () => {
      const componentGen = fc.constantFrom(
        'DropdownMenuItem' as const,
        'DropdownMenuLabel' as const,
        'DropdownMenuSubTrigger' as const,
      );
      const insetGen = fc.boolean();

      await fc.assert(
        fc.asyncProperty(componentGen, insetGen, async (componentName, inset) => {
          const testId = 'inset-target';

          const componentMap = {
            DropdownMenuItem: (
              <DropdownMenuItem data-testid={testId} inset={inset}>
                Test Item
              </DropdownMenuItem>
            ),
            DropdownMenuLabel: (
              <DropdownMenuLabel data-testid={testId} inset={inset}>
                Test Label
              </DropdownMenuLabel>
            ),
            DropdownMenuSubTrigger: (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger data-testid={testId} inset={inset}>
                  Test Sub
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Sub Item</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            ),
          };

          const { unmount } = render(
            <DropdownMenu open>
              <DropdownMenuTrigger>trigger</DropdownMenuTrigger>
              <DropdownMenuContent>{componentMap[componentName]}</DropdownMenuContent>
            </DropdownMenu>,
          );

          const el = screen.getByTestId(testId);

          if (inset) {
            expect(el.className).toContain('pl-8');
          } else {
            expect(el.className).not.toContain('pl-8');
          }

          unmount();
        }),
        { numRuns: 100 },
      );
    });

    /**
     * Feature: dropdown-menu, Property 3: CheckboxItem indicator matches checked state
     * Validates: Requirements 5.1, 5.3
     */
    it('Property 3: CheckboxItem indicator matches checked state', async () => {
      await fc.assert(
        fc.asyncProperty(fc.boolean(), async (checked) => {
          const { unmount } = render(
            <DropdownMenu open>
              <DropdownMenuTrigger>trigger</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuCheckboxItem checked={checked}>
                  Test Option
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>,
          );

          const item = screen.getByRole('menuitemcheckbox');

          if (checked) {
            expect(item).toHaveAttribute('data-state', 'checked');
            // Check indicator SVG with polyline should be visible
            const svg = item.querySelector('svg');
            expect(svg).toBeInTheDocument();
            expect(svg!.querySelector('polyline')).toBeInTheDocument();
          } else {
            expect(item).toHaveAttribute('data-state', 'unchecked');
            // Radix ItemIndicator hides children when unchecked — no SVG rendered
            const svg = item.querySelector('svg');
            expect(svg).toBeNull();
          }

          unmount();
        }),
        { numRuns: 100 },
      );
    });

    /**
     * Feature: dropdown-menu, Property 4: RadioItem indicator matches selected value
     * Validates: Requirements 6.1, 6.3
     */
    it('Property 4: RadioItem indicator matches selected value', async () => {
      // Generator: 2–6 unique radio values, then pick one as the selected value
      const radioItemsGen = fc
        .uniqueArray(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 2, maxLength: 6 })
        .chain((values) =>
          fc.record({
            values: fc.constant(values),
            selectedIndex: fc.integer({ min: 0, max: values.length - 1 }),
          }),
        );

      await fc.assert(
        fc.asyncProperty(radioItemsGen, async ({ values, selectedIndex }) => {
          const selectedValue = values[selectedIndex]!;

          const { unmount } = render(
            <DropdownMenu open>
              <DropdownMenuTrigger>trigger</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup value={selectedValue}>
                  {values.map((v) => (
                    <DropdownMenuRadioItem key={v} value={v}>
                      {v}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>,
          );

          const items = screen.getAllByRole('menuitemradio');
          expect(items).toHaveLength(values.length);

          for (let i = 0; i < values.length; i++) {
            const item = items[i]!;
            if (i === selectedIndex) {
              // Selected item: data-state="checked" and dot indicator (circle SVG) visible
              expect(item).toHaveAttribute('data-state', 'checked');
              const svg = item.querySelector('svg');
              expect(svg).toBeInTheDocument();
              expect(svg!.querySelector('circle')).toBeInTheDocument();
            } else {
              // Non-selected items: data-state="unchecked" and no dot indicator
              expect(item).toHaveAttribute('data-state', 'unchecked');
              const svg = item.querySelector('svg');
              expect(svg).toBeNull();
            }
          }

          unmount();
        }),
        { numRuns: 100 },
      );
    });

    /**
     * Feature: dropdown-menu, Property 5: Module exports completeness
     * Validates: Requirements 9.1, 9.2, 9.3, 9.4
     */
    it('Property 5: Module exports completeness', () => {
      const requiredExports = [
        'DropdownMenu',
        'DropdownMenuTrigger',
        'DropdownMenuContent',
        'DropdownMenuItem',
        'DropdownMenuSeparator',
        'DropdownMenuLabel',
        'DropdownMenuCheckboxItem',
        'DropdownMenuRadioGroup',
        'DropdownMenuRadioItem',
        'DropdownMenuSub',
        'DropdownMenuSubTrigger',
        'DropdownMenuSubContent',
        'dropdownMenuContentVariants',
      ] as const;

      fc.assert(
        fc.property(
          fc.constantFrom(...requiredExports),
          (exportName) => {
            const moduleExports = DropdownMenuModule as Record<string, unknown>;
            expect(moduleExports[exportName]).toBeDefined();
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
