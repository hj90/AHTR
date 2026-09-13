import {
  ArrowLeft,
  ArrowRight,
  ClipboardPaste,
  FilePenLine,
  FilePlus2,
  Plug,
  RefreshCw,
  Save,
  UserRound,
  UsersRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  listClinikoPatients,
  listClinikoPractitioners,
} from '../integrations/clinikoImport';
import type { ClinikoPatient, ClinikoPractitioner } from '../integrations/clinikoImport';

type DetailSource = 'cliniko' | 'form';
type PractitionerSource = 'cliniko' | 'settings' | 'form';
type StartMethod = 'notes' | 'blank';

export interface HomeStartContext {
  patient: {
    source: DetailSource;
    selected: ClinikoPatient | null;
  };
  practitioner: {
    source: PractitionerSource;
    selected: ClinikoPractitioner | null;
  };
}

interface HomeScreenProps {
  practiceState: 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA';
  onStartBlank: (context: HomeStartContext) => void;
  onStartFromNotes: (notes: string, context: HomeStartContext) => Promise<void>;
}

const patientChoices: Array<{ id: DetailSource; label: string; note: string; icon: typeof Plug }> = [
  { id: 'cliniko', label: 'Import from Cliniko', note: 'Select a patient and add their saved details to the form.', icon: Plug },
  { id: 'form', label: 'Fill it in the form', note: 'Enter the patient details yourself in the request.', icon: FilePenLine },
];

const practitionerChoices: Array<{ id: PractitionerSource; label: string; note: string; icon: typeof Plug }> = [
  { id: 'cliniko', label: 'Import from Cliniko', note: 'Select the treating practitioner from Cliniko.', icon: Plug },
  { id: 'settings', label: 'Use saved settings', note: 'Start with the practitioner details in Settings.', icon: Save },
  { id: 'form', label: 'Fill it in the form', note: 'Enter the practitioner details yourself in the request.', icon: FilePenLine },
];

const startChoices: Array<{ id: StartMethod; label: string; note: string; icon: typeof ClipboardPaste }> = [
  { id: 'notes', label: 'Paste consult notes', note: 'Draft the request from the notes you paste in.', icon: ClipboardPaste },
  { id: 'blank', label: 'Fill it in myself', note: 'Open the request with the selected details ready to review.', icon: FilePlus2 },
];

export function HomeScreen({ practiceState, onStartBlank, onStartFromNotes }: HomeScreenProps) {
  const [victoriaClaimType, setVictoriaClaimType] = useState<'work' | 'transport'>('work');
  const [step, setStep] = useState<1 | 2>(1);
  const [patientSource, setPatientSource] = useState<DetailSource>('form');
  const [practitionerSource, setPractitionerSource] = useState<PractitionerSource>('settings');
  const [selectedPatient, setSelectedPatient] = useState<ClinikoPatient | null>(null);
  const [selectedPractitioner, setSelectedPractitioner] = useState<ClinikoPractitioner | null>(null);
  const [clinikoPatients, setClinikoPatients] = useState<ClinikoPatient[]>([]);
  const [clinikoPractitioners, setClinikoPractitioners] = useState<ClinikoPractitioner[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isLoadingPractitioners, setIsLoadingPractitioners] = useState(false);
  const [patientError, setPatientError] = useState<string | null>(null);
  const [practitionerError, setPractitionerError] = useState<string | null>(null);
  const [hasLoadedPatients, setHasLoadedPatients] = useState(false);
  const [hasLoadedPractitioners, setHasLoadedPractitioners] = useState(false);
  const [method, setMethod] = useState<StartMethod>('blank');
  const [notes, setNotes] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  useEffect(() => {
    if (patientSource === 'cliniko' && !hasLoadedPatients && !isLoadingPatients) {
      void loadPatients();
    }
  }, [hasLoadedPatients, isLoadingPatients, patientSource]);

  useEffect(() => {
    if (practitionerSource === 'cliniko' && !hasLoadedPractitioners && !isLoadingPractitioners) {
      void loadPractitioners();
    }
  }, [hasLoadedPractitioners, isLoadingPractitioners, practitionerSource]);

  async function loadPatients() {
    setIsLoadingPatients(true);
    setPatientError(null);

    try {
      setClinikoPatients(await listClinikoPatients());
      setHasLoadedPatients(true);
    } catch (error) {
      setPatientError(error instanceof Error ? error.message : 'Unable to load Cliniko patients.');
      setHasLoadedPatients(true);
    } finally {
      setIsLoadingPatients(false);
    }
  }

  async function loadPractitioners() {
    setIsLoadingPractitioners(true);
    setPractitionerError(null);

    try {
      setClinikoPractitioners(await listClinikoPractitioners());
      setHasLoadedPractitioners(true);
    } catch (error) {
      setPractitionerError(error instanceof Error ? error.message : 'Unable to load Cliniko practitioners.');
      setHasLoadedPractitioners(true);
    } finally {
      setIsLoadingPractitioners(false);
    }
  }

  function buildStartContext(): HomeStartContext {
    return {
      patient: {
        source: patientSource,
        selected: patientSource === 'cliniko' ? selectedPatient : null,
      },
      practitioner: {
        source: practitionerSource,
        selected: practitionerSource === 'cliniko' ? selectedPractitioner : null,
      },
    };
  }

  const needsPatientSelection = patientSource === 'cliniko' && !selectedPatient;
  const needsPractitionerSelection = practitionerSource === 'cliniko' && !selectedPractitioner;
  const canContinue = !needsPatientSelection && !needsPractitionerSelection;

  return (
    <main className="new-home-screen">
      <header className="compact-page-header home-page-header">
        <div>
          <h1>Allied Health PDF Filler</h1>
          <p>
            {practiceState === 'VIC'
              ? 'Fill in the WorkSafe Victoria allied health recovery management plan through a guided form, then download the completed PDF.'
              : practiceState === 'QLD'
                ? 'Fill in the WorkCover Queensland provider management plan through a guided form, then download the completed PDF.'
                : practiceState === 'WA'
                  ? 'Fill in the WorkCover WA physiotherapy treatment management plan through a guided form, then download the completed PDF.'
                  : practiceState === 'SA'
                    ? 'Fill in the ReturnToWorkSA physiotherapy management plan through a guided form, then download the completed PDF.'
                    : 'Fill in the SIRA allied health treatment request through a guided form, then download the completed PDF.'}
          </p>
        </div>
      </header>

      <section className="start-section" aria-labelledby="start-heading">
        {practiceState === 'VIC' ? (
          <div className="claim-type-section">
            <h2>What kind of claim is this?</h2>
            <div className="claim-type-grid">
              <label className={`start-choice${victoriaClaimType === 'work' ? ' is-selected' : ''}`}>
                <input type="radio" name="victoria-claim-type" checked={victoriaClaimType === 'work'} onChange={() => setVictoriaClaimType('work')} />
                <span><strong>Work injury</strong><small>Use the WorkSafe Victoria recovery management plan.</small></span>
              </label>
              <label className="start-choice is-disabled" aria-disabled="true">
                <input type="radio" name="victoria-claim-type" disabled checked={victoriaClaimType === 'transport'} onChange={() => setVictoriaClaimType('transport')} />
                <span><strong>Transport accident</strong><small>Coming soon</small></span>
              </label>
            </div>
          </div>
        ) : null}

        <div className="start-step-heading">
          <div>
            <p className="start-step-status">Step {step} of 2</p>
            <h2 id="start-heading">{step === 1 ? 'Choose the details to bring into this request' : 'Choose how to start the request'}</h2>
          </div>
          <div className="start-step-indicator" aria-hidden="true"><span className="is-current" /><span className={step === 2 ? 'is-current' : ''} /></div>
        </div>

        {step === 1 ? (
          <div className="intake-source-groups">
            <fieldset className="intake-source-group">
              <legend><UserRound aria-hidden="true" size={18} /> Patient details</legend>
              <p>Choose how you would like to add the patient’s details.</p>
              <div className="start-choice-grid start-choice-grid--two">
                {patientChoices.map((choice) => {
                  const Icon = choice.icon;
                  return <label className={`start-choice${patientSource === choice.id ? ' is-selected' : ''}`} key={choice.id}>
                    <input type="radio" aria-label={choice.label} name="patient-source" value={choice.id} checked={patientSource === choice.id} onChange={() => setPatientSource(choice.id)} />
                    <span><Icon aria-hidden="true" size={18} /><strong>{choice.label}</strong><small>{choice.note}</small></span>
                  </label>;
                })}
              </div>

              {patientSource === 'cliniko' ? (
                <ClinikoSelectionPanel title="Select a patient" description="The selected patient’s available Cliniko details will be added to the request." icon={<UsersRound aria-hidden="true" size={20} />} isLoading={isLoadingPatients} error={patientError} isEmpty={hasLoadedPatients && clinikoPatients.length === 0} emptyMessage="No active Cliniko patients were found." onRefresh={() => void loadPatients()}>
                  {clinikoPatients.map((patient) => <label className={`cliniko-selection-row${selectedPatient?.id === patient.id ? ' is-selected' : ''}`} key={patient.id}>
                    <input type="radio" name="cliniko-patient" checked={selectedPatient?.id === patient.id} onChange={() => setSelectedPatient(patient)} />
                    <span><strong>{formatPatientName(patient)}</strong><small>{formatPatientMeta(patient)}</small></span>
                  </label>)}
                </ClinikoSelectionPanel>
              ) : null}
            </fieldset>

            <fieldset className="intake-source-group">
              <legend><UserRound aria-hidden="true" size={18} /> Practitioner details</legend>
              <p>Choose how you would like to add the treating practitioner’s details.</p>
              <div className="start-choice-grid start-choice-grid--three">
                {practitionerChoices.map((choice) => {
                  const Icon = choice.icon;
                  return <label className={`start-choice${practitionerSource === choice.id ? ' is-selected' : ''}`} key={choice.id}>
                    <input type="radio" aria-label={choice.label} name="practitioner-source" value={choice.id} checked={practitionerSource === choice.id} onChange={() => setPractitionerSource(choice.id)} />
                    <span><Icon aria-hidden="true" size={18} /><strong>{choice.label}</strong><small>{choice.note}</small></span>
                  </label>;
                })}
              </div>

              {practitionerSource === 'cliniko' ? (
                <ClinikoSelectionPanel title="Select a practitioner" description="Cliniko supplies the practitioner name; complete any remaining practitioner fields in the request." icon={<UserRound aria-hidden="true" size={20} />} isLoading={isLoadingPractitioners} error={practitionerError} isEmpty={hasLoadedPractitioners && clinikoPractitioners.length === 0} emptyMessage="No active Cliniko practitioners were found." onRefresh={() => void loadPractitioners()}>
                  {clinikoPractitioners.map((practitioner) => <label className={`cliniko-selection-row${selectedPractitioner?.id === practitioner.id ? ' is-selected' : ''}`} key={practitioner.id}>
                    <input type="radio" name="cliniko-practitioner" checked={selectedPractitioner?.id === practitioner.id} onChange={() => setSelectedPractitioner(practitioner)} />
                    <span><strong>{practitioner.name}</strong><small>{practitioner.designation || 'Cliniko practitioner'}</small></span>
                  </label>)}
                </ClinikoSelectionPanel>
              ) : null}
            </fieldset>

            <div className="start-panel-actions intake-next-action">
              <p>{canContinue ? 'You can change these choices later by returning to this step.' : 'Select each Cliniko record you chose before continuing.'}</p>
              <button className="primary-action" type="button" disabled={!canContinue} onClick={() => setStep(2)}>Continue <ArrowRight aria-hidden="true" size={17} /></button>
            </div>
          </div>
        ) : (
          <div className="start-method-step">
            <div className="start-choice-grid start-choice-grid--two">
              {startChoices.map((choice) => {
                const Icon = choice.icon;
                return <label className={`start-choice${method === choice.id ? ' is-selected' : ''}`} key={choice.id}>
                  <input type="radio" aria-label={choice.label} name="start-method" value={choice.id} checked={method === choice.id} onChange={() => setMethod(choice.id)} />
                  <span><Icon aria-hidden="true" size={18} /><strong>{choice.label}</strong><small>{choice.note}</small></span>
                </label>;
              })}
            </div>

            {method === 'notes' ? (
              <div className="start-panel">
                <label htmlFor="consult-notes">Consult notes</label>
                <textarea id="consult-notes" rows={6} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Paste subjective, objective, treatment to date and plan notes here…" />
                {draftError ? <p className="draft-error" role="alert">{draftError}</p> : null}
                <div className="start-panel-actions">
                  <button className="ghost-action" type="button" onClick={() => setStep(1)}><ArrowLeft aria-hidden="true" size={17} /> Back</button>
                  <button className="primary-action" type="button" onClick={async () => {
                    setIsDrafting(true);
                    setDraftError(null);
                    try { await onStartFromNotes(notes, buildStartContext()); }
                    catch (error) { setDraftError(error instanceof Error ? error.message : 'Unable to draft the form.'); }
                    finally { setIsDrafting(false); }
                  }} disabled={!notes.trim() || isDrafting}>
                    <ClipboardPaste aria-hidden="true" size={17} /> {isDrafting ? 'Drafting…' : 'Draft form'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="start-panel start-panel--action">
                <div><FilePlus2 aria-hidden="true" size={21} /><div><h3>Open the request</h3><p>Your selected patient and practitioner details will be added where available.</p></div></div>
                <div className="start-panel-actions"><button className="ghost-action" type="button" onClick={() => setStep(1)}><ArrowLeft aria-hidden="true" size={17} /> Back</button><button className="primary-action" type="button" onClick={() => onStartBlank(buildStartContext())}>Open form <ArrowRight aria-hidden="true" size={17} /></button></div>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="requests-empty" aria-labelledby="requests-heading">
        <h2 id="requests-heading">Your requests</h2>
        <div><FilePlus2 aria-hidden="true" size={24} /><h3>Your first request will show up here</h3><p>Saving, resuming and duplicating requests will be available in a future version.</p></div>
      </section>
    </main>
  );
}

interface ClinikoSelectionPanelProps {
  title: string;
  description: string;
  icon: ReactNode;
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  emptyMessage: string;
  onRefresh: () => void;
  children: ReactNode;
}

function ClinikoSelectionPanel({ title, description, icon, isLoading, error, isEmpty, emptyMessage, onRefresh, children }: ClinikoSelectionPanelProps) {
  return <div className="cliniko-selection-panel">
    <div className="cliniko-import-heading"><div>{icon}<div><h3>{title}</h3><p>{description}</p></div></div><button className="ghost-action" type="button" onClick={onRefresh} disabled={isLoading}><RefreshCw aria-hidden="true" size={16} /> Refresh</button></div>
    {error ? <p className="draft-error" role="alert">{error}</p> : null}
    {isLoading ? <p className="cliniko-empty">Loading Cliniko records…</p> : null}
    {isEmpty ? <p className="cliniko-empty">{emptyMessage}</p> : null}
    {!isLoading && !error ? <div className="cliniko-selection-list">{children}</div> : null}
  </div>;
}

function formatPatientName(patient: ClinikoPatient) {
  return [patient.preferredFirstName || patient.firstName, patient.lastName].filter(Boolean).join(' ') || 'Unnamed patient';
}

function formatPatientMeta(patient: ClinikoPatient) {
  const parts = [patient.dateOfBirth ? `DOB ${formatDate(patient.dateOfBirth)}` : '', patient.phone, patient.email].filter(Boolean);
  return parts.length ? parts.join(' · ') : 'No contact details recorded';
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}
