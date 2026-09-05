import { describe, expect, it } from 'vitest';
import { demoAlliedHealthReferral } from '../../src/forms/templates/demoAlliedHealthReferral';
import {
  emptyPractitionerSettings,
  getNewFormValues,
} from '../../src/utils/practitionerSettings';

describe('practitioner settings helpers', () => {
  it('keeps unrelated form fields empty while applying matching saved defaults', () => {
    const values = getNewFormValues(demoAlliedHealthReferral, {
      ...emptyPractitionerSettings,
      practitionerName: 'Alex Clinician',
      practiceEmail: 'practice@example.test',
    });

    expect(values.patientName).toBe('');
    expect(values.practitionerName).toBe('Alex Clinician');
    expect(values.practiceEmail).toBe('practice@example.test');
  });
});
