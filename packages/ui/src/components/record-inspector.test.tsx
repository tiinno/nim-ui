import { describe, expect, it, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import { Button } from './button';
import { StatusPill } from './status-pill';
import {
  RecordInspector,
  RecordInspectorActions,
  RecordInspectorBody,
  RecordInspectorDescription,
  RecordInspectorFooter,
  RecordInspectorHeader,
  RecordInspectorHeading,
  RecordInspectorMetadata,
  RecordInspectorMetadataItem,
  RecordInspectorMetadataLabel,
  RecordInspectorMetadataValue,
  RecordInspectorSection,
  RecordInspectorSectionDescription,
  RecordInspectorSectionHeader,
  RecordInspectorSectionTitle,
  RecordInspectorStatus,
  RecordInspectorTitle,
} from './record-inspector';

describe('RecordInspector', () => {
  it('renders a labelled record detail region with status and metadata', () => {
    render(
      <RecordInspector aria-label="Order inspector">
        <RecordInspectorHeader>
          <RecordInspectorHeading>
            <RecordInspectorTitle>ORD-4821</RecordInspectorTitle>
            <RecordInspectorDescription>
              Northwind Supply order awaiting risk review
            </RecordInspectorDescription>
          </RecordInspectorHeading>
          <RecordInspectorStatus>
            <StatusPill status="warning">Needs review</StatusPill>
          </RecordInspectorStatus>
        </RecordInspectorHeader>
        <RecordInspectorBody>
          <RecordInspectorSection aria-labelledby="summary-title">
            <RecordInspectorSectionHeader>
              <RecordInspectorSectionTitle id="summary-title">
                Summary
              </RecordInspectorSectionTitle>
            </RecordInspectorSectionHeader>
            <RecordInspectorMetadata aria-label="Order metadata">
              <RecordInspectorMetadataItem>
                <RecordInspectorMetadataLabel>Customer</RecordInspectorMetadataLabel>
                <RecordInspectorMetadataValue>Northwind Supply</RecordInspectorMetadataValue>
              </RecordInspectorMetadataItem>
              <RecordInspectorMetadataItem>
                <RecordInspectorMetadataLabel>Total</RecordInspectorMetadataLabel>
                <RecordInspectorMetadataValue>$12,840.00</RecordInspectorMetadataValue>
              </RecordInspectorMetadataItem>
            </RecordInspectorMetadata>
          </RecordInspectorSection>
        </RecordInspectorBody>
      </RecordInspector>
    );

    expect(screen.getByRole('region', { name: 'Order inspector' })).toBeInTheDocument();
    expect(screen.getByText('ORD-4821')).toBeInTheDocument();
    expect(screen.getByText('Needs review')).toBeInTheDocument();
    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getByText('Northwind Supply')).toBeInTheDocument();
  });

  it('groups header and footer actions for operator workflows', async () => {
    const approve = vi.fn();
    const close = vi.fn();
    const user = userEvent.setup();

    render(
      <RecordInspector aria-label="User inspector">
        <RecordInspectorHeader>
          <RecordInspectorHeading>
            <RecordInspectorTitle>Jane Operator</RecordInspectorTitle>
          </RecordInspectorHeading>
          <RecordInspectorActions aria-label="Inspector actions">
            <Button variant="outline" onClick={close}>
              Close
            </Button>
          </RecordInspectorActions>
        </RecordInspectorHeader>
        <RecordInspectorFooter aria-label="Decision actions" sticky>
          <Button variant="outline" onClick={close}>
            Escalate
          </Button>
          <Button onClick={approve}>Approve</Button>
        </RecordInspectorFooter>
      </RecordInspector>
    );

    expect(screen.getByRole('group', { name: 'Inspector actions' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Decision actions' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Approve' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(approve).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('supports section descriptions, density, custom columns, and custom classes', () => {
    render(
      <RecordInspector density="compact" className="custom-inspector">
        <RecordInspectorBody density="compact">
          <RecordInspectorSection density="compact" aria-labelledby="risk-title">
            <RecordInspectorSectionHeader>
              <RecordInspectorSectionTitle id="risk-title">
                Risk review
              </RecordInspectorSectionTitle>
              <RecordInspectorSectionDescription>
                Signals that affect fulfilment approval.
              </RecordInspectorSectionDescription>
            </RecordInspectorSectionHeader>
            <RecordInspectorMetadata columns={3} className="custom-metadata">
              <RecordInspectorMetadataItem>
                <RecordInspectorMetadataLabel>Score</RecordInspectorMetadataLabel>
                <RecordInspectorMetadataValue>82</RecordInspectorMetadataValue>
              </RecordInspectorMetadataItem>
            </RecordInspectorMetadata>
          </RecordInspectorSection>
        </RecordInspectorBody>
      </RecordInspector>
    );

    expect(screen.getByText('Risk review')).toBeInTheDocument();
    expect(screen.getByText('Signals that affect fulfilment approval.')).toBeInTheDocument();
    expect(screen.getByText('82')).toBeInTheDocument();
    expect(screen.getByText('82').closest('dl')).toHaveClass('custom-metadata');
    expect(screen.getByText('Risk review').closest('section')).toHaveClass('px-3');
  });
});
