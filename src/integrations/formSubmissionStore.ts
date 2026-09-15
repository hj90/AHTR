import type { FormValues, PdfTemplateDefinition } from '../forms/formTypes';
import { getSupabaseClient } from './supabaseClient';

export type SubmissionStatus = 'draft' | 'submitted';
export interface FormSubmission { id: string; templateId: string; practiceState: 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA'; status: SubmissionStatus; values: FormValues; createdAt: string; updatedAt: string; submittedAt: string | null; }
interface SubmissionRow { id: string; template_id: string; practice_state: FormSubmission['practiceState']; status: SubmissionStatus; values: FormValues; created_at: string; updated_at: string; submitted_at: string | null; }
const columns = 'id, template_id, practice_state, status, values, created_at, updated_at, submitted_at';
const legacyStorageKey = 'ahtr-form-submissions-v1';

export async function migrateLocalSubmissionsToAccount(): Promise<void> {
  const stored = window.localStorage.getItem(legacyStorageKey);
  if (!stored) return;
  let submissions: FormSubmission[];
  try {
    const parsed: unknown = JSON.parse(stored);
    submissions = Array.isArray(parsed) ? parsed.filter(isFormSubmission) : [];
  } catch {
    submissions = [];
  }
  if (submissions.length === 0) {
    window.localStorage.removeItem(legacyStorageKey);
    return;
  }

  const supabase = requireSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error('Your session has expired. Please log in again.');
  const rows = submissions.map((submission) => ({
    id: submission.id, user_id: authData.user.id, template_id: submission.templateId,
    practice_state: submission.practiceState, status: submission.status, values: submission.values,
    created_at: submission.createdAt, updated_at: submission.updatedAt, submitted_at: submission.submittedAt,
  }));
  const { error } = await supabase.from('form_submissions').upsert(rows, { onConflict: 'id' });
  if (error) throw new Error('Unable to move drafts saved on this device into your account.');
  window.localStorage.removeItem(legacyStorageKey);
}

export async function listFormSubmissions(): Promise<FormSubmission[]> {
  const { data, error } = await requireSupabaseClient().from('form_submissions').select(columns).order('updated_at', { ascending: false });
  if (error) throw new Error('Unable to load saved requests.');
  return ((data ?? []) as SubmissionRow[]).map(fromRow);
}

export async function createFormSubmission(template: PdfTemplateDefinition, practiceState: FormSubmission['practiceState'], values: FormValues): Promise<FormSubmission> {
  const supabase = requireSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error('Your session has expired. Please log in again.');
  const { data, error } = await supabase.from('form_submissions').insert({ user_id: authData.user.id, template_id: template.id, practice_state: practiceState, status: 'draft', values }).select(columns).single<SubmissionRow>();
  if (error) throw new Error('Unable to save this draft.');
  return fromRow(data);
}

export async function updateFormSubmission(id: string, values: FormValues): Promise<FormSubmission> { return updateSubmission(id, { values }); }
export async function markFormSubmissionSubmitted(id: string, values: FormValues): Promise<FormSubmission> { return updateSubmission(id, { values, status: 'submitted', submitted_at: new Date().toISOString() }); }
export async function deleteFormSubmission(id: string): Promise<void> {
  const { error } = await requireSupabaseClient().from('form_submissions').delete().eq('id', id);
  if (error) throw new Error('Unable to delete this saved request.');
}
async function updateSubmission(id: string, changes: Record<string, unknown>): Promise<FormSubmission> {
  const { data, error } = await requireSupabaseClient().from('form_submissions').update(changes).eq('id', id).select(columns).single<SubmissionRow>();
  if (error) throw new Error('Unable to update this saved request.');
  return fromRow(data);
}
function requireSupabaseClient() { const supabase = getSupabaseClient(); if (!supabase) throw new Error('Supabase is not configured.'); return supabase; }
function fromRow(row: SubmissionRow): FormSubmission { return { id: row.id, templateId: row.template_id, practiceState: row.practice_state, status: row.status, values: row.values, createdAt: row.created_at, updatedAt: row.updated_at, submittedAt: row.submitted_at }; }
function isFormSubmission(value: unknown): value is FormSubmission {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<FormSubmission>;
  return typeof item.id === 'string' && typeof item.templateId === 'string'
    && ['NSW', 'VIC', 'QLD', 'WA', 'SA'].includes(item.practiceState ?? '')
    && (item.status === 'draft' || item.status === 'submitted')
    && Boolean(item.values && typeof item.values === 'object')
    && typeof item.createdAt === 'string' && typeof item.updatedAt === 'string';
}
