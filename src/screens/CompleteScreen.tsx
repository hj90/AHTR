import { Download, RotateCcw } from 'lucide-react';
import type { PdfTemplateDefinition } from '../forms/formTypes';
import { PrivacyNotice } from '../components/PrivacyNotice';

interface CompleteScreenProps {
  template: PdfTemplateDefinition;
  generatedPdfUrl: string;
  downloadName: string;
  onStartNew: () => void;
}

export function CompleteScreen({
  template,
  generatedPdfUrl,
  downloadName,
  onStartNew,
}: CompleteScreenProps) {
  return (
    <main className="complete-shell">
      <section className="complete-panel" aria-labelledby="complete-title">
        <p className="screen-label">PDF ready</p>
        <h1 id="complete-title">{template.name} was generated in this browser</h1>
        <p>
          Your completed PDF was generated locally. This application has not saved
          the form information or the generated PDF.
        </p>
        <div className="completion-actions">
          <a className="primary-action" href={generatedPdfUrl} download={downloadName}>
            <Download aria-hidden="true" size={18} />
            Download PDF
          </a>
          <button className="ghost-action" type="button" onClick={onStartNew}>
            <RotateCcw aria-hidden="true" size={17} />
            Start a new form
          </button>
        </div>
        <PrivacyNotice />
      </section>
    </main>
  );
}
