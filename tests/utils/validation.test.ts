import { describe, expect, it } from 'vitest';
import { demoAlliedHealthReferral } from '../../src/forms/templates/demoAlliedHealthReferral';
import { getInitialFormValues } from '../../src/utils/formState';
import { validateTemplate } from '../../src/utils/validation';

describe('validateTemplate', () => {
  it('requires mandatory fields', () => {
    const values = getInitialFormValues(demoAlliedHealthReferral);
    const errors = validateTemplate(demoAlliedHealthReferral, values);

    expect(errors.patientName).toBe('This field is required.');
    expect(errors.consentToShare).toBe('This confirmation is required.');
  });

  it('validates email and phone formats', () => {
    const values = {
      ...getInitialFormValues(demoAlliedHealthReferral),
      patientName: 'Test Patient',
      dateOfBirth: '1990-01-01',
      patientPhone: 'abc',
      patientEmail: 'not-email',
      referralDate: '2026-08-13',
      clinicianName: 'Dr Test',
      serviceType: 'physiotherapy',
      fundingType: 'private',
      clinicalReason: 'Synthetic reason',
      consentToShare: true,
    };

    const errors = validateTemplate(demoAlliedHealthReferral, values);

    expect(errors.patientPhone).toBe('Use a valid format for this field.');
    expect(errors.patientEmail).toBe('Enter a valid email address.');
  });
});
