import { getSupabaseClient } from './supabaseClient';
import {
  demoUserId,
  emptyPractitionerSettings,
  settingsToUserRow,
  userRowToSettings,
  type PractitionerSettings,
  type PractitionerSettingsRow,
} from '../utils/practitionerSettings';

const userColumns = [
  'id',
  'practitioner_name',
  'ahpra_number',
  'discipline',
  'provider_number',
  'practice_name',
  'practice_phone',
  'practice_email',
  'practice_address',
  'practice_state',
].join(', ');

export async function loadPractitionerSettings(): Promise<PractitionerSettings> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return emptyPractitionerSettings;
  }

  const { data, error } = await supabase
    .from('users')
    .select(userColumns)
    .eq('id', demoUserId)
    .maybeSingle<PractitionerSettingsRow>();

  if (error) {
    throw new Error('Unable to load practitioner settings from Supabase.');
  }

  return userRowToSettings(data);
}

export async function savePractitionerSettings(
  settings: PractitionerSettings,
): Promise<PractitionerSettings> {
  const supabase = requireSupabaseClient();
  const row = settingsToUserRow(settings);

  const { data, error } = await supabase
    .from('users')
    .upsert(row, { onConflict: 'id' })
    .select(userColumns)
    .single<PractitionerSettingsRow>();

  if (error) {
    throw new Error('Unable to save practitioner settings to Supabase.');
  }

  return userRowToSettings(data);
}

export async function clearPractitionerSettings(): Promise<void> {
  const supabase = requireSupabaseClient();
  const { error } = await supabase.from('users').delete().eq('id', demoUserId);

  if (error) {
    throw new Error('Unable to clear practitioner settings from Supabase.');
  }
}

function requireSupabaseClient() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  return supabase;
}
