import { beforeEach, describe, expect, it, vi } from 'vitest';
import { siraAlliedHealthTreatmentRequest } from '../../src/forms/templates/siraAlliedHealthTreatmentRequest';
import {
  createFormSubmission,
  deleteFormSubmission,
  listFormSubmissions,
  markFormSubmissionSubmitted,
  updateFormSubmission,
} from '../../src/integrations/formSubmissionStore';

describe('browser form submission store', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('creates and lists a browser-local draft', async () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('00000000-0000-4000-8000-000000000001');

    const saved = await createFormSubmission(
      siraAlliedHealthTreatmentRequest,
      'NSW',
      { personName: 'Jordan Example' },
    );

    expect(saved).toMatchObject({ id: '00000000-0000-4000-8000-000000000001', status: 'draft' });
    await expect(listFormSubmissions()).resolves.toEqual([saved]);
  });

  it('updates a draft and marks it submitted', async () => {
    const draft = await createFormSubmission(siraAlliedHealthTreatmentRequest, 'NSW', {});

    await expect(updateFormSubmission(draft.id, { personName: 'Jordan Example' })).resolves.toMatchObject({
      status: 'draft',
      values: { personName: 'Jordan Example' },
    });
    await expect(markFormSubmissionSubmitted(draft.id, { personName: 'Jordan Example' })).resolves.toMatchObject({
      status: 'submitted',
      submittedAt: expect.any(String),
    });
  });

  it('deletes a saved request', async () => {
    const draft = await createFormSubmission(siraAlliedHealthTreatmentRequest, 'NSW', {});
    await deleteFormSubmission(draft.id);
    await expect(listFormSubmissions()).resolves.toEqual([]);
  });

  it('ignores malformed browser data', async () => {
    window.localStorage.setItem('ahtr-form-submissions-v1', '{bad json');
    await expect(listFormSubmissions()).resolves.toEqual([]);
  });
});
