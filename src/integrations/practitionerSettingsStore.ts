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

const legacyUserColumns = [
  'id',
  'practitioner_name',
  'ahpra_number',
  'discipline',
  'provider_number',
  'practice_name',
  'practice_phone',
  'practice_email',
  'practice_address',
].join(', ');

const practiceStateStorageKey = 'ahtr-practice-state';

function loadLocalPracticeState(): PractitionerSettings['practiceState'] {
  return window.localStorage.getItem(practiceStateStorageKey) === 'VIC' ? 'VIC' : 'NSW';
}

function saveLocalPracticeState(state: PractitionerSettings['practiceState']) {
  window.localStorage.setItem(practiceStateStorageKey, state);
}

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
    const legacyResult = await supabase
      .from('users')
      .select(legacyUserColumns)
      .eq('id', demoUserId)
      .maybeSingle<Omit<PractitionerSettingsRow, 'practice_state'>>();

    if (legacyResult.error) {
      throw new Error('Unable to load practitioner settings from Supabase.');
    }

    return {
      ...userRowToSettings(legacyResult.data),
      practiceState: loadLocalPracticeState(),
    };
  }

  const settings = userRowToSettings(data);
  saveLocalPracticeState(settings.practiceState);
  return settings;
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
    const { practice_state: _practiceState, ...legacyRow } = row;
    const legacyResult = await supabase
      .from('users')
      .upsert(legacyRow, { onConflict: 'id' })
      .select(legacyUserColumns)
      .single<Omit<PractitionerSettingsRow, 'practice_state'>>();

    if (legacyResult.error) {
      throw new Error('Unable to save practitioner settings to Supabase.');
    }

    saveLocalPracticeState(settings.practiceState);
    return {
      ...userRowToSettings(legacyResult.data),
      practiceState: settings.practiceState,
    };
  }

  const storedSettings = userRowToSettings(data);
  saveLocalPracticeState(storedSettings.practiceState);
  return storedSettings;
}

export async function clearPractitionerSettings(): Promise<void> {
  window.localStorage.removeItem(practiceStateStorageKey);
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
