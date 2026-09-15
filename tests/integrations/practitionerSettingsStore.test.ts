import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearPractitionerSettings, loadPractitionerSettings, savePractitionerSettings } from '../../src/integrations/practitionerSettingsStore';
import { getSupabaseClient } from '../../src/integrations/supabaseClient';
import { emptyPractitionerSettings, type PractitionerSettingsRow } from '../../src/utils/practitionerSettings';

vi.mock('../../src/integrations/supabaseClient', () => ({ getSupabaseClient: vi.fn() }));
const clientMock = vi.mocked(getSupabaseClient);
const userId = '22222222-2222-4222-8222-222222222222';
const row: PractitionerSettingsRow = { id: userId, practitioner_name: 'Alex Clinician', ahpra_number: '', discipline: 'Physiotherapist', provider_number: '', practice_name: '', practice_phone: '', practice_email: '', practice_address: '', practice_state: 'VIC' };

describe('practitioner settings store', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads only the signed-in profile selected by row-level security', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: row, error: null });
    const select = vi.fn(() => ({ maybeSingle }));
    const from = vi.fn(() => ({ select }));
    clientMock.mockReturnValue({ from } as never);
    await expect(loadPractitionerSettings()).resolves.toMatchObject({ practitionerName: 'Alex Clinician', practiceState: 'VIC' });
    expect(from).toHaveBeenCalledWith('profiles');
  });

  it('returns empty settings when the user has no profile yet', async () => {
    clientMock.mockReturnValue({ from: () => ({ select: () => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) }) }) } as never);
    await expect(loadPractitionerSettings()).resolves.toEqual(emptyPractitionerSettings);
  });

  it('upserts settings using the authenticated user id', async () => {
    const single = vi.fn().mockResolvedValue({ data: row, error: null });
    const upsert = vi.fn(() => ({ select: () => ({ single }) }));
    clientMock.mockReturnValue({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: userId } }, error: null }) }, from: () => ({ upsert }) } as never);
    await savePractitionerSettings({ ...emptyPractitionerSettings, practitionerName: 'Alex Clinician', practiceState: 'VIC' });
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ id: userId, practitioner_name: 'Alex Clinician' }), { onConflict: 'id' });
  });

  it('deletes only the profile permitted by row-level security', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    clientMock.mockReturnValue({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: userId } }, error: null }) }, from: vi.fn(() => ({ delete: () => ({ eq }) })) } as never);
    await clearPractitionerSettings();
    expect(eq).toHaveBeenCalledWith('id', userId);
  });
});
