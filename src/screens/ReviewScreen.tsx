import { ArrowLeft, FileCheck2 } from 'lucide-react';
import type { FormValues, PdfTemplateDefinition } from '../forms/formTypes';
import { formatValueForPdf } from '../pdf/valueFormatters';

interface ReviewScreenProps {
  template: PdfTemplateDefinition;
  values: FormValues;
  isGenerating: boolean;
  generationError: string | null;
  onEdit: (sectionId: string) => void;
  onGenerate: () => void;
}

export function ReviewScreen({
  template,
  values,
  isGenerating,
  generationError,
  onEdit,
  onGenerate,
}: ReviewScreenProps) {
  return (
    <main className="workspace-shell">
      <header className="workspace-header">
        <div>
          <p className="screen-label">Review before PDF generation</p>
          <h1>Check the entered information</h1>
        </div>
      </header>

      <div className="review-stack">
        {template.sections.map((section) => {
          const visibleFields = section.fields.filter((field) => {
            const value = values[field.id];
            return value !== '' && value !== false;
          });

          return (
            <section key={section.id} className="review-section" aria-labelledby={`${section.id}-review`}>
              <div className="review-section-header">
                <h2 id={`${section.id}-review`}>{section.title}</h2>
                <button className="text-action" type="button" onClick={() => onEdit(section.id)}>
                  <ArrowLeft aria-hidden="true" size={16} />
                  Edit
                </button>
              </div>
              {visibleFields.length > 0 ? (
                <dl>
                  {visibleFields.map((field) => (
                    <div key={field.id}>
                      <dt>{field.label}</dt>
                      <dd>{formatValueForPdf(field, values[field.id])}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="empty-copy">No optional values entered.</p>
              )}
            </section>
          );
        })}
      </div>

      {generationError ? (
        <div className="error-summary" role="alert">
          <strong>Unable to generate the PDF.</strong>
          <span>{generationError}</span>
        </div>
      ) : null}

      <div className="form-actions form-actions--split">
        <button className="ghost-action" type="button" onClick={() => onEdit(template.sections[0].id)}>
          <ArrowLeft aria-hidden="true" size={17} />
          Back to form
        </button>
        <button className="primary-action" type="button" onClick={onGenerate} disabled={isGenerating}>
          <FileCheck2 aria-hidden="true" size={18} />
          {isGenerating ? 'Generating PDF' : 'Generate PDF'}
        </button>
      </div>
    </main>
  );
}
