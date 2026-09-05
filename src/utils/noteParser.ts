import type { FieldValue, FormValues, PdfTemplateDefinition } from '../forms/formTypes';
import type { PractitionerSettings } from './practitionerSettings';

export interface NoteDraftMeta {
  reviewFieldIds: string[];
  clinicalFlags: string[];
  notes: string[];
}

interface ParsedField {
  fieldId: string;
  value: FieldValue | null;
  needsReview: boolean;
}

interface ParseResponse {
  fields?: ParsedField[];
  clinicalFlags?: string[];
  error?: string;
}

export async function parseConsultNotes(
  clinicalNote: string,
  practiceProfile: PractitionerSettings,
  template: PdfTemplateDefinition,
): Promise<{ values: FormValues; meta: NoteDraftMeta }> {
  const response = await fetch('/api/parse-notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clinicalNote, practiceProfile }),
  });
  const result = (await response.json()) as ParseResponse;
  if (!response.ok) throw new Error(result.error || 'Unable to draft the form from these notes.');

  const fields = new Map(template.sections.flatMap((section) => section.fields).map((field) => [field.id, field]));
  const values: FormValues = {};
  const reviewFieldIds: string[] = [];

  for (const item of result.fields ?? []) {
    const field = fields.get(item.fieldId);
    if (!field || item.value === null) continue;
    if (field.type === 'checkbox' && typeof item.value !== 'boolean') continue;
    if (field.type !== 'checkbox' && typeof item.value !== 'string') continue;
    values[item.fieldId] = item.value;
    if (item.needsReview) reviewFieldIds.push(item.fieldId);
  }

  return {
    values,
    meta: {
      reviewFieldIds,
      clinicalFlags: result.clinicalFlags ?? [],
      notes: [],
    },
  };
}
