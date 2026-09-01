import type {
  FieldValue,
  FormFieldDefinition,
  FormSectionDefinition,
  FormValues,
} from '../forms/formTypes';
import type { ValidationErrors } from './validation';

export type SectionProgressState =
  | 'not-started'
  | 'in-progress'
  | 'complete'
  | 'needs-attention'
  | 'optional';

export interface SectionProgress {
  state: SectionProgressState;
  label: string;
  detail: string;
  filledCount: number;
  fieldCount: number;
  requiredCount: number;
  requiredFilledCount: number;
  errorCount: number;
}

export function getSectionProgress(
  section: FormSectionDefinition,
  values: FormValues,
  errors: ValidationErrors,
): SectionProgress {
  const requiredFields = section.fields.filter((field) => isFieldRequiredNow(field, values));
  const filledCount = section.fields.filter((field) => hasValue(values[field.id])).length;
  const requiredFilledCount = requiredFields.filter((field) => hasValue(values[field.id])).length;
  const errorCount = section.fields.filter((field) => errors[field.id]).length;

  if (errorCount > 0) {
    return {
      state: 'needs-attention',
      label: 'Needs attention',
      detail: `${errorCount} issue${errorCount === 1 ? '' : 's'} here`,
      filledCount,
      fieldCount: section.fields.length,
      requiredCount: requiredFields.length,
      requiredFilledCount,
      errorCount,
    };
  }

  if (requiredFields.length > 0 && requiredFilledCount === requiredFields.length) {
    return {
      state: 'complete',
      label: 'Complete',
      detail: 'Required fields complete',
      filledCount,
      fieldCount: section.fields.length,
      requiredCount: requiredFields.length,
      requiredFilledCount,
      errorCount,
    };
  }

  if (requiredFields.length === 0 && filledCount > 0) {
    return {
      state: 'complete',
      label: 'Complete',
      detail: 'Optional entries added',
      filledCount,
      fieldCount: section.fields.length,
      requiredCount: requiredFields.length,
      requiredFilledCount,
      errorCount,
    };
  }

  if (filledCount > 0) {
    return {
      state: 'in-progress',
      label: 'In progress',
      detail: `${requiredFilledCount} of ${requiredFields.length} required filled`,
      filledCount,
      fieldCount: section.fields.length,
      requiredCount: requiredFields.length,
      requiredFilledCount,
      errorCount,
    };
  }

  if (requiredFields.length === 0) {
    return {
      state: 'optional',
      label: 'Optional',
      detail: 'No required fields',
      filledCount,
      fieldCount: section.fields.length,
      requiredCount: requiredFields.length,
      requiredFilledCount,
      errorCount,
    };
  }

  return {
    state: 'not-started',
    label: 'Not started',
    detail: `${requiredFields.length} required field${requiredFields.length === 1 ? '' : 's'}`,
    filledCount,
    fieldCount: section.fields.length,
    requiredCount: requiredFields.length,
    requiredFilledCount,
    errorCount,
  };
}

export function isFieldRequiredNow(field: FormFieldDefinition, values: FormValues): boolean {
  if (field.required) {
    return true;
  }

  return Boolean(
    field.requiredWhen?.some((condition) => {
      const sourceValue = values[condition.fieldId];

      if (condition.oneOf) {
        return condition.oneOf.includes(sourceValue);
      }

      return sourceValue === condition.equals;
    }),
  );
}

function hasValue(value: FieldValue | undefined): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return value === true;
}
