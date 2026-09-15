import { getSupabaseClient } from './supabaseClient';
import {
  clinicAndPractitionerRowsToSettings,
  demoUserId,
  emptyPractitionerSettings,
  settingsToClinicRow,
  settingsToPractitionerRow,
  type ClinicSettingsRow,
  type PractitionerSettings,
  type PractitionerSettingsTableRow,
} from '../utils/practitionerSettings';

const clinicColumns = [
  'id',
  'practice_name',
  'practice_email',
  'practice_phone',
  'fax',
  'suburb',
  'state',
  'postcode',
].join(', ');

const practitionerColumns = [
  'id',
  'clinic_id',
  'name',
  'ahpra_number',
  'discipline',
  'sira_approval_number',
  'email',
  'preferred_contact_time',
  'signature',
].join(', ');

export async function loadPractitionerSettings(userId = demoUserId): Promise<PractitionerSettings> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return emptyPractitionerSettings;
  }

  const practitionerResult = await supabase
    .from('practitioners')
    .select(practitionerColumns)
    .eq('id', userId)
    .maybeSingle<PractitionerSettingsTableRow>();

  if (practitionerResult.error) {
    throw new Error('Unable to load practitioner settings from Supabase.');
  }

  if (!practitionerResult.data) {
    return emptyPractitionerSettings;
  }

  const clinicResult = await supabase
    .from('clinics')
    .select(clinicColumns)
    .eq('id', practitionerResult.data.clinic_id)
    .maybeSingle<ClinicSettingsRow>();

  if (clinicResult.error) {
    throw new Error('Unable to load practitioner settings from Supabase.');
  }

  return clinicAndPractitionerRowsToSettings(clinicResult.data, practitionerResult.data);
}

export async function savePractitionerSettings(
  settings: PractitionerSettings,
  userId = demoUserId,
): Promise<PractitionerSettings> {
  const supabase = requireSupabaseClient();

  const existingPractitionerResult = await supabase
    .from('practitioners')
    .select(practitionerColumns)
    .eq('id', userId)
    .maybeSingle<PractitionerSettingsTableRow>();

  if (existingPractitionerResult.error) {
    throw practitionerSettingsError('save practitioner settings', existingPractitionerResult.error);
  }

  const existingPractitioner = existingPractitionerResult.data;
  const clinicId = existingPractitioner?.clinic_id ?? createUuid();

  const clinicRow = settingsToClinicRow(settings, clinicId);
  const clinicResult = existingPractitioner
    ? await supabase
      .from('clinics')
      .update(clinicRow)
      .eq('id', clinicRow.id)
    : await supabase
      .from('clinics')
      .insert(clinicRow);

  if (clinicResult.error) {
    throw practitionerSettingsError('save clinic details', clinicResult.error);
  }

  const practitionerResult = await supabase
    .from('practitioners')
    .upsert(settingsToPractitionerRow(settings, clinicRow.id, userId), { onConflict: 'id' })
    .select(practitionerColumns)
    .single<PractitionerSettingsTableRow>();

  if (practitionerResult.error) {
    throw practitionerSettingsError('save practitioner details', practitionerResult.error);
  }

  return clinicAndPractitionerRowsToSettings(clinicRow, practitionerResult.data);
}

export async function clearPractitionerSettings(userId = demoUserId): Promise<void> {
  const supabase = requireSupabaseClient();
  const { error } = await supabase.from('practitioners').delete().eq('id', userId);

  if (error) {
    throw new Error('Unable to clear practitioner settings from Supabase.');
  }
}

function createUuid() {
  return crypto.randomUUID();
}

function requireSupabaseClient() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  return supabase;
}

function practitionerSettingsError(operation: string, error: { message?: string }) {
  const detail = error.message ? ` ${error.message}` : '';
  return new Error(`Unable to save practitioner settings to Supabase (${operation}).${detail}`);
}
