import { describe, it, expect } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsListVariants,
  tabsTriggerVariants,
  tabsContentVariants,
} from './tabs';

describe('Tabs', () => {
  describe('Basic Rendering', () => {
    it('renders tabs structure', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
    });

    it('shows default content', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('hides non-active content', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      // Radix UI removes non-active content from DOM
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
    });
  });

  describe('TabsList', () => {
    it('renders tabs list', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );

      expect(screen.getByTestId('tabs-list')).toBeInTheDocument();
    });

    it('applies list styling', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );

      const list = screen.getByTestId('tabs-list');
      expect(list).toHaveClass('inline-flex');
      expect(list).toHaveClass('h-10');
      expect(list).toHaveClass('items-center');
      expect(list).toHaveClass('rounded-md');
      expect(list).toHaveClass('bg-neutral-100');
    });

    it('supports dark mode', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );

      const list = screen.getByTestId('tabs-list');
      expect(list).toHaveClass('dark:bg-neutral-800');
      expect(list).toHaveClass('dark:text-neutral-400');
    });
  });

  describe('TabsTrigger', () => {
    it('renders trigger buttons', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      );

      expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toBeInTheDocument();
    });

    it('applies trigger styling', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );

      const trigger = screen.getByRole('tab', { name: 'Tab 1' });
      expect(trigger).toHaveClass('inline-flex');
      expect(trigger).toHaveClass('items-center');
      expect(trigger).toHaveClass('rounded-sm');
      expect(trigger).toHaveClass('px-3');
      expect(trigger).toHaveClass('py-1.5');
      expect(trigger).toHaveClass('text-sm');
      expect(trigger).toHaveClass('font-medium');
    });

    it('shows active state', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Active Tab</TabsTrigger>
            <TabsTrigger value="tab2">Inactive Tab</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      const activeTab = screen.getByRole('tab', { name: 'Active Tab' });
      expect(activeTab).toHaveAttribute('data-state', 'active');
    });

    it('shows inactive state', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Active Tab</TabsTrigger>
            <TabsTrigger value="tab2">Inactive Tab</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      const inactiveTab = screen.getByRole('tab', { name: 'Inactive Tab' });
      expect(inactiveTab).toHaveAttribute('data-state', 'inactive');
    });

    it('supports disabled state', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled>Disabled Tab</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      const disabledTab = screen.getByRole('tab', { name: 'Disabled Tab' });
      expect(disabledTab).toBeDisabled();
    });
  });

  describe('TabsContent', () => {
    it('renders content for active tab', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Tab 1 Content</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Tab 1 Content')).toBeInTheDocument();
    });

    it('applies content styling', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" data-testid="content">
            Content
          </TabsContent>
        </Tabs>
      );

      const content = screen.getByTestId('content');
      expect(content).toHaveClass('mt-2');
      expect(content).toHaveClass('ring-offset-white');
    });

    it('supports complex content', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <div>
              <h3>Title</h3>
              <p>Paragraph</p>
            </div>
          </TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Paragraph')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('switches content when clicking trigger', async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content 1')).toBeVisible();

      await user.click(screen.getByRole('tab', { name: 'Tab 2' }));

      expect(screen.getByText('Content 2')).toBeVisible();
      // Radix UI removes inactive content from DOM
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });

    it('updates active state when switching tabs', async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });

      expect(tab1).toHaveAttribute('data-state', 'active');
      expect(tab2).toHaveAttribute('data-state', 'inactive');

      await user.click(tab2);

      expect(tab1).toHaveAttribute('data-state', 'inactive');
      expect(tab2).toHaveAttribute('data-state', 'active');
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports arrow key navigation', async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      );

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });

      tab1.focus();
      await user.keyboard('{ArrowRight}');

      expect(tab2).toHaveFocus();
    });
  });

  describe('Controlled Mode', () => {
    it('supports controlled value', () => {
      const { rerender } = render(
        <Tabs value="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content 1')).toBeVisible();

      rerender(
        <Tabs value="tab2">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content 2')).toBeVisible();
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to TabsList', () => {
      const ref = { current: null };
      render(
        <Tabs defaultValue="tab1">
          <TabsList ref={ref}>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('forwards ref to TabsTrigger', () => {
      const ref = { current: null };
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger ref={ref} value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('forwards ref to TabsContent', () => {
      const ref = { current: null };
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent ref={ref} value="tab1">Content</TabsContent>
        </Tabs>
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CVA Variants', () => {
    it('exports tabsListVariants function', () => {
      expect(typeof tabsListVariants).toBe('function');
    });

    it('exports tabsTriggerVariants function', () => {
      expect(typeof tabsTriggerVariants).toBe('function');
    });

    it('exports tabsContentVariants function', () => {
      expect(typeof tabsContentVariants).toBe('function');
    });

    it('generates correct list classes', () => {
      const classes = tabsListVariants();
      expect(classes).toContain('inline-flex');
      expect(classes).toContain('rounded-md');
    });

    it('generates correct trigger classes', () => {
      const classes = tabsTriggerVariants();
      expect(classes).toContain('inline-flex');
      expect(classes).toContain('rounded-sm');
    });

    it('generates correct content classes', () => {
      const classes = tabsContentVariants();
      expect(classes).toContain('mt-2');
    });
  });

  describe('Custom className', () => {
    it('merges custom className on TabsList', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList className="my-custom-class" data-testid="list">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );

      const list = screen.getByTestId('list');
      expect(list).toHaveClass('my-custom-class');
      expect(list).toHaveClass('inline-flex');
    });

    it('merges custom className on TabsTrigger', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" className="custom-trigger">
              Tab 1
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );

      const trigger = screen.getByRole('tab', { name: 'Tab 1' });
      expect(trigger).toHaveClass('custom-trigger');
      expect(trigger).toHaveClass('inline-flex');
    });

    it('merges custom className on TabsContent', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="custom-content" data-testid="content">
            Content
          </TabsContent>
        </Tabs>
      );

      const content = screen.getByTestId('content');
      expect(content).toHaveClass('custom-content');
      expect(content).toHaveClass('mt-2');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA roles', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument();
    });

    it('links tabs to panels with aria-controls', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );

      const tab = screen.getByRole('tab', { name: 'Tab 1' });
      expect(tab).toHaveAttribute('aria-controls');
    });
  });

  describe('Multiple Panels', () => {
    it('handles multiple tabs', () => {
      render(
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">Overview content</TabsContent>
          <TabsContent value="details">Details content</TabsContent>
          <TabsContent value="settings">Settings content</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Details')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Overview content')).toBeVisible();
    });

    it('switches between multiple panels', async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content 1')).toBeVisible();

      await user.click(screen.getByRole('tab', { name: 'Tab 2' }));
      expect(screen.getByText('Content 2')).toBeVisible();

      await user.click(screen.getByRole('tab', { name: 'Tab 3' }));
      expect(screen.getByText('Content 3')).toBeVisible();
    });
  });

  describe('Dark Mode', () => {
    it('applies dark mode to list', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList data-testid="list">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );

      expect(screen.getByTestId('list')).toHaveClass('dark:bg-neutral-800');
    });

    it('applies dark mode to active trigger', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );

      const trigger = screen.getByRole('tab', { name: 'Tab 1' });
      expect(trigger).toHaveClass('dark:data-[state=active]:bg-neutral-900');
      expect(trigger).toHaveClass('dark:data-[state=active]:text-neutral-100');
    });
  });
});
