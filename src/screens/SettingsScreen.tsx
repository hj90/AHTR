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
  { key: 'practiceState', label: 'Clinic state', help: 'Sets which insurer form your requests use.' },
  { key: 'practiceName', label: 'Practice name' },
  { key: 'practiceEmail', label: 'Practice email', type: 'email' },
  { key: 'practicePhone', label: 'Practice phone', type: 'tel' },
  { key: 'fax', label: 'Fax', type: 'tel' },
  { key: 'suburb', label: 'Suburb' },
  { key: 'postcode', label: 'Postcode' },
];

const practitionerFields: Array<{
  key: keyof PractitionerSettings;
  label: string;
  type?: string;
  help?: string;
}> = [
  { key: 'practitionerName', label: 'Your name', help: 'Use the name registered with AHPRA.' },
  { key: 'ahpraNumber', label: 'AHPRA registration number' },
  { key: 'discipline', label: 'Allied health discipline' },
  { key: 'providerNumber', label: 'SIRA approval number' },
  { key: 'practitionerEmail', label: 'Practitioner email', type: 'email' },
  { key: 'preferredContactTime', label: 'Preferred contact time' },
  { key: 'signature', label: 'Signature / typed name' },
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
  const [saveMessage, setSaveMessage] = useState('Stored in Supabase for the demo user.');
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
            .then(() => setSaveMessage('Details saved to Supabase.'))
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
        <div className="settings-group">
          <h3>Clinic details</h3>
          <div className="settings-grid">
            {fields.map((field) => (
              <SettingsField
                draft={draft}
                field={field}
                key={field.key}
                onChange={(key, value) => {
                  setSaveError(null);
                  setSaveMessage('Unsaved changes.');
                  setDraft((current) => ({ ...current, [key]: value }));
                }}
              />
            ))}
          </div>
        </div>

        <div className="settings-group">
          <h3>Practitioner details</h3>
          <div className="settings-grid">
            {practitionerFields.map((field) => (
              <SettingsField
                draft={draft}
                field={field}
                key={field.key}
                onChange={(key, value) => {
                  setSaveError(null);
                  setSaveMessage('Unsaved changes.');
                  setDraft((current) => ({ ...current, [key]: value }));
                }}
              />
            ))}
          </div>
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
        <div><h2>Demo practitioner data</h2><p>Clear the reusable practitioner details saved in Supabase for the demo user.</p></div>
        <button
          className="danger-action"
          type="button"
          disabled={isClearing}
          onClick={() => {
            if (window.confirm('Clear saved practitioner details from Supabase for the demo user?')) {
              setIsClearing(true);
              setSaveError(null);
              onClear()
                .then(() => {
                  setSaveMessage('Saved details cleared from Supabase.');
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

function SettingsField({
  draft,
  field,
  onChange,
}: {
  draft: PractitionerSettings;
  field: {
    key: keyof PractitionerSettings;
    label: string;
    type?: string;
    help?: string;
  };
  onChange: (key: keyof PractitionerSettings, value: string) => void;
}) {
  return (
    <label className="settings-field">
      <span>{field.label}</span>
      {field.key === 'practiceState' ? (
        <select
          value={draft.practiceState}
          onChange={(event) => {
            onChange(
              field.key,
              event.target.value === 'VIC' || event.target.value === 'QLD' || event.target.value === 'WA' || event.target.value === 'SA'
                ? event.target.value
                : 'NSW',
            );
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
          onChange={(event) => onChange(field.key, event.target.value)}
        >
          {disciplineOptions.map((option) => (
            <option key={option} value={option}>{option || 'Select a discipline'}</option>
          ))}
        </select>
      ) : (
        <input
          type={field.type ?? 'text'}
          value={draft[field.key]}
          onChange={(event) => onChange(field.key, event.target.value)}
        />
      )}
      {field.help ? <small>{field.help}</small> : null}
    </label>
  );
}
