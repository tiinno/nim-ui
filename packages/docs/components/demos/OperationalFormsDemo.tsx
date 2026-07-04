'use client';

import { useState } from 'react';
import type { DateTimeRange } from '@/components/nim';
import {
  Button,
  DateFilter,
  DateTimePicker,
  DateTimeRangePicker,
  FileUpload,
  FilterSummary,
  FilterSummaryClear,
  FilterSummaryItem,
  FilterSummaryList,
  Form,
  FormField,
  FormLayout,
  FormLayoutActions,
  FormLayoutGrid,
  FormLayoutSection,
  FormLayoutSectionDescription,
  FormLayoutSectionHeader,
  FormLayoutSectionTitle,
  MultiSelect,
  NumberInput,
  PasswordInput,
  Stepper,
  TagsInput,
  TimePicker,
} from '@/components/nim';
import { preventDefault } from '@/components/demo-handlers';

type DateRange = {
  from: Date | undefined;
  to?: Date;
};

const ownerOptions = [
  { value: 'ops', label: 'Operations', description: 'Queue managers' },
  { value: 'billing', label: 'Billing', description: 'Payment review' },
  { value: 'support', label: 'Support', description: 'Customer handoff' },
];

const steps = [
  { label: 'Details', description: 'Routing fields' },
  { label: 'Schedule', description: 'SLA window' },
  { label: 'Review', description: 'Final checks' },
];

export function OperationalFormsDemo() {
  const [step, setStep] = useState(1);
  const [cutoff, setCutoff] = useState('17:00');
  const [publishAt, setPublishAt] = useState<Date | undefined>(
    new Date(2026, 5, 16, 10, 0)
  );
  const [window, setWindow] = useState<DateTimeRange | undefined>({
    from: new Date(2026, 5, 16, 9, 0),
    to: new Date(2026, 5, 16, 17, 0),
  });
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>();
  const [owners, setOwners] = useState(['ops']);
  const [tags, setTags] = useState(['priority']);
  const [quantity, setQuantity] = useState<number | undefined>(4);
  const [files, setFiles] = useState<File[]>([]);

  return (
    <Form className="w-full" onSubmit={preventDefault}>
      <FormLayout density="compact">
        <Stepper steps={steps} currentStep={step} onStepChange={setStep} />

        <FilterSummary aria-label="Scheduling filters">
          <FilterSummaryList>
            {dateFilter?.from && (
              <FilterSummaryItem
                label="Date"
                value={
                  dateFilter.to
                    ? `${dateFilter.from.toLocaleDateString()} - ${dateFilter.to.toLocaleDateString()}`
                    : dateFilter.from.toLocaleDateString()
                }
                onRemove={() => setDateFilter(undefined)}
              />
            )}
            {owners.map((owner) => (
              <FilterSummaryItem
                key={owner}
                label="Owner"
                value={
                  ownerOptions.find((option) => option.value === owner)?.label ??
                  owner
                }
                onRemove={() =>
                  setOwners((current) => current.filter((item) => item !== owner))
                }
              />
            ))}
          </FilterSummaryList>
          <FilterSummaryClear
            onClear={() => {
              setDateFilter(undefined);
              setOwners([]);
            }}
          />
        </FilterSummary>

        <FormLayoutSection>
          <FormLayoutSectionHeader>
            <FormLayoutSectionTitle>Scheduling controls</FormLayoutSectionTitle>
            <FormLayoutSectionDescription>
              Operational inputs for cutoff times, SLA windows, routing, and review.
            </FormLayoutSectionDescription>
          </FormLayoutSectionHeader>
          <FormLayoutGrid columns={2}>
            <FormField label="Cutoff time" name="cutoff-time">
              <TimePicker
                value={cutoff}
                onChange={(next: string | undefined) => setCutoff(next ?? '')}
                name="cutoffTime"
              />
            </FormField>
            <FormField label="Publish at" name="publish-at">
              <DateTimePicker value={publishAt} onChange={setPublishAt} name="publishAt" />
            </FormField>
            <FormField label="SLA window" name="sla-window">
              <DateTimeRangePicker
                value={window}
                onChange={setWindow}
                fromName="windowStart"
                toName="windowEnd"
              />
            </FormField>
            <FormField label="Report range" name="report-range">
              <DateFilter
                value={dateFilter}
                onChange={setDateFilter}
                fromName="reportFrom"
                toName="reportTo"
              />
            </FormField>
            <FormField label="Review owners" name="review-owners">
              <MultiSelect
                options={ownerOptions}
                value={owners}
                onChange={setOwners}
                name="owners"
              />
            </FormField>
            <FormField label="Labels" name="labels">
              <TagsInput value={tags} onChange={setTags} name="labels" maxTags={6} />
            </FormField>
            <FormField label="Quantity" name="quantity">
              <NumberInput value={quantity} onChange={setQuantity} min={1} max={99} name="quantity" />
            </FormField>
            <FormField label="Approval password" name="approval-password">
              <PasswordInput name="approvalPassword" autoComplete="current-password" />
            </FormField>
            <div className="md:col-span-2">
              <FormField label="Attachments" name="attachments">
                <FileUpload
                  value={files}
                  onChange={setFiles}
                  accept="application/pdf,image/*"
                  maxFiles={3}
                  maxSize={5 * 1024 * 1024}
                  multiple
                />
              </FormField>
            </div>
          </FormLayoutGrid>
        </FormLayoutSection>

        <FormLayoutActions sticky={false}>
          <Button type="button" variant="outline">
            Save draft
          </Button>
          <Button type="submit" variant="primary">
            Submit review
          </Button>
        </FormLayoutActions>
      </FormLayout>
    </Form>
  );
}
