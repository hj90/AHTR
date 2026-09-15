import type { FormValues, PdfTemplateDefinition } from '../forms/formTypes';

export type SubmissionStatus = 'draft' | 'submitted';

export interface FormSubmission {
  id: string;
  templateId: string;
  practiceState: 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA';
  status: SubmissionStatus;
  values: FormValues;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
}

const storageKey = 'ahtr-form-submissions-v1';

export async function listFormSubmissions(): Promise<FormSubmission[]> {
  return readSubmissions().sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function createFormSubmission(
  template: PdfTemplateDefinition,
  practiceState: FormSubmission['practiceState'],
  values: FormValues,
): Promise<FormSubmission> {
  const now = new Date().toISOString();
  const submission: FormSubmission = {
    id: crypto.randomUUID(),
    templateId: template.id,
    practiceState,
    status: 'draft',
    values,
    createdAt: now,
    updatedAt: now,
    submittedAt: null,
  };

  writeSubmissions([submission, ...readSubmissions()]);
  return submission;
}

export async function updateFormSubmission(id: string, values: FormValues): Promise<FormSubmission> {
  return updateSubmission(id, (submission) => ({
    ...submission,
    values,
    updatedAt: new Date().toISOString(),
  }));
}

export async function markFormSubmissionSubmitted(id: string, values: FormValues): Promise<FormSubmission> {
  const now = new Date().toISOString();
  return updateSubmission(id, (submission) => ({
    ...submission,
    values,
    status: 'submitted',
    updatedAt: now,
    submittedAt: now,
  }));
}

export async function deleteFormSubmission(id: string): Promise<void> {
  writeSubmissions(readSubmissions().filter((submission) => submission.id !== id));
}

function updateSubmission(
  id: string,
  update: (submission: FormSubmission) => FormSubmission,
): FormSubmission {
  const submissions = readSubmissions();
  const index = submissions.findIndex((submission) => submission.id === id);
  if (index === -1) throw new Error('This saved request could not be found.');

  const saved = update(submissions[index]);
  submissions[index] = saved;
  writeSubmissions(submissions);
  return saved;
}

function readSubmissions(): FormSubmission[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isFormSubmission);
  } catch {
    return [];
  }
}

function writeSubmissions(submissions: FormSubmission[]) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(submissions));
  } catch {
    throw new Error('Browser storage is full or unavailable. This request was not saved.');
  }
}

function isFormSubmission(value: unknown): value is FormSubmission {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<FormSubmission>;
  return typeof candidate.id === 'string'
    && typeof candidate.templateId === 'string'
    && ['NSW', 'VIC', 'QLD', 'WA', 'SA'].includes(candidate.practiceState ?? '')
    && (candidate.status === 'draft' || candidate.status === 'submitted')
    && Boolean(candidate.values && typeof candidate.values === 'object')
    && typeof candidate.createdAt === 'string'
    && typeof candidate.updatedAt === 'string';
}
