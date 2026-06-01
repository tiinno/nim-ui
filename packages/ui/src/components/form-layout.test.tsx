import { describe, expect, it } from 'vitest';
import { render, screen } from '../test/test-utils';
import {
  FormLayout,
  FormLayoutActions,
  FormLayoutGrid,
  FormLayoutSection,
  FormLayoutSectionDescription,
  FormLayoutSectionHeader,
  FormLayoutSectionTitle,
  FormLayoutValidationSummary,
} from './form-layout';

describe('FormLayout', () => {
  it('renders sectioned CRUD form regions with headings and descriptions', () => {
    render(
      <FormLayout>
        <FormLayoutSection aria-labelledby="customer-heading">
          <FormLayoutSectionHeader>
            <FormLayoutSectionTitle id="customer-heading">
              Customer details
            </FormLayoutSectionTitle>
            <FormLayoutSectionDescription>
              Billing contact and fulfillment ownership.
            </FormLayoutSectionDescription>
          </FormLayoutSectionHeader>
          <FormLayoutGrid>
            <label htmlFor="name">Name</label>
            <input id="name" />
          </FormLayoutGrid>
        </FormLayoutSection>
      </FormLayout>
    );

    expect(screen.getByRole('region', { name: 'Customer details' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Customer details' })).toBeInTheDocument();
    expect(screen.getByText('Billing contact and fulfillment ownership.')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('supports responsive grid columns and compact density classes', () => {
    render(
      <FormLayout density="compact" data-testid="layout">
        <FormLayoutGrid columns={3} data-testid="grid">
          <div>Field</div>
        </FormLayoutGrid>
      </FormLayout>
    );

    expect(screen.getByTestId('layout')).toHaveClass('space-y-3');
    expect(screen.getByTestId('grid')).toHaveClass('grid-cols-1');
    expect(screen.getByTestId('grid')).toHaveClass('xl:grid-cols-3');
  });

  it('renders sticky grouped form actions by default', () => {
    render(
      <FormLayoutActions aria-label="Edit order actions">
        <button type="button">Cancel</button>
        <button type="submit">Save changes</button>
      </FormLayoutActions>
    );

    expect(screen.getByRole('group', { name: 'Edit order actions' })).toHaveClass('sticky');
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });

  it('renders validation summary links and hides empty summaries', () => {
    const { container } = render(
      <>
        <FormLayoutValidationSummary
          errors={[
            { label: 'Customer', message: 'Required', href: '#customer' },
            { label: 'Risk level', message: 'Choose a review state' },
          ]}
        />
        <FormLayoutValidationSummary errors={[]} />
      </>
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Review these fields');
    expect(screen.getByRole('link', { name: /Customer.*Required/ })).toHaveAttribute(
      'href',
      '#customer'
    );
    expect(screen.getByText('Risk level')).toBeInTheDocument();
    expect(container.querySelectorAll('[role="alert"]')).toHaveLength(1);
  });
});
