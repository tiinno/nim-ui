import { describe, expect, it } from 'vitest';
import { render, screen } from '../test/test-utils';
import {
  AdminShell,
  AdminShellBody,
  AdminShellHeader,
  AdminShellMain,
  AdminShellPanel,
  AdminShellSidebar,
} from './admin-shell';

describe('AdminShell', () => {
  it('renders sidebar, topbar, and main landmarks for backoffice pages', () => {
    render(
      <AdminShell>
        <AdminShellBody>
          <AdminShellSidebar aria-label="Workspace navigation">Navigation</AdminShellSidebar>
          <AdminShellPanel>
            <AdminShellHeader>Orders workspace</AdminShellHeader>
            <AdminShellMain>Order queue</AdminShellMain>
          </AdminShellPanel>
        </AdminShellBody>
      </AdminShell>
    );

    expect(screen.getByLabelText('Workspace navigation')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveTextContent('Orders workspace');
    expect(screen.getByRole('main')).toHaveTextContent('Order queue');
  });

  it('supports compact density and non-sticky regions', () => {
    render(
      <AdminShell density="compact" data-testid="shell">
        <AdminShellBody>
          <AdminShellSidebar sticky={false}>Navigation</AdminShellSidebar>
          <AdminShellPanel>
            <AdminShellHeader sticky={false}>Topbar</AdminShellHeader>
          </AdminShellPanel>
        </AdminShellBody>
      </AdminShell>
    );

    expect(screen.getByTestId('shell')).toHaveClass('[--admin-shell-sidebar:15rem]');
    expect(screen.getByText('Navigation')).not.toHaveClass('lg:sticky');
    expect(screen.getByText('Topbar')).not.toHaveClass('sticky');
  });
});
