import { getSupabaseClient } from './supabaseClient';
import { emptyPractitionerSettings, settingsToUserRow, userRowToSettings, type PractitionerSettings, type PractitionerSettingsRow } from '../utils/practitionerSettings';

const profileColumns = ['id', 'practitioner_name', 'ahpra_number', 'discipline', 'provider_number', 'practice_name', 'practice_phone', 'practice_email', 'practice_address', 'practice_state'].join(', ');

export async function loadPractitionerSettings(): Promise<PractitionerSettings> {
  const { data, error } = await requireSupabaseClient().from('profiles').select(profileColumns).maybeSingle<PractitionerSettingsRow>();
  if (error) throw new Error('Unable to load practitioner settings from Supabase.');
  return data ? userRowToSettings(data) : emptyPractitionerSettings;
}

export async function savePractitionerSettings(settings: PractitionerSettings): Promise<PractitionerSettings> {
  const supabase = requireSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error('Your session has expired. Please log in again.');
  const { data, error } = await supabase.from('profiles').upsert(settingsToUserRow(settings, authData.user.id), { onConflict: 'id' }).select(profileColumns).single<PractitionerSettingsRow>();
  if (error) throw new Error('Unable to save practitioner settings to Supabase.');
  return userRowToSettings(data);
}

export async function clearPractitionerSettings(): Promise<void> {
  const supabase = requireSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error('Your session has expired. Please log in again.');
  const { error } = await supabase.from('profiles').delete().eq('id', authData.user.id);
  if (error) throw new Error('Unable to clear practitioner settings from Supabase.');
}

function requireSupabaseClient() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
}
