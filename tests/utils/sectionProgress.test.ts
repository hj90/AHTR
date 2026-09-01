import { describe, expect, it } from 'vitest';
import type { FormSectionDefinition, FormValues } from '../../src/forms/formTypes';
import { getSectionProgress } from '../../src/utils/sectionProgress';

const section: FormSectionDefinition = {
  id: 'request-details',
  title: 'Request details',
  fields: [
    {
      id: 'requestNumber',
      label: 'Request number',
      type: 'text',
      required: true,
      pdf: { mode: 'acroform', fieldName: 'Text Field 1' },
    },
    {
      id: 'discipline',
      label: 'Discipline',
      type: 'select',
      required: true,
      pdf: { mode: 'acroform', fieldName: 'Combo Box 1' },
    },
    {
      id: 'disciplineOther',
      label: 'Other discipline',
      type: 'text',
      requiredWhen: [
        {
          fieldId: 'discipline',
          equals: 'Other',
        },
      ],
      pdf: { mode: 'acroform', fieldName: 'Text Field 2' },
    },
    {
      id: 'notes',
      label: 'Notes',
      type: 'textarea',
      pdf: { mode: 'acroform', fieldName: 'Text Field 3' },
    },
  ],
};

describe('getSectionProgress', () => {
  it('reports untouched required sections as not started', () => {
    expect(getSectionProgress(section, {}, {}).state).toBe('not-started');
  });

  it('reports sections with some required values as in progress', () => {
    const values: FormValues = { requestNumber: 'REQ-001', discipline: '' };

    expect(getSectionProgress(section, values, {}).state).toBe('in-progress');
  });

  it('reports sections as complete when required values are filled', () => {
    const values: FormValues = {
      requestNumber: 'REQ-001',
      discipline: 'Physiotherapist',
    };

    expect(getSectionProgress(section, values, {}).state).toBe('complete');
  });

  it('includes active conditional requirements in completion', () => {
    const values: FormValues = {
      requestNumber: 'REQ-001',
      discipline: 'Other',
      disciplineOther: '',
    };

    const progress = getSectionProgress(section, values, {});

    expect(progress.state).toBe('in-progress');
    expect(progress.requiredCount).toBe(3);
  });

  it('reports validation errors before filled status', () => {
    const values: FormValues = {
      requestNumber: 'REQ-001',
      discipline: 'Physiotherapist',
    };

    expect(getSectionProgress(section, values, { requestNumber: 'Required.' }).state).toBe(
      'needs-attention',
    );
  });
});
