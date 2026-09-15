import { beforeEach, describe, expect, it, vi } from 'vitest';
import { siraAlliedHealthTreatmentRequest } from '../../src/forms/templates/siraAlliedHealthTreatmentRequest';
import { createFormSubmission, deleteFormSubmission, listFormSubmissions, markFormSubmissionSubmitted, migrateLocalSubmissionsToAccount, updateFormSubmission } from '../../src/integrations/formSubmissionStore';
import { getSupabaseClient } from '../../src/integrations/supabaseClient';

vi.mock('../../src/integrations/supabaseClient', () => ({ getSupabaseClient: vi.fn() }));
const clientMock = vi.mocked(getSupabaseClient);
const userId = '22222222-2222-4222-8222-222222222222';
const baseRow = { id: '33333333-3333-4333-8333-333333333333', template_id: siraAlliedHealthTreatmentRequest.id, practice_state: 'NSW', status: 'draft', values: {}, created_at: '2026-09-15T00:00:00Z', updated_at: '2026-09-15T00:00:00Z', submitted_at: null };

describe('authenticated form submission store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('moves legacy browser drafts into the authenticated account', async () => {
    window.localStorage.setItem('ahtr-form-submissions-v1', JSON.stringify([{ id: baseRow.id, templateId: baseRow.template_id, practiceState: 'NSW', status: 'draft', values: {}, createdAt: baseRow.created_at, updatedAt: baseRow.updated_at, submittedAt: null }]));
    const upsert = vi.fn().mockResolvedValue({ error: null });
    clientMock.mockReturnValue({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: userId } }, error: null }) }, from: () => ({ upsert }) } as never);
    await migrateLocalSubmissionsToAccount();
    expect(upsert).toHaveBeenCalledWith([expect.objectContaining({ user_id: userId })], { onConflict: 'id' });
    expect(window.localStorage.getItem('ahtr-form-submissions-v1')).toBeNull();
  });

  it('lists the signed-in user rows returned through RLS', async () => {
    const order = vi.fn().mockResolvedValue({ data: [baseRow], error: null });
    clientMock.mockReturnValue({ from: () => ({ select: () => ({ order }) }) } as never);
    await expect(listFormSubmissions()).resolves.toEqual([expect.objectContaining({ id: baseRow.id, status: 'draft' })]);
  });

  it('creates a draft owned by the authenticated user', async () => {
    const insert = vi.fn(() => ({ select: () => ({ single: vi.fn().mockResolvedValue({ data: baseRow, error: null }) }) }));
    clientMock.mockReturnValue({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: userId } }, error: null }) }, from: () => ({ insert }) } as never);
    await createFormSubmission(siraAlliedHealthTreatmentRequest, 'NSW', {});
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ user_id: userId, status: 'draft' }));
  });

  it('updates and submits through the protected table', async () => {
    const single = vi.fn().mockResolvedValue({ data: { ...baseRow, values: { personName: 'Jordan' } }, error: null });
    const update = vi.fn(() => ({ eq: () => ({ select: () => ({ single }) }) }));
    clientMock.mockReturnValue({ from: () => ({ update }) } as never);
    await updateFormSubmission(baseRow.id, { personName: 'Jordan' });
    await markFormSubmissionSubmitted(baseRow.id, { personName: 'Jordan' });
    expect(update).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'submitted', submitted_at: expect.any(String) }));
  });

  it('deletes a request by id', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    clientMock.mockReturnValue({ from: () => ({ delete: () => ({ eq }) }) } as never);
    await deleteFormSubmission(baseRow.id);
    expect(eq).toHaveBeenCalledWith('id', baseRow.id);
  });
});
