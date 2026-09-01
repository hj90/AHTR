import type { FormFieldDefinition, FieldValue } from '../forms/formTypes';

interface FormFieldProps {
  field: FormFieldDefinition;
  value: FieldValue;
  error?: string;
  onChange: (fieldId: string, value: FieldValue) => void;
}

export function FormField({ field, value, error, onChange }: FormFieldProps) {
  const describedBy = [
    field.helpText ? `${field.id}-help` : null,
    error ? `${field.id}-error` : null,
  ]
    .filter(Boolean)
    .join(' ');

  if (field.type === 'checkbox') {
    return (
      <div className="field field--checkbox">
        <label className="checkbox-row">
          <input
            id={field.id}
            type="checkbox"
            checked={value === true}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy || undefined}
            onChange={(event) => onChange(field.id, event.target.checked)}
          />
          <span>
            {field.label}
            {field.required ? <span aria-hidden="true"> *</span> : null}
          </span>
        </label>
        <FieldSupport field={field} error={error} />
      </div>
    );
  }

  if (field.type === 'radio') {
    return (
      <fieldset className="field fieldset" aria-describedby={describedBy || undefined}>
        <legend>
          {field.label}
          {field.required ? <span aria-hidden="true"> *</span> : null}
        </legend>
        <div className="choice-grid">
          {field.options?.map((option) => (
            <label key={option.value} className="choice">
              <input
                type="radio"
                name={field.id}
                value={option.value}
                checked={value === option.value}
                onChange={(event) => onChange(field.id, event.target.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        <FieldSupport field={field} error={error} />
      </fieldset>
    );
  }

  return (
    <div className="field">
      <label htmlFor={field.id}>
        {field.label}
        {field.required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {field.type === 'textarea' ? (
        <textarea
          id={field.id}
          value={String(value)}
          rows={field.id === 'clinicalReason' ? 6 : 3}
          placeholder={field.placeholder}
          autoComplete={field.autocomplete ?? 'off'}
          maxLength={field.validation?.maxLength}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          onChange={(event) => onChange(field.id, event.target.value)}
        />
      ) : field.type === 'select' ? (
        <select
          id={field.id}
          value={String(value)}
          autoComplete={field.autocomplete ?? 'off'}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          onChange={(event) => onChange(field.id, event.target.value)}
        >
          <option value="">Select one</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={field.id}
          type={field.type}
          value={String(value)}
          placeholder={field.placeholder}
          autoComplete={field.autocomplete ?? 'off'}
          maxLength={field.validation?.maxLength}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          onChange={(event) => onChange(field.id, event.target.value)}
        />
      )}
      <FieldSupport field={field} error={error} />
    </div>
  );
}

function FieldSupport({
  field,
  error,
}: {
  field: FormFieldDefinition;
  error?: string;
}) {
  return (
    <>
      {field.helpText ? (
        <p id={`${field.id}-help`} className="field-help">
          {field.helpText}
        </p>
      ) : null}
      {error ? (
        <p id={`${field.id}-error`} className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}
