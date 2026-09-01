import { describe, expect, it, vi } from 'vitest';
import { demoAlliedHealthReferral } from '../../src/forms/templates/demoAlliedHealthReferral';
import { getInitialFormValues, resetFormState } from '../../src/utils/formState';

describe('form state helpers', () => {
  it('creates blank in-memory defaults for all fields', () => {
    const values = getInitialFormValues(demoAlliedHealthReferral);

    expect(values.patientName).toBe('');
    expect(values.consentToShare).toBe(false);
  });

  it('revokes generated PDF URLs when reset', () => {
    const revoke = vi.fn();
    const state = resetFormState(demoAlliedHealthReferral, 'blob:test-url', revoke);

    expect(revoke).toHaveBeenCalledWith('blob:test-url');
    expect(state.generatedPdfUrl).toBeNull();
    expect(state.values.patientName).toBe('');
  });
});
