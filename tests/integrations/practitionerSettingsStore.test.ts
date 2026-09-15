import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearPractitionerSettings,
  loadPractitionerSettings,
  savePractitionerSettings,
} from '../../src/integrations/practitionerSettingsStore';
import { getSupabaseClient } from '../../src/integrations/supabaseClient';
import {
  demoClinicId,
  demoUserId,
  emptyPractitionerSettings,
  type ClinicSettingsRow,
  type PractitionerSettingsTableRow,
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
    const clinic: ClinicSettingsRow = {
      id: demoClinicId,
      practice_name: 'Example Allied Health',
      practice_email: 'practice@example.test',
      practice_phone: '0290000000',
      fax: '0290000001',
      suburb: 'Melbourne',
      state: 'VIC',
      postcode: '3000',
    };
    const practitioner: PractitionerSettingsTableRow = {
      id: demoUserId,
      clinic_id: demoClinicId,
      name: 'Alex Clinician',
      ahpra_number: 'PHY0000000000',
      discipline: 'Physiotherapist',
      sira_approval_number: 'SIRA-123',
      email: 'alex@example.test',
      preferred_contact_time: 'Weekday mornings',
      signature: 'Alex Clinician',
    };
    const clinicMaybeSingle = vi.fn().mockResolvedValue({ data: clinic, error: null });
    const practitionerMaybeSingle = vi.fn().mockResolvedValue({ data: practitioner, error: null });
    const practitionerEq = vi.fn(() => ({ maybeSingle: practitionerMaybeSingle }));
    const clinicEq = vi.fn(() => ({ maybeSingle: clinicMaybeSingle }));
    const select = vi.fn()
      .mockReturnValueOnce({ eq: practitionerEq })
      .mockReturnValueOnce({ eq: clinicEq });
    const from = vi.fn(() => ({ select }));
    getSupabaseClientMock.mockReturnValue({ from } as never);

    const settings = await loadPractitionerSettings();

    expect(from).toHaveBeenCalledWith('practitioners');
    expect(from).toHaveBeenCalledWith('clinics');
    expect(practitionerEq).toHaveBeenCalledWith('id', demoUserId);
    expect(clinicEq).toHaveBeenCalledWith('id', demoClinicId);
    expect(settings).toMatchObject({
      practitionerName: 'Alex Clinician',
      practiceEmail: 'practice@example.test',
      practitionerEmail: 'alex@example.test',
      practiceState: 'VIC',
      postcode: '3000',
    });
  });

  it('returns empty settings when Supabase is not configured', async () => {
    getSupabaseClientMock.mockReturnValue(null);

    await expect(loadPractitionerSettings()).resolves.toEqual(emptyPractitionerSettings);
  });

  it('inserts clinic details before upserting new practitioner settings', async () => {
    const signedInUserId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const generatedClinicId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    const randomUuid = vi
      .spyOn(crypto, 'randomUUID')
      .mockReturnValueOnce(generatedClinicId);
    const clinicInsert = vi.fn().mockResolvedValue({ error: null });
    const practitionerSingle = vi.fn().mockResolvedValue({
      data: {
        id: signedInUserId,
        clinic_id: generatedClinicId,
        name: 'Alex Clinician',
        ahpra_number: '',
        discipline: '',
        sira_approval_number: '',
        email: '',
        preferred_contact_time: '',
        signature: '',
      },
      error: null,
    });
    const existingPractitionerMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const existingPractitionerEq = vi.fn(() => ({ maybeSingle: existingPractitionerMaybeSingle }));
    const practitionerSelect = vi.fn(() => ({ eq: existingPractitionerEq }));
    const practitionerUpsert = vi.fn(() => ({ select: () => ({ single: practitionerSingle }) }));
    const from = vi.fn((table: string) => {
      if (table === 'clinics') return { insert: clinicInsert };
      return { select: practitionerSelect, upsert: practitionerUpsert };
    });
    getSupabaseClientMock.mockReturnValue({ from } as never);

    await savePractitionerSettings(
      {
        ...emptyPractitionerSettings,
        practitionerName: 'Alex Clinician',
      },
      signedInUserId,
    );

    expect(from).not.toHaveBeenCalledWith('users');
    expect(existingPractitionerEq).toHaveBeenCalledWith('id', signedInUserId);
    expect(clinicInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: generatedClinicId,
      }),
    );
    expect(practitionerUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: signedInUserId,
        clinic_id: generatedClinicId,
        name: 'Alex Clinician',
      }),
      { onConflict: 'id' },
    );
    randomUuid.mockRestore();
  });

  it('updates existing clinic details before upserting existing practitioner settings', async () => {
    const signedInUserId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const existingClinicId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    const clinicUpdateEq = vi.fn().mockResolvedValue({ error: null });
    const clinicUpdate = vi.fn(() => ({ eq: clinicUpdateEq }));
    const practitionerSingle = vi.fn().mockResolvedValue({
      data: {
        id: signedInUserId,
        clinic_id: existingClinicId,
        name: 'Alex Clinician',
        ahpra_number: '',
        discipline: '',
        sira_approval_number: '',
        email: '',
        preferred_contact_time: '',
        signature: '',
      },
      error: null,
    });
    const existingPractitionerMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: signedInUserId,
        clinic_id: existingClinicId,
        name: '',
        ahpra_number: '',
        discipline: '',
        sira_approval_number: '',
        email: '',
        preferred_contact_time: '',
        signature: '',
      },
      error: null,
    });
    const existingPractitionerEq = vi.fn(() => ({ maybeSingle: existingPractitionerMaybeSingle }));
    const practitionerSelect = vi.fn(() => ({ eq: existingPractitionerEq }));
    const practitionerUpsert = vi.fn(() => ({ select: () => ({ single: practitionerSingle }) }));
    const from = vi.fn((table: string) => {
      if (table === 'clinics') return { update: clinicUpdate };
      return { select: practitionerSelect, upsert: practitionerUpsert };
    });
    getSupabaseClientMock.mockReturnValue({ from } as never);

    await savePractitionerSettings(
      {
        ...emptyPractitionerSettings,
        practitionerName: 'Alex Clinician',
      },
      signedInUserId,
    );

    expect(clinicUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: existingClinicId,
      }),
    );
    expect(clinicUpdateEq).toHaveBeenCalledWith('id', existingClinicId);
    expect(practitionerUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: signedInUserId,
        clinic_id: existingClinicId,
        name: 'Alex Clinician',
      }),
      { onConflict: 'id' },
    );
  });

  it('shows a clear error when the practitioner email is already used', async () => {
    const signedInUserId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const existingClinicId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    const clinicUpdateEq = vi.fn().mockResolvedValue({ error: null });
    const clinicUpdate = vi.fn(() => ({ eq: clinicUpdateEq }));
    const practitionerSingle = vi.fn().mockResolvedValue({
      data: null,
      error: {
        code: '23505',
        message: 'duplicate key value violates unique constraint "practitioners_email_unique_idx"',
      },
    });
    const existingPractitionerMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: signedInUserId,
        clinic_id: existingClinicId,
        name: '',
        ahpra_number: '',
        discipline: '',
        sira_approval_number: '',
        email: '',
        preferred_contact_time: '',
        signature: '',
      },
      error: null,
    });
    const existingPractitionerEq = vi.fn(() => ({ maybeSingle: existingPractitionerMaybeSingle }));
    const practitionerSelect = vi.fn(() => ({ eq: existingPractitionerEq }));
    const practitionerUpsert = vi.fn(() => ({ select: () => ({ single: practitionerSingle }) }));
    const from = vi.fn((table: string) => {
      if (table === 'clinics') return { update: clinicUpdate };
      return { select: practitionerSelect, upsert: practitionerUpsert };
    });
    getSupabaseClientMock.mockReturnValue({ from } as never);

    await expect(savePractitionerSettings(
      {
        ...emptyPractitionerSettings,
        practitionerEmail: 'alex@example.test',
      },
      signedInUserId,
    )).rejects.toThrow('Another practitioner is already using this email address.');
  });

  it('deletes the demo practitioner settings row', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const deleteRow = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ delete: deleteRow }));
    getSupabaseClientMock.mockReturnValue({ from } as never);

    await clearPractitionerSettings();

    expect(from).toHaveBeenCalledWith('practitioners');
    expect(deleteRow).toHaveBeenCalledWith();
    expect(eq).toHaveBeenCalledWith('id', demoUserId);
  });

  it('throws when the practitioner settings row cannot be cleared', async () => {
    const eq = vi.fn().mockResolvedValue({ error: new Error('missing table') });
    const deleteRow = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ delete: deleteRow }));
    getSupabaseClientMock.mockReturnValue({ from } as never);

    await expect(clearPractitionerSettings()).rejects.toThrow('Unable to clear practitioner settings from Supabase.');
    expect(from).toHaveBeenCalledWith('practitioners');
    expect(eq).toHaveBeenCalledWith('id', demoUserId);
  });
});
