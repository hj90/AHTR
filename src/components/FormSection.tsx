import { HelpCircle, Plus, Trash2 } from 'lucide-react';
import type { FieldValue, FormSectionDefinition } from '../forms/formTypes';
import type { ValidationErrors } from '../utils/validation';
import { FormField } from './FormField';

interface FormSectionProps {
  section: FormSectionDefinition;
  values: Record<string, FieldValue>;
  errors: ValidationErrors;
  onChange: (fieldId: string, value: FieldValue) => void;
}

export function FormSection({
  section,
  values,
  errors,
  onChange,
}: FormSectionProps) {
  if (section.id === 'outcome-measures') {
    return (
      <section id={section.id} className="form-section" aria-labelledby={`${section.id}-title`}>
        <SectionHeading section={section} />
        <OutcomeMeasuresSection
          section={section}
          values={values}
          errors={errors}
          onChange={onChange}
        />
      </section>
    );
  }

  if (section.id === 'service-requested') {
    return (
      <section id={section.id} className="form-section" aria-labelledby={`${section.id}-title`}>
        <SectionHeading section={section} />
        <ServiceRequestedSection
          section={section}
          values={values}
          errors={errors}
          onChange={onChange}
        />
      </section>
    );
  }

  return (
    <section id={section.id} className="form-section" aria-labelledby={`${section.id}-title`}>
      <SectionHeading section={section} />
      <div className="field-stack">
        {section.fields.map((field) => (
          <FormField
            key={field.id}
            field={field}
            value={values[field.id]}
            error={errors[field.id]}
            onChange={onChange}
          />
        ))}
      </div>
    </section>
  );
}

function SectionHeading({ section }: { section: FormSectionDefinition }) {
  return (
    <>
      <div className="section-heading">
        <h2 id={`${section.id}-title`}>{section.title}</h2>
        {section.description ? <p>{section.description}</p> : null}
      </div>
      {section.guidance ? <SectionGuidance section={section} /> : null}
    </>
  );
}

function SectionGuidance({ section }: { section: FormSectionDefinition }) {
  if (!section.guidance) {
    return null;
  }

  return (
    <details className="section-guidance">
      <summary>
        <HelpCircle aria-hidden="true" size={17} />
        How to fill this step
      </summary>
      <div>
        <h3>{section.guidance.title}</h3>
        <ul>
          {section.guidance.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <a href={section.guidance.sourceUrl} target="_blank" rel="noreferrer">
          Read the full SIRA explanatory notes
        </a>
      </div>
    </details>
  );
}

function OutcomeMeasuresSection({
  section,
  values,
  errors,
  onChange,
}: FormSectionProps) {
  const visibleCount = getVisibleCount(values, 'somVisibleCount', 'som', 3);
  const interpretation = getField(section, 'somInterpretation');
  const barriers = getField(section, 'barriersToRecovery');

  return (
    <div className="field-stack">
      <div className="repeating-stack">
        {Array.from({ length: visibleCount }, (_, index) => index + 1).map((row) => (
          <div className="repeat-panel" key={row}>
            <div className="repeat-panel-header">
              <h3>Measure {row}</h3>
              {row > 1 && row === visibleCount ? (
                <button
                  className="text-action"
                  type="button"
                  onClick={() => {
                    clearFields(section, `som${row}`, onChange);
                    onChange('somVisibleCount', String(row - 1));
                  }}
                >
                  <Trash2 aria-hidden="true" size={16} />
                  Remove
                </button>
              ) : null}
            </div>

            <FormField
              field={getField(section, `som${row}Measure`)}
              value={values[`som${row}Measure`]}
              error={errors[`som${row}Measure`]}
              onChange={onChange}
            />

            <div className="score-comparison" aria-label={`Measure ${row} score comparison`}>
              <ScoreColumn
                label="Initial"
                dateField={getField(section, `som${row}InitialDate`)}
                scoreField={getField(section, `som${row}InitialScore`)}
                values={values}
                errors={errors}
                onChange={onChange}
              />
              <ScoreColumn
                label="Previous"
                dateField={getField(section, `som${row}PreviousDate`)}
                scoreField={getField(section, `som${row}PreviousScore`)}
                values={values}
                errors={errors}
                onChange={onChange}
              />
              <ScoreColumn
                label="Current"
                dateField={getField(section, `som${row}CurrentDate`)}
                scoreField={getField(section, `som${row}CurrentScore`)}
                values={values}
                errors={errors}
                onChange={onChange}
              />
            </div>
          </div>
        ))}
      </div>

      {visibleCount < 3 ? (
        <button
          className="ghost-action add-row-action"
          type="button"
          onClick={() => onChange('somVisibleCount', String(visibleCount + 1))}
        >
          <Plus aria-hidden="true" size={17} />
          Add another measure
        </button>
      ) : null}

      <FormField
        field={interpretation}
        value={values[interpretation.id]}
        error={errors[interpretation.id]}
        onChange={onChange}
      />
      <FormField
        field={barriers}
        value={values[barriers.id]}
        error={errors[barriers.id]}
        onChange={onChange}
      />
    </div>
  );
}

function ScoreColumn({
  label,
  dateField,
  scoreField,
  values,
  errors,
  onChange,
}: {
  label: string;
  dateField: ReturnType<typeof getField>;
  scoreField: ReturnType<typeof getField>;
  values: Record<string, FieldValue>;
  errors: ValidationErrors;
  onChange: (fieldId: string, value: FieldValue) => void;
}) {
  return (
    <div className="score-column">
      <h4>{label}</h4>
      <FormField
        field={{ ...dateField, label: 'Date' }}
        value={values[dateField.id]}
        error={errors[dateField.id]}
        onChange={onChange}
      />
      <FormField
        field={{ ...scoreField, label: 'Score' }}
        value={values[scoreField.id]}
        error={errors[scoreField.id]}
        onChange={onChange}
      />
    </div>
  );
}

function ServiceRequestedSection({
  section,
  values,
  errors,
  onChange,
}: FormSectionProps) {
  const visibleCount = getVisibleCount(values, 'serviceVisibleCount', 'service', 5);
  const overallTotal = String(values.overallTotal ?? '');

  return (
    <div className="field-stack">
      <div className="repeating-stack">
        {Array.from({ length: visibleCount }, (_, index) => index + 1).map((row) => {
          const total = String(values[`service${row}Total`] ?? '');

          return (
            <div className="repeat-panel" key={row}>
              <div className="repeat-panel-header">
                <h3>Service {row}</h3>
                {row > 1 && row === visibleCount ? (
                  <button
                    className="text-action"
                    type="button"
                    onClick={() => {
                      clearFields(section, `service${row}`, onChange);
                      onChange('serviceVisibleCount', String(row - 1));
                    }}
                  >
                    <Trash2 aria-hidden="true" size={16} />
                    Remove
                  </button>
                ) : null}
              </div>

              <div className="service-grid">
                {['Type', 'Sessions', 'Frequency', 'Code', 'Cost'].map((suffix) => {
                  const field = getField(section, `service${row}${suffix}`);
                  const labelBySuffix: Record<string, string> = {
                    Type: 'Service type',
                    Sessions: 'Number of sessions',
                    Frequency: 'Frequency/timeframe',
                    Code: 'Service code',
                    Cost: 'Cost per session/item',
                  };
                  return (
                    <FormField
                      key={field.id}
                      field={{ ...field, label: labelBySuffix[suffix] }}
                      value={values[field.id]}
                      error={errors[field.id]}
                      onChange={onChange}
                    />
                  );
                })}
              </div>

              <CalculatedTotal label="Service total" value={total} />
            </div>
          );
        })}
      </div>

      {visibleCount < 5 ? (
        <button
          className="ghost-action add-row-action"
          type="button"
          onClick={() => onChange('serviceVisibleCount', String(visibleCount + 1))}
        >
          <Plus aria-hidden="true" size={17} />
          Add another service
        </button>
      ) : null}

      <CalculatedTotal label="Overall total" value={overallTotal} strong />
    </div>
  );
}

function CalculatedTotal({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className={strong ? 'calculated-total calculated-total--strong' : 'calculated-total'}>
      <span>{label}</span>
      <output>{value ? `$${value}` : 'Calculated when sessions and cost are entered'}</output>
    </div>
  );
}

function getField(section: FormSectionDefinition, fieldId: string) {
  const field = section.fields.find((candidate) => candidate.id === fieldId);

  if (!field) {
    throw new Error(`Missing field ${fieldId}`);
  }

  return field;
}

function getVisibleCount(
  values: Record<string, FieldValue>,
  countFieldId: string,
  rowPrefix: string,
  max: number,
): number {
  const explicitCount = Number(values[countFieldId]);

  if (Number.isFinite(explicitCount) && explicitCount > 0) {
    return Math.min(max, Math.max(1, explicitCount));
  }

  for (let row = max; row > 1; row -= 1) {
    const hasRowValue = Object.entries(values).some(
      ([fieldId, value]) =>
        fieldId.startsWith(`${rowPrefix}${row}`) &&
        (typeof value === 'string' ? value.trim().length > 0 : value === true),
    );

    if (hasRowValue) {
      return row;
    }
  }

  return 1;
}

function clearFields(
  section: FormSectionDefinition,
  fieldPrefix: string,
  onChange: (fieldId: string, value: FieldValue) => void,
) {
  section.fields
    .filter((field) => field.id.startsWith(fieldPrefix))
    .forEach((field) => onChange(field.id, field.type === 'checkbox' ? false : ''));
}
