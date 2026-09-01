import { AlertCircle, CheckCircle2, Circle, CircleDashed } from 'lucide-react';
import type { PdfTemplateDefinition } from '../forms/formTypes';
import type { FormValues } from '../forms/formTypes';
import { getSectionProgress, type SectionProgressState } from '../utils/sectionProgress';
import type { ValidationErrors } from '../utils/validation';

interface SectionRailProps {
  template: PdfTemplateDefinition;
  values: FormValues;
  activeSectionId?: string | null;
  errors: ValidationErrors;
  onSelectSection: (sectionId: string) => void;
}

export function SectionRail({
  template,
  values,
  activeSectionId,
  errors,
  onSelectSection,
}: SectionRailProps) {
  return (
    <nav className="section-rail" aria-label="Form sections">
      {template.sections.map((section, index) => {
        const progress = getSectionProgress(section, values, errors);
        return (
          <button
            key={section.id}
            type="button"
            className={[
              section.id === activeSectionId ? 'is-active' : null,
              `is-${progress.state}`,
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onSelectSection(section.id)}
            aria-current={section.id === activeSectionId ? 'step' : undefined}
            aria-label={`Step ${index + 1}: ${section.title}. ${progress.label}.`}
          >
            <StatusIcon state={progress.state} />
            <span>
              <small>Step {index + 1}</small>
              <span>{section.title}</span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function StatusIcon({ state }: { state: SectionProgressState }) {
  if (state === 'complete') {
    return <CheckCircle2 aria-hidden="true" size={16} />;
  }

  if (state === 'needs-attention') {
    return <AlertCircle aria-hidden="true" size={16} />;
  }

  if (state === 'in-progress') {
    return <CircleDashed aria-hidden="true" size={16} />;
  }

  return <Circle aria-hidden="true" size={16} />;
}
