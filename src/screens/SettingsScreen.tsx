import { Check, Plug, ShieldCheck, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PractitionerSettings } from '../utils/practitionerSettings';

interface SettingsScreenProps {
  settings: PractitionerSettings;
  onSave: (settings: PractitionerSettings) => void;
  onClear: () => void;
}

const fields: Array<{
  key: keyof PractitionerSettings;
  label: string;
  type?: string;
  help?: string;
}> = [
  { key: 'practitionerName', label: 'Your name', help: 'Use the name registered with AHPRA.' },
  { key: 'ahpraNumber', label: 'AHPRA registration number' },
  { key: 'discipline', label: 'Allied health discipline' },
  { key: 'providerNumber', label: 'Provider or SIRA approval number' },
  { key: 'practiceName', label: 'Practice name' },
  { key: 'practicePhone', label: 'Practice phone', type: 'tel' },
  { key: 'practiceEmail', label: 'Practice email', type: 'email' },
  { key: 'practiceAddress', label: 'Practice address' },
];

const disciplineOptions = [
  '',
  'Accredited Exercise Physiologist',
  'Chiropractor',
  'Counsellor',
  'Osteopath',
  'Physiotherapist',
  'Psychologist',
  'Other (please specify)',
];

export function SettingsScreen({ settings, onSave, onClear }: SettingsScreenProps) {
  const [draft, setDraft] = useState(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => setDraft(settings), [settings]);

  return (
    <main className="settings-screen">
      <header className="compact-page-header">
        <div>
          <h1>Settings</h1>
          <p>Reusable practitioner and clinic details for new requests.</p>
        </div>
        <span className="device-status"><Check size={15} /> Saved on this device</span>
      </header>

      <form
        className="settings-card"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(draft);
          setSaved(true);
          window.setTimeout(() => setSaved(false), 2400);
        }}
      >
        <div className="settings-card-heading">
          <h2>Practitioner and clinic details</h2>
          <p>These values prefill each new request and remain editable inside the form.</p>
        </div>
        <div className="settings-grid">
          {fields.map((field) => (
            <label className="settings-field" key={field.key}>
              <span>{field.label}</span>
              {field.key === 'discipline' ? (
                <select
                  value={draft.discipline}
                  onChange={(event) => {
                    setSaved(false);
                    setDraft((current) => ({ ...current, discipline: event.target.value }));
                  }}
                >
                  {disciplineOptions.map((option) => (
                    <option key={option} value={option}>{option || 'Select a discipline'}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type ?? 'text'}
                  value={draft[field.key]}
                  onChange={(event) => {
                    setSaved(false);
                    setDraft((current) => ({ ...current, [field.key]: event.target.value }));
                  }}
                />
              )}
              {field.help ? <small>{field.help}</small> : null}
            </label>
          ))}
        </div>
        <div className="settings-actions">
          <span aria-live="polite">{saved ? 'Details saved.' : 'Stored only in this browser.'}</span>
          <button className="primary-action" type="submit">Save details</button>
        </div>
      </form>

      <section className="settings-card settings-card--muted">
        <div className="settings-card-heading">
          <h2>Checks and integrations</h2>
        </div>
        <div className="coming-soon-row">
          <ShieldCheck aria-hidden="true" size={20} />
          <div><h3>Compliance checks</h3><p>Automatic checks for gaps insurers commonly query.</p></div>
          <span>Coming soon</span>
        </div>
        <div className="coming-soon-row">
          <Plug aria-hidden="true" size={20} />
          <div><h3>Cliniko</h3><p>Import patient, claim and recent consultation details.</p></div>
          <span>Coming soon</span>
        </div>
      </section>

      <section className="clear-settings-card">
        <div><h2>Data on this device</h2><p>Clear the reusable practitioner and clinic details saved by this app.</p></div>
        <button
          className="danger-action"
          type="button"
          onClick={() => {
            if (window.confirm('Clear all saved practitioner and clinic details from this device?')) {
              onClear();
              setSaved(false);
            }
          }}
        ><Trash2 aria-hidden="true" size={16} /> Clear saved details</button>
      </section>
    </main>
  );
}
