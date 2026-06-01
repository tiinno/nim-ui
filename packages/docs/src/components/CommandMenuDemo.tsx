import {
  CommandMenu,
  CommandMenuEmpty,
  CommandMenuGroup,
  CommandMenuInput,
  CommandMenuItem,
  CommandMenuList,
  CommandMenuSeparator,
} from '@nim-ui/components';

export function CommandMenuDemo() {
  return (
    <CommandMenu label="Operations command menu" className="w-full max-w-2xl">
      <CommandMenuInput placeholder="Search orders, users, or actions..." />
      <CommandMenuList>
        <CommandMenuEmpty>No command found.</CommandMenuEmpty>
        <CommandMenuGroup heading="Orders">
          <CommandMenuItem
            value="open order 4821 northwind high risk"
            icon={<span className="text-xs font-semibold">OR</span>}
            meta="Northwind Supply · High risk · Today 16:30"
            badge="Review"
            shortcut="O 1"
            onSelect={() => undefined}
          >
            Open ORD-4821
          </CommandMenuItem>
          <CommandMenuItem
            value="open order 4819 atlas picking low"
            icon={<span className="text-xs font-semibold">OR</span>}
            meta="Atlas Retail · Picking · Tomorrow"
            badge="Picking"
            shortcut="O 2"
            onSelect={() => undefined}
          >
            Open ORD-4819
          </CommandMenuItem>
        </CommandMenuGroup>
        <CommandMenuSeparator />
        <CommandMenuGroup heading="Actions">
          <CommandMenuItem
            value="export filtered orders"
            icon={<span className="text-xs font-semibold">EX</span>}
            meta="Download the current filtered table as CSV"
            shortcut="E"
            onSelect={() => undefined}
          >
            Export filtered orders
          </CommandMenuItem>
          <CommandMenuItem
            value="invite operator"
            icon={<span className="text-xs font-semibold">US</span>}
            meta="Create an operator invite for this workspace"
            onSelect={() => undefined}
          >
            Invite operator
          </CommandMenuItem>
          <CommandMenuItem
            value="cancel shipment"
            icon={<span className="text-xs font-semibold">CA</span>}
            meta="Unavailable until an order is selected"
            disabled
          >
            Cancel selected shipment
          </CommandMenuItem>
        </CommandMenuGroup>
      </CommandMenuList>
    </CommandMenu>
  );
}
