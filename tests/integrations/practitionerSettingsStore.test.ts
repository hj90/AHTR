import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearPractitionerSettings,
  loadPractitionerSettings,
  savePractitionerSettings,
} from '../../src/integrations/practitionerSettingsStore';
import { getSupabaseClient } from '../../src/integrations/supabaseClient';
import {
  demoUserId,
  emptyPractitionerSettings,
  type PractitionerSettingsRow,
} from '../../src/utils/practitionerSettings';

vi.mock('../../src/integrations/supabaseClient', () => ({
  getSupabaseClient: vi.fn(),
}));

const getSupabaseClientMock = vi.mocked(getSupabaseClient);

describe('practitioner settings store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('loads the demo user settings from Supabase', async () => {
    const row: PractitionerSettingsRow = {
      id: demoUserId,
      practitioner_name: 'Alex Clinician',
      ahpra_number: 'PHY0000000000',
      discipline: 'Physiotherapist',
      provider_number: 'SIRA-123',
      practice_name: 'Example Allied Health',
      practice_phone: '0290000000',
      practice_email: 'practice@example.test',
      practice_address: '1 Example Street',
      practice_state: 'VIC',
    };
    const maybeSingle = vi.fn().mockResolvedValue({ data: row, error: null });
    const eq = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select }));
    getSupabaseClientMock.mockReturnValue({ from } as never);

    const settings = await loadPractitionerSettings();

    expect(from).toHaveBeenCalledWith('users');
    expect(eq).toHaveBeenCalledWith('id', demoUserId);
    expect(settings).toMatchObject({
      practitionerName: 'Alex Clinician',
      practiceEmail: 'practice@example.test',
    });
  });

  it('returns empty settings when Supabase is not configured', async () => {
    getSupabaseClientMock.mockReturnValue(null);

    await expect(loadPractitionerSettings()).resolves.toEqual(emptyPractitionerSettings);
  });

  it('loads the state from this browser when the database migration is pending', async () => {
    window.localStorage.setItem('ahtr-practice-state', 'VIC');
    const currentMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: new Error('missing column') });
    const legacyMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: demoUserId,
        practitioner_name: 'Alex Clinician',
        ahpra_number: '',
        discipline: 'Physiotherapist',
        provider_number: '',
        practice_name: '',
        practice_phone: '',
        practice_email: '',
        practice_address: '',
      },
      error: null,
    });
    const select = vi.fn()
      .mockReturnValueOnce({ eq: () => ({ maybeSingle: currentMaybeSingle }) })
      .mockReturnValueOnce({ eq: () => ({ maybeSingle: legacyMaybeSingle }) });
    getSupabaseClientMock.mockReturnValue({ from: () => ({ select }) } as never);

    await expect(loadPractitionerSettings()).resolves.toMatchObject({
      practitionerName: 'Alex Clinician',
      practiceState: 'VIC',
    });
  });

  it('upserts practitioner settings against the demo user', async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        id: demoUserId,
        practitioner_name: 'Alex Clinician',
        ahpra_number: '',
        discipline: '',
        provider_number: '',
        practice_name: '',
        practice_phone: '',
        practice_email: '',
        practice_address: '',
        practice_state: 'NSW',
      },
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const upsert = vi.fn(() => ({ select }));
    const from = vi.fn(() => ({ upsert }));
    getSupabaseClientMock.mockReturnValue({ from } as never);

    await savePractitionerSettings({
      ...emptyPractitionerSettings,
      practitionerName: 'Alex Clinician',
    });

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: demoUserId,
        practitioner_name: 'Alex Clinician',
      }),
      { onConflict: 'id' },
    );
  });

  it('saves the state in this browser when the database migration is pending', async () => {
    const currentSingle = vi.fn().mockResolvedValue({ data: null, error: new Error('missing column') });
    const legacySingle = vi.fn().mockResolvedValue({
      data: {
        id: demoUserId,
        practitioner_name: 'Alex Clinician',
        ahpra_number: '',
        discipline: '',
        provider_number: '',
        practice_name: '',
        practice_phone: '',
        practice_email: '',
        practice_address: '',
      },
      error: null,
    });
    const upsert = vi.fn()
      .mockReturnValueOnce({ select: () => ({ single: currentSingle }) })
      .mockReturnValueOnce({ select: () => ({ single: legacySingle }) });
    getSupabaseClientMock.mockReturnValue({ from: () => ({ upsert }) } as never);

    const saved = await savePractitionerSettings({
      ...emptyPractitionerSettings,
      practitionerName: 'Alex Clinician',
      practiceState: 'VIC',
    });

    expect(saved.practiceState).toBe('VIC');
    expect(window.localStorage.getItem('ahtr-practice-state')).toBe('VIC');
    expect(upsert).toHaveBeenLastCalledWith(
      expect.not.objectContaining({ practice_state: expect.anything() }),
      { onConflict: 'id' },
    );
  });

  it('deletes the demo user settings row', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const deleteRow = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ delete: deleteRow }));
    getSupabaseClientMock.mockReturnValue({ from } as never);

    await clearPractitionerSettings();

    expect(from).toHaveBeenCalledWith('users');
    expect(deleteRow).toHaveBeenCalledWith();
    expect(eq).toHaveBeenCalledWith('id', demoUserId);
  });
});
