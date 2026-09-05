import { ArrowRight, ClipboardPaste, FilePlus2, Plug, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

type StartMethod = 'notes' | 'blank' | 'cliniko';

interface HomeScreenProps {
  onStartBlank: () => void;
  onStartFromNotes: (notes: string) => void;
}

const choices: Array<{ id: StartMethod; label: string; note: string }> = [
  { id: 'notes', label: 'Draft from consult notes', note: 'Paste today’s notes and open a form to review.' },
  { id: 'blank', label: 'Fill it in myself', note: 'Start the existing nine-step form with saved details prefilled.' },
  { id: 'cliniko', label: 'Import from Cliniko', note: 'Not connected in this version.' },
];

export function HomeScreen({ onStartBlank, onStartFromNotes }: HomeScreenProps) {
  const [method, setMethod] = useState<StartMethod>('blank');
  const [notes, setNotes] = useState('');

  return (
    <main className="new-home-screen">
      <header className="compact-page-header home-page-header">
        <div>
          <h1>Allied Health PDF Filler</h1>
          <p>Fill in the SIRA allied health treatment request through a guided form, then download the completed PDF.</p>
        </div>
        <div className="browser-processing-note">
          <ShieldCheck aria-hidden="true" size={18} />
          <span>Form information and PDF processing stay in this browser.</span>
        </div>
      </header>

      <section className="start-section" aria-labelledby="start-heading">
        <h2 id="start-heading">How do you want to start this request?</h2>
        <div className="start-choice-grid">
          {choices.map((choice) => (
            <label className={`start-choice${method === choice.id ? ' is-selected' : ''}`} key={choice.id}>
              <input type="radio" name="start-method" value={choice.id} checked={method === choice.id} onChange={() => setMethod(choice.id)} />
              <span><strong>{choice.label}</strong><small>{choice.note}</small></span>
            </label>
          ))}
        </div>

        {method === 'notes' ? (
          <div className="start-panel">
            <label htmlFor="consult-notes">Consult notes</label>
            <textarea id="consult-notes" rows={6} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Paste subjective, objective, treatment to date and plan notes here…" />
            <div className="start-panel-actions">
              <p><strong>Experimental:</strong> automatic parsing may not fill fields yet. Anything missing remains blank.</p>
              <button className="primary-action" type="button" onClick={() => onStartFromNotes(notes)} disabled={!notes.trim()}>
                <ClipboardPaste aria-hidden="true" size={17} /> Draft form
              </button>
            </div>
          </div>
        ) : null}

        {method === 'blank' ? (
          <div className="start-panel start-panel--action">
            <div><FilePlus2 aria-hidden="true" size={21} /><div><h3>Start with an empty request</h3><p>Your saved practitioner details will be prefilled where possible.</p></div></div>
            <button className="primary-action" type="button" onClick={onStartBlank}>Start form <ArrowRight aria-hidden="true" size={17} /></button>
          </div>
        ) : null}

        {method === 'cliniko' ? (
          <div className="start-panel start-panel--action start-panel--disabled">
            <div><Plug aria-hidden="true" size={21} /><div><h3>Cliniko isn’t connected</h3><p>Importing patient, claim and consultation details will be added later.</p></div></div>
            <button className="ghost-action" type="button" disabled>Coming soon</button>
          </div>
        ) : null}
      </section>

      <section className="requests-empty" aria-labelledby="requests-heading">
        <h2 id="requests-heading">Your requests</h2>
        <div><FilePlus2 aria-hidden="true" size={24} /><h3>Your first request will show up here</h3><p>Saving, resuming and duplicating requests will be available in a future version.</p></div>
      </section>
    </main>
  );
}
