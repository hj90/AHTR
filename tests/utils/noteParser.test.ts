import { afterEach, describe, expect, it, vi } from 'vitest';
import { demoAlliedHealthReferral } from '../../src/forms/templates/demoAlliedHealthReferral';
import { parseConsultNotes } from '../../src/utils/noteParser';
import { emptyPractitionerSettings } from '../../src/utils/practitionerSettings';

describe('consult note parsing', () => {
  afterEach(() => vi.restoreAllMocks());

  it('accepts recognised fields and ignores unknown or incorrectly typed values', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        fields: [
          { fieldId: 'patientName', value: 'Example Patient', needsReview: false },
          { fieldId: 'consentToShare', value: 'yes', needsReview: false },
          { fieldId: 'unknownField', value: 'ignored', needsReview: true },
        ],
        clinicalFlags: [],
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    const draft = await parseConsultNotes('Example notes', emptyPractitionerSettings, demoAlliedHealthReferral);
    expect(draft.values.patientName).toBe('Example Patient');
    expect(draft.values.consentToShare).toBeUndefined();
    expect(draft.values.unknownField).toBeUndefined();
  });

  it('surfaces a safe server error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'AI note drafting is not configured yet.' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(
      parseConsultNotes('Example notes', emptyPractitionerSettings, demoAlliedHealthReferral),
    ).rejects.toThrow('AI note drafting is not configured yet.');
  });
});
