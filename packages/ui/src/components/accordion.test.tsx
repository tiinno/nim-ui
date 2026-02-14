import { describe, it, expect } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './accordion';

describe('Accordion', () => {
  const renderAccordion = (props = {}) =>
    render(
      <Accordion type="single" collapsible {...props}>
        <AccordionItem value="item-1" data-testid="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2" data-testid="item-2">
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

  it('renders trigger buttons', () => {
    renderAccordion();
    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText('Section 2')).toBeInTheDocument();
  });

  it('toggles content on click', async () => {
    const user = userEvent.setup();
    renderAccordion();

    const trigger = screen.getByText('Section 1');
    await user.click(trigger);
    expect(screen.getByText('Content 1')).toBeVisible();
  });

  it('applies border classes to items', () => {
    renderAccordion();
    expect(screen.getByTestId('item-1')).toHaveClass('border-b');
    expect(screen.getByTestId('item-2')).toHaveClass('border-b');
  });

  it('merges custom className on AccordionItem', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="custom-item" data-testid="item">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.getByTestId('item')).toHaveClass('custom-item');
    expect(screen.getByTestId('item')).toHaveClass('border-b');
  });

  it('merges custom className on AccordionContent', async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent className="custom-content">Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    await user.click(screen.getByText('Trigger'));
    // The className is applied to the inner div wrapper, not the Radix Content element
    const contentDiv = screen.getByText('Content');
    expect(contentDiv).toHaveClass('custom-content');
  });
});
