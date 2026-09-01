import { ArrowLeft, ArrowRight, ClipboardCheck, RotateCcw } from 'lucide-react';
import { FormSection } from '../components/FormSection';
import { PrivacyNotice } from '../components/PrivacyNotice';
import { SectionRail } from '../components/SectionRail';
import type { FieldValue, FormValues, PdfTemplateDefinition } from '../forms/formTypes';
import { getSectionProgress } from '../utils/sectionProgress';
import type { ValidationErrors } from '../utils/validation';

interface FormScreenProps {
  template: PdfTemplateDefinition;
  values: FormValues;
  errors: ValidationErrors;
  activeSectionId: string | null;
  onChange: (fieldId: string, value: FieldValue) => void;
  onSectionChange: (sectionId: string) => void;
  onReview: () => void;
  onClear: () => void;
}

export function FormScreen({
  template,
  values,
  errors,
  activeSectionId,
  onChange,
  onSectionChange,
  onReview,
  onClear,
}: FormScreenProps) {
  const errorCount = Object.keys(errors).length;
  const currentIndex = Math.max(
    0,
    template.sections.findIndex((section) => section.id === activeSectionId),
  );
  const currentSection = template.sections[currentIndex] ?? template.sections[0];
  const isFirstSection = currentIndex === 0;
  const isLastSection = currentIndex === template.sections.length - 1;
  const currentProgress = getSectionProgress(currentSection, values, errors);

  function goToSection(index: number) {
    const section = template.sections[index];
    if (section) {
      onSectionChange(section.id);
    }
  }

  return (
    <main className="workspace-shell">
      <header className="workspace-header">
        <div>
          <p className="screen-label">Local browser session</p>
          <h1>{template.name}</h1>
        </div>
        <button className="ghost-action" type="button" onClick={onClear}>
          <RotateCcw aria-hidden="true" size={17} />
          Clear form
        </button>
      </header>

      <PrivacyNotice />

      {errorCount > 0 ? (
        <div className="error-summary" role="alert" aria-live="polite">
          <strong>{errorCount} field{errorCount === 1 ? '' : 's'} need attention.</strong>
          <span>Fix the highlighted fields before review.</span>
        </div>
      ) : null}

      <div className="workbench">
        <SectionRail
          template={template}
          values={values}
          activeSectionId={currentSection.id}
          errors={errors}
          onSelectSection={onSectionChange}
        />
        <form
          className="form-panel"
          onSubmit={(event) => {
            event.preventDefault();
            if (isLastSection) {
              onReview();
            } else {
              goToSection(currentIndex + 1);
            }
          }}
          noValidate
        >
          <div className="step-status" aria-live="polite">
            <div>
              <strong>
                Section {currentIndex + 1} of {template.sections.length}
              </strong>
              <span>{currentSection.title}</span>
            </div>
            <span className="step-status-copy">
              <strong>{currentProgress.label}</strong>
              <span>{currentProgress.detail}</span>
            </span>
          </div>

          <FormSection
            key={currentSection.id}
            section={currentSection}
            values={values}
            errors={errors}
            onChange={onChange}
          />

          <div className="form-actions form-actions--split">
            <button
              className="ghost-action"
              type="button"
              onClick={() => goToSection(currentIndex - 1)}
              disabled={isFirstSection}
            >
              <ArrowLeft aria-hidden="true" size={17} />
              Previous section
            </button>
            {isLastSection ? (
              <button className="primary-action" type="submit">
                <ClipboardCheck aria-hidden="true" size={18} />
                Review form
              </button>
            ) : (
              <button className="primary-action" type="submit">
                <ArrowRight aria-hidden="true" size={18} />
                Next section
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
