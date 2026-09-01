import { ArrowRight, FileText, LockKeyhole } from 'lucide-react';
import type { PdfTemplateDefinition } from '../forms/formTypes';
import { PrivacyNotice } from '../components/PrivacyNotice';

interface HomeScreenProps {
  template: PdfTemplateDefinition;
  onStart: () => void;
}

export function HomeScreen({ template, onStart }: HomeScreenProps) {
  return (
    <main className="home-shell">
      <section className="intro-band" aria-labelledby="home-title">
        <div>
          <p className="local-pill">
            <LockKeyhole aria-hidden="true" size={15} />
            Localhost v0
          </p>
          <h1 id="home-title">Allied Health PDF Filler</h1>
          <p className="intro-copy">
            Complete a predefined PDF through a clearer web form, generate it in
            this browser, and download the completed file without sending form
            values to an app backend.
          </p>
        </div>
        <PrivacyNotice variant="strong" />
      </section>

      <section className="template-area" aria-labelledby="available-forms">
        <div className="template-detail">
          <h2 id="available-forms">Available form</h2>
          <article className="template-card">
            <div className="template-icon">
              <FileText aria-hidden="true" size={24} />
            </div>
            <div>
              <h3>{template.name}</h3>
              <p>{template.description}</p>
            </div>
            <button className="primary-action" type="button" onClick={onStart}>
              <ArrowRight aria-hidden="true" size={18} />
              Start form
            </button>
          </article>
        </div>
        <div className="pdf-preview" aria-label="Demo PDF template preview">
          {template.previewPath ? (
            <img src={template.previewPath} alt="Preview of the demo referral PDF template" />
          ) : null}
          <a href={template.templatePath}>Open PDF template</a>
        </div>
      </section>
    </main>
  );
}
