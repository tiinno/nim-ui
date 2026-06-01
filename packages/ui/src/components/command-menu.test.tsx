import { describe, expect, it, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import {
  CommandMenu,
  CommandMenuEmpty,
  CommandMenuGroup,
  CommandMenuInput,
  CommandMenuItem,
  CommandMenuList,
  CommandMenuSeparator,
  CommandMenuShortcut,
} from './command-menu';

describe('CommandMenu', () => {
  it('renders searchable command groups with item metadata and badges', () => {
    render(
      <CommandMenu label="Operations command menu">
        <CommandMenuInput placeholder="Search orders or actions" />
        <CommandMenuList>
          <CommandMenuGroup heading="Orders">
            <CommandMenuItem value="order-4821" meta="Northwind Supply" badge="High">
              Open ORD-4821
            </CommandMenuItem>
          </CommandMenuGroup>
        </CommandMenuList>
      </CommandMenu>
    );

    expect(screen.getByRole('combobox')).toHaveAttribute(
      'placeholder',
      'Search orders or actions'
    );
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Open ORD-4821/ })).toBeInTheDocument();
    expect(screen.getByText('Northwind Supply')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('filters items using cmdk search behavior', async () => {
    const user = userEvent.setup();

    render(
      <CommandMenu>
        <CommandMenuInput placeholder="Search" />
        <CommandMenuList>
          <CommandMenuItem value="open orders">Open orders</CommandMenuItem>
          <CommandMenuItem value="invite user">Invite user</CommandMenuItem>
        </CommandMenuList>
      </CommandMenu>
    );

    await user.type(screen.getByRole('combobox'), 'invite');

    expect(screen.getByRole('option', { name: 'Invite user' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Open orders' })).not.toBeInTheDocument();
  });

  it('calls onSelect for actionable command items', async () => {
    const handleSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <CommandMenu>
        <CommandMenuList>
          <CommandMenuItem value="approve-order" onSelect={handleSelect}>
            Approve order
          </CommandMenuItem>
        </CommandMenuList>
      </CommandMenu>
    );

    await user.click(screen.getByRole('option', { name: 'Approve order' }));

    expect(handleSelect).toHaveBeenCalledWith('approve-order');
  });

  it('supports disabled items, separators, and shortcuts', () => {
    render(
      <CommandMenu>
        <CommandMenuList>
          <CommandMenuGroup heading="Actions">
            <CommandMenuItem value="disabled-action" disabled shortcut="D">
              Disabled action
            </CommandMenuItem>
            <CommandMenuSeparator />
            <CommandMenuItem value="open-audit">
              Open audit
              <CommandMenuShortcut>G A</CommandMenuShortcut>
            </CommandMenuItem>
          </CommandMenuGroup>
        </CommandMenuList>
      </CommandMenu>
    );

    expect(screen.getByRole('option', { name: /Disabled action/ })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByText('G A')).toBeInTheDocument();
  });

  it('renders an empty state when filtering removes all commands', () => {
    render(
      <CommandMenu>
        <CommandMenuInput value="missing" readOnly />
        <CommandMenuList>
          <CommandMenuEmpty>No commands found</CommandMenuEmpty>
          <CommandMenuItem value="open-audit">Open audit</CommandMenuItem>
        </CommandMenuList>
      </CommandMenu>
    );

    expect(screen.getByText('No commands found')).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Open audit' })).not.toBeInTheDocument();
  });
});
