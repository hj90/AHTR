import type {
  FieldValue,
  FormFieldDefinition,
  FormValues,
  PdfTemplateDefinition,
} from '../forms/formTypes';

export type ValidationErrors = Record<string, string>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateTemplate(
  template: PdfTemplateDefinition,
  values: FormValues,
): ValidationErrors {
  return template.sections.reduce<ValidationErrors>((errors, section) => {
    for (const field of section.fields) {
      const message = validateField(field, values[field.id], values);
      if (message) {
        errors[field.id] = message;
      }
    }

    return errors;
  }, {});
}

export function validateField(
  field: FormFieldDefinition,
  value: FieldValue | undefined,
  values: FormValues = {},
): string | null {
  const requiredWhen = field.requiredWhen?.find((condition) => {
    const sourceValue = values[condition.fieldId];
    if (condition.oneOf) {
      return condition.oneOf.includes(sourceValue);
    }
    return sourceValue === condition.equals;
  });

  if ((field.required || requiredWhen) && isEmpty(value)) {
    if (requiredWhen?.message) {
      return requiredWhen.message;
    }

    return field.type === 'checkbox'
      ? 'This confirmation is required.'
      : 'This field is required.';
  }

  if (isEmpty(value)) {
    return null;
  }

  if (typeof value === 'string') {
    if (field.type === 'email' && !emailPattern.test(value)) {
      return 'Enter a valid email address.';
    }

    if (field.type === 'date' && Number.isNaN(Date.parse(value))) {
      return 'Enter a valid date.';
    }

    if (field.validation?.maxLength && value.length > field.validation.maxLength) {
      return `Use ${field.validation.maxLength} characters or fewer.`;
    }

    if (field.validation?.pattern) {
      const pattern = new RegExp(field.validation.pattern);
      if (!pattern.test(value)) {
        return 'Use a valid format for this field.';
      }
    }
  }

  return null;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

function isEmpty(value: FieldValue | undefined): boolean {
  return value === undefined || value === '' || value === false;
}
