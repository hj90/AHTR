import type { FormValues, PdfTemplateDefinition } from '../forms/formTypes';

export interface ClearedFormState {
  values: FormValues;
  generatedPdfUrl: string | null;
}

export function getInitialFormValues(template: PdfTemplateDefinition): FormValues {
  return Object.fromEntries(
    template.sections.flatMap((section) =>
      section.fields.map((field) => [field.id, field.type === 'checkbox' ? false : '']),
    ),
  );
}

export function clearGeneratedPdfUrl(
  generatedPdfUrl: string | null,
  revokeObjectUrl: (url: string) => void = URL.revokeObjectURL,
): void {
  if (generatedPdfUrl) {
    revokeObjectUrl(generatedPdfUrl);
  }
}

export function resetFormState(
  template: PdfTemplateDefinition,
  generatedPdfUrl: string | null,
  revokeObjectUrl: (url: string) => void = URL.revokeObjectURL,
): ClearedFormState {
  clearGeneratedPdfUrl(generatedPdfUrl, revokeObjectUrl);
  return {
    values: getInitialFormValues(template),
    generatedPdfUrl: null,
  };
}
