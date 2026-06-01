import { describe, expect, it } from 'vitest';
import { render, screen } from '../test/test-utils';
import {
  SidebarNav,
  SidebarNavFooter,
  SidebarNavItem,
  SidebarNavList,
  SidebarNavSection,
  SidebarNavSectionTitle,
} from './sidebar-nav';

describe('SidebarNav', () => {
  it('renders grouped navigation with accessible labels', () => {
    render(
      <SidebarNav aria-label="Admin navigation">
        <SidebarNavSection>
          <SidebarNavSectionTitle>Operations</SidebarNavSectionTitle>
          <SidebarNavList>
            <SidebarNavItem href="/orders" active badge="12">
              Orders
            </SidebarNavItem>
            <SidebarNavItem href="/inventory">Inventory</SidebarNavItem>
          </SidebarNavList>
        </SidebarNavSection>
        <SidebarNavFooter>Workspace: BKK</SidebarNavFooter>
      </SidebarNav>
    );

    expect(screen.getByRole('navigation', { name: 'Admin navigation' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Operations' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Orders 12' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Inventory' })).toHaveAttribute('href', '/inventory');
    expect(screen.getByText('Workspace: BKK')).toBeInTheDocument();
  });

  it('supports icon slots without adding duplicate accessible names', () => {
    render(
      <SidebarNav aria-label="Admin navigation">
        <SidebarNavSection>
          <SidebarNavList>
            <SidebarNavItem href="/users" icon={<span data-testid="icon">U</span>}>
              Users
            </SidebarNavItem>
          </SidebarNavList>
        </SidebarNavSection>
      </SidebarNav>
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument();
  });
});
