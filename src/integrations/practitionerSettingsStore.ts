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
    throw new Error('Unable to save practitioner settings to Supabase.');
  }

  const clinicId = existingPractitionerResult.data?.clinic_id ?? createUuid();

  const clinicRow = settingsToClinicRow(settings, clinicId);
  const clinicResult = await supabase
    .from('clinics')
    .upsert(clinicRow, { onConflict: 'id' });

  if (clinicResult.error) {
    throw new Error('Unable to save practitioner settings to Supabase.');
  }

  const practitionerResult = await supabase
    .from('practitioners')
    .upsert(settingsToPractitionerRow(settings, clinicRow.id, userId), { onConflict: 'id' })
    .select(practitionerColumns)
    .single<PractitionerSettingsTableRow>();

  if (practitionerResult.error) {
    throw new Error('Unable to save practitioner settings to Supabase.');
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
