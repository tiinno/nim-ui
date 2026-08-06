import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import {
  DescriptionList,
  DescriptionListActions,
  DescriptionListDescription,
  DescriptionListItem,
  DescriptionListTerm,
} from './description-list';

describe('DescriptionList', () => {
  it('renders record metadata with semantic description list elements', () => {
    const { container } = render(
      <DescriptionList aria-label="Order details">
        <DescriptionListItem>
          <DescriptionListTerm>Order ID</DescriptionListTerm>
          <DescriptionListDescription>ORD-4821</DescriptionListDescription>
        </DescriptionListItem>
        <DescriptionListItem>
          <DescriptionListTerm>Warehouse</DescriptionListTerm>
          <DescriptionListDescription>Bangkok 02</DescriptionListDescription>
        </DescriptionListItem>
      </DescriptionList>
    );

    expect(container.querySelector('dl')).toBeInTheDocument();
    expect(screen.getByText('Order ID').tagName).toBe('DT');
    expect(screen.getByText('ORD-4821').tagName).toBe('DD');
    expect(screen.getByText('Warehouse')).toBeInTheDocument();
  });

  it('supports an inline layout variant for compact detail panels', () => {
    const { container } = render(
      <DescriptionList variant="inline">
        <DescriptionListItem>
          <DescriptionListTerm>Status</DescriptionListTerm>
          <DescriptionListDescription>Ready</DescriptionListDescription>
        </DescriptionListItem>
      </DescriptionList>
    );

    expect(container.querySelector('dl > div')).toHaveClass('sm:grid-cols-3');
  });

  it('groups row actions with an accessible label', () => {
    render(
      <DescriptionList>
        <DescriptionListItem>
          <DescriptionListTerm>Customer</DescriptionListTerm>
          <DescriptionListDescription>Northwind Supply</DescriptionListDescription>
          <DescriptionListActions aria-label="Customer detail actions">
            <button type="button">Open profile</button>
          </DescriptionListActions>
        </DescriptionListItem>
      </DescriptionList>
    );

    expect(screen.getByRole('group', { name: 'Customer detail actions' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open profile' })).toBeInTheDocument();
  });

  it('paints the same dl classes at every variant value (NIMUI-90: no vestigial cva group)', () => {
    // `variant` feeds DescriptionListContext (spent by DescriptionListItem) but
    // paints nothing on the root itself. descriptionListVariants used to declare
    // a `variant` group whose two keys both resolved to '', which is why
    // removing that group cannot change this string: it contributed nothing
    // before, and has nothing left to contribute now.
    const { container: defaultVariant } = render(
      <DescriptionList variant="default" aria-label="Variant check" />
    );
    const { container: inline } = render(
      <DescriptionList variant="inline" aria-label="Variant check" />
    );
    const { container: defaulted } = render(<DescriptionList aria-label="Variant check" />);

    const defaultClass = defaultVariant.querySelector('dl')?.className;
    const inlineClass = inline.querySelector('dl')?.className;
    const noPropClass = defaulted.querySelector('dl')?.className;

    expect(defaultClass).toBe('divide-y divide-neutral-200 dark:divide-neutral-800');
    expect(inlineClass).toBe(defaultClass);
    expect(noPropClass).toBe(defaultClass);
  });

  it('merges custom className with default spacing classes', () => {
    const { container } = render(
      <DescriptionList className="custom-description-list">
        <DescriptionListItem>
          <DescriptionListTerm>Total</DescriptionListTerm>
          <DescriptionListDescription>$128.00</DescriptionListDescription>
        </DescriptionListItem>
      </DescriptionList>
    );

    expect(container.querySelector('dl')).toHaveClass('custom-description-list');
    expect(container.querySelector('dl')).toHaveClass('divide-y');
  });
});
