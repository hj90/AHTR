import type { FieldValue, FormFieldDefinition } from '../forms/formTypes';

export function formatValueForPdf(
  field: FormFieldDefinition,
  value: FieldValue,
): string {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : '';
  }

  if (field.type === 'date') {
    return formatDateForPdf(value);
  }

  if ((field.type === 'select' || field.type === 'radio') && field.options) {
    return field.options.find((option) => option.value === value)?.label ?? value;
  }

  return value;
}

export function formatDateForPdf(value: string): string {
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}
