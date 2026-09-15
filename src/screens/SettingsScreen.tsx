import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PractitionerSettings } from '../utils/practitionerSettings';

interface SettingsScreenProps {
  settings: PractitionerSettings;
  onSave: (settings: PractitionerSettings) => Promise<void>;
  onClear: () => Promise<void>;
}

const fields: Array<{
  key: keyof PractitionerSettings;
  label: string;
  type?: string;
  help?: string;
}> = [
  { key: 'practitionerName', label: 'Your name', help: 'Use the name registered with AHPRA.' },
  { key: 'practiceState', label: 'State you practise in', help: 'Sets which insurer form your requests use.' },
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
  'Occupational Therapist',
  'Podiatrist',
  'Physiotherapist',
  'Psychologist',
];

export function SettingsScreen({ settings, onSave, onClear }: SettingsScreenProps) {
  const [draft, setDraft] = useState(settings);
  const [saveMessage, setSaveMessage] = useState('Saved securely to your account.');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    setDraft({
      ...settings,
      discipline: disciplineOptions.includes(settings.discipline) ? settings.discipline : '',
    });
  }, [settings]);
  return (
    <main className="settings-screen">
      <header className="compact-page-header">
        <div>
          <h1>Settings</h1>
          <p>Reusable practitioner and clinic details for new requests.</p>
        </div>
      </header>

      <form
        className="settings-card"
        onSubmit={(event) => {
          event.preventDefault();
          setIsSaving(true);
          setSaveError(null);
          onSave(draft)
            .then(() => setSaveMessage('Details saved to your account.'))
            .catch((error) => {
              setSaveError(error instanceof Error ? error.message : 'Unable to save details.');
            })
            .finally(() => setIsSaving(false));
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
              {field.key === 'practiceState' ? (
                <select
                  value={draft.practiceState}
                  onChange={(event) => {
                    setSaveError(null);
                    setSaveMessage('Unsaved changes.');
                    setDraft((current) => ({
                      ...current,
                      practiceState: event.target.value === 'VIC' || event.target.value === 'QLD' || event.target.value === 'WA' || event.target.value === 'SA'
                        ? event.target.value
                        : 'NSW',
                    }));
                  }}
                >
                  <option value="NSW">New South Wales</option>
                  <option value="VIC">Victoria</option>
                  <option value="QLD">Queensland</option>
                  <option value="WA">Western Australia</option>
                  <option value="SA">South Australia</option>
                </select>
              ) : field.key === 'discipline' ? (
                <select
                  value={draft.discipline}
                  onChange={(event) => {
                    setSaveError(null);
                    setSaveMessage('Unsaved changes.');
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
                    setSaveError(null);
                    setSaveMessage('Unsaved changes.');
                    setDraft((current) => ({ ...current, [field.key]: event.target.value }));
                  }}
                />
              )}
              {field.help ? <small>{field.help}</small> : null}
            </label>
          ))}
        </div>
        <div className="settings-actions">
          <span className={saveError ? 'settings-error' : ''} aria-live="polite">
            {saveError ?? saveMessage}
          </span>
          <button className="primary-action" type="submit" disabled={isSaving}>
            {isSaving ? 'Saving details' : 'Save details'}
          </button>
        </div>
      </form>

      <section className="clear-settings-card">
        <div><h2>Practitioner data</h2><p>Clear the reusable practitioner and clinic details saved to your account.</p></div>
        <button
          className="danger-action"
          type="button"
          disabled={isClearing}
          onClick={() => {
            if (window.confirm('Clear all practitioner and clinic details saved to your account?')) {
              setIsClearing(true);
              setSaveError(null);
              onClear()
                .then(() => {
                  setSaveMessage('Saved details cleared from your account.');
                })
                .catch((error) => {
                  setSaveError(error instanceof Error ? error.message : 'Unable to clear details.');
                })
                .finally(() => setIsClearing(false));
            }
          }}
        ><Trash2 aria-hidden="true" size={16} /> {isClearing ? 'Clearing details' : 'Clear saved details'}</button>
      </section>
    </main>
  );
}
