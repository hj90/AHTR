import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck2,
  ChevronDown,
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
  importClinikoAppointments,
  listClinikoAppointments,
  listClinikoPatients,
  listClinikoPractitioners,
} from '../integrations/clinikoImport';
import type {
  ClinikoAppointmentSummary,
  ClinikoPatient,
  ClinikoPractitioner,
} from '../integrations/clinikoImport';

type DetailSource = 'cliniko' | 'form';
type PractitionerSource = 'cliniko' | 'settings' | 'form';
type TreatmentSource = 'notes' | 'cliniko' | 'blank';

export interface HomeStartContext {
  patient: { source: DetailSource; selected: ClinikoPatient | null };
  practitioner: { source: PractitionerSource; selected: ClinikoPractitioner | null };
}

interface HomeScreenProps {
  practiceState: 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA';
  onStartBlank: (context: HomeStartContext) => void;
  onStartFromNotes: (notes: string, context: HomeStartContext) => Promise<void>;
}

interface AppointmentListState {
  appointments: ClinikoAppointmentSummary[];
  isLoading: boolean;
  error: string | null;
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

const treatmentChoices: Array<{ id: TreatmentSource; label: string; note: string; icon: typeof ClipboardPaste }> = [
  { id: 'notes', label: 'Paste consult notes', note: 'Draft the request from the notes you paste in.', icon: ClipboardPaste },
  { id: 'cliniko', label: 'Import treatment notes from Cliniko', note: 'Select one recorded treatment session to bring into the draft.', icon: Plug },
  { id: 'blank', label: 'Fill it in myself', note: 'Open the request with the selected details ready to review.', icon: FilePlus2 },
];

export function HomeScreen({ practiceState, onStartBlank, onStartFromNotes }: HomeScreenProps) {
  const [victoriaClaimType, setVictoriaClaimType] = useState<'work' | 'transport'>('work');
  const [step, setStep] = useState<1 | 2 | 3>(1);
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
  const [treatmentSource, setTreatmentSource] = useState<TreatmentSource>('blank');
  const [notes, setNotes] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [treatmentPatient, setTreatmentPatient] = useState<ClinikoPatient | null>(null);
  const [appointmentsByPatientId, setAppointmentsByPatientId] = useState<Record<string, AppointmentListState>>({});
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isImportingTreatmentNotes, setIsImportingTreatmentNotes] = useState(false);
  const [treatmentError, setTreatmentError] = useState<string | null>(null);

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

  useEffect(() => {
    if (treatmentSource === 'cliniko' && !hasLoadedPatients && !isLoadingPatients) {
      void loadPatients();
    }
  }, [hasLoadedPatients, isLoadingPatients, treatmentSource]);

  useEffect(() => {
    if (treatmentSource !== 'cliniko') return;

    const patientForTreatment = patientSource === 'cliniko' ? selectedPatient : treatmentPatient;
    if (patientForTreatment && !appointmentsByPatientId[patientForTreatment.id]) {
      void loadAppointments(patientForTreatment.id);
    }
  }, [appointmentsByPatientId, patientSource, selectedPatient, treatmentPatient, treatmentSource]);

  async function loadPatients() {
    setIsLoadingPatients(true);
    setPatientError(null);
    setTreatmentError(null);

    try {
      setClinikoPatients(await listClinikoPatients());
      setHasLoadedPatients(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load Cliniko patients.';
      setPatientError(message);
      setTreatmentError(message);
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

  async function loadAppointments(patientId: string) {
    setAppointmentsByPatientId((current) => ({
      ...current,
      [patientId]: { appointments: current[patientId]?.appointments ?? [], isLoading: true, error: null },
    }));

    try {
      const appointments = await listClinikoAppointments(patientId);
      setAppointmentsByPatientId((current) => ({
        ...current,
        [patientId]: { appointments, isLoading: false, error: null },
      }));
    } catch (error) {
      setAppointmentsByPatientId((current) => ({
        ...current,
        [patientId]: {
          appointments: current[patientId]?.appointments ?? [],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unable to load Cliniko treatment sessions.',
        },
      }));
    }
  }

  async function importTreatmentNotes() {
    if (!selectedAppointmentId) return;

    setIsImportingTreatmentNotes(true);
    setTreatmentError(null);

    try {
      setNotes(await importClinikoAppointments([selectedAppointmentId]));
      setDraftError(null);
      setTreatmentSource('notes');
      window.scrollTo({ top: 0 });
    } catch (error) {
      setTreatmentError(error instanceof Error ? error.message : 'Unable to import Cliniko treatment notes.');
    } finally {
      setIsImportingTreatmentNotes(false);
    }
  }

  function buildStartContext(): HomeStartContext {
    return {
      patient: { source: patientSource, selected: patientSource === 'cliniko' ? selectedPatient : null },
      practitioner: { source: practitionerSource, selected: practitionerSource === 'cliniko' ? selectedPractitioner : null },
    };
  }

  const canContinuePractitioner = practitionerSource !== 'cliniko' || Boolean(selectedPractitioner);
  const canContinuePatient = patientSource !== 'cliniko' || Boolean(selectedPatient);
  const treatmentPatientForNotes = patientSource === 'cliniko' ? selectedPatient : treatmentPatient;
  const appointmentState = treatmentPatientForNotes ? appointmentsByPatientId[treatmentPatientForNotes.id] : null;

  return (
    <main className="new-home-screen">
      <header className="compact-page-header home-page-header">
        <div>
          <h1>Allied Health PDF Filler</h1>
          <p>{getFormDescription(practiceState)}</p>
        </div>
      </header>

      <section className="start-section" aria-labelledby="start-heading">
        {practiceState === 'VIC' ? <ClaimTypeSelector value={victoriaClaimType} onChange={setVictoriaClaimType} /> : null}

        <div className="start-step-heading">
          <div>
            <p className="start-step-status">Step {step} of 3</p>
            <h2 id="start-heading">{getStepHeading(step)}</h2>
          </div>
          <div className="start-step-indicator" aria-hidden="true">
            {[1, 2, 3].map((item) => <span className={item <= step ? 'is-current' : ''} key={item} />)}
          </div>
        </div>

        {step === 1 ? (
          <fieldset className="intake-source-group">
            <legend><UserRound aria-hidden="true" size={18} /> Practitioner details</legend>
            <p>Choose how you would like to add the treating practitioner’s details.</p>
            <div className="start-choice-grid start-choice-grid--three">
              {practitionerChoices.map((choice) => <SourceChoice key={choice.id} choice={choice} name="practitioner-source" selected={practitionerSource === choice.id} onSelect={() => setPractitionerSource(choice.id)} />)}
            </div>
            {practitionerSource === 'cliniko' ? (
              <ClinikoSelectionPanel title="Select a practitioner" description="Cliniko supplies the practitioner name; complete any remaining practitioner fields in the request." icon={<UserRound aria-hidden="true" size={20} />} isLoading={isLoadingPractitioners} error={practitionerError} isEmpty={hasLoadedPractitioners && clinikoPractitioners.length === 0} emptyMessage="No active Cliniko practitioners were found." onRefresh={() => void loadPractitioners()}>
                {clinikoPractitioners.map((practitioner) => <label className={`cliniko-selection-row${selectedPractitioner?.id === practitioner.id ? ' is-selected' : ''}`} key={practitioner.id}>
                  <input type="radio" name="cliniko-practitioner" checked={selectedPractitioner?.id === practitioner.id} onChange={() => setSelectedPractitioner(practitioner)} />
                  <span><strong>{practitioner.name}</strong><small>{practitioner.designation || 'Cliniko practitioner'}</small></span>
                </label>)}
              </ClinikoSelectionPanel>
            ) : null}
            <StepActions backLabel={null} note={canContinuePractitioner ? 'You can return to this step before starting the request.' : 'Select the Cliniko practitioner before continuing.'} nextLabel="Continue to patient" onBack={() => undefined} onNext={() => setStep(2)} nextDisabled={!canContinuePractitioner} />
          </fieldset>
        ) : null}

        {step === 2 ? (
          <fieldset className="intake-source-group">
            <legend><UserRound aria-hidden="true" size={18} /> Patient details</legend>
            <p>Choose how you would like to add the patient’s details.</p>
            <div className="start-choice-grid start-choice-grid--two">
              {patientChoices.map((choice) => <SourceChoice key={choice.id} choice={choice} name="patient-source" selected={patientSource === choice.id} onSelect={() => setPatientSource(choice.id)} />)}
            </div>
            {patientSource === 'cliniko' ? (
              <ClinikoSelectionPanel title="Select a patient" description="The selected patient’s available Cliniko details will be added to the request." icon={<UsersRound aria-hidden="true" size={20} />} isLoading={isLoadingPatients} error={patientError} isEmpty={hasLoadedPatients && clinikoPatients.length === 0} emptyMessage="No active Cliniko patients were found." onRefresh={() => void loadPatients()}>
                {clinikoPatients.map((patient) => <label className={`cliniko-selection-row${selectedPatient?.id === patient.id ? ' is-selected' : ''}`} key={patient.id}>
                  <input type="radio" name="cliniko-patient" checked={selectedPatient?.id === patient.id} onChange={() => setSelectedPatient(patient)} />
                  <span><strong>{formatPatientName(patient)}</strong><small>{formatPatientMeta(patient)}</small></span>
                </label>)}
              </ClinikoSelectionPanel>
            ) : null}
            <StepActions backLabel="Back" note={canContinuePatient ? 'Your patient choice also determines the Cliniko treatment notes available in the next step.' : 'Select the Cliniko patient before continuing.'} nextLabel="Continue to treatment" onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={!canContinuePatient} />
          </fieldset>
        ) : null}

        {step === 3 ? (
          <div className="start-method-step">
            <div className="start-choice-grid start-choice-grid--three">
              {treatmentChoices.map((choice) => <SourceChoice key={choice.id} choice={choice} name="treatment-source" selected={treatmentSource === choice.id} onSelect={() => setTreatmentSource(choice.id)} />)}
            </div>

            {treatmentSource === 'notes' ? (
              <NotesPanel notes={notes} draftError={draftError} isDrafting={isDrafting} onNotesChange={setNotes} onBack={() => setStep(2)} onDraft={async () => {
                setIsDrafting(true);
                setDraftError(null);
                try { await onStartFromNotes(notes, buildStartContext()); }
                catch (error) { setDraftError(error instanceof Error ? error.message : 'Unable to draft the form.'); }
                finally { setIsDrafting(false); }
              }} />
            ) : null}

            {treatmentSource === 'cliniko' ? (
              <div className="start-panel cliniko-import-panel">
                <div className="cliniko-import-heading"><div><Plug aria-hidden="true" size={21} /><div><h3>Import treatment notes</h3><p>Select one Cliniko treatment session with recorded notes.</p></div></div></div>
                {patientSource === 'cliniko' && selectedPatient ? <p className="cliniko-empty">Using the patient selected in step 2: <strong>{formatPatientName(selectedPatient)}</strong></p> : null}
                {patientSource !== 'cliniko' ? <ClinikoSelectionPanel title="Select a patient" description="Choose the patient whose treatment notes you want to import." icon={<UsersRound aria-hidden="true" size={20} />} isLoading={isLoadingPatients} error={treatmentError} isEmpty={hasLoadedPatients && clinikoPatients.length === 0} emptyMessage="No active Cliniko patients were found." onRefresh={() => void loadPatients()}>
                  {clinikoPatients.map((patient) => <label className={`cliniko-selection-row${treatmentPatient?.id === patient.id ? ' is-selected' : ''}`} key={patient.id}>
                    <input type="radio" name="cliniko-treatment-patient" checked={treatmentPatient?.id === patient.id} onChange={() => { setTreatmentPatient(patient); setSelectedAppointmentId(null); }} />
                    <span><strong>{formatPatientName(patient)}</strong><small>{formatPatientMeta(patient)}</small></span>
                  </label>)}
                </ClinikoSelectionPanel> : null}
                {treatmentError ? <p className="draft-error" role="alert">{treatmentError}</p> : null}
                {treatmentPatientForNotes ? <AppointmentSelectionPanel state={appointmentState} selectedAppointmentId={selectedAppointmentId} onSelect={setSelectedAppointmentId} /> : null}
                <div className="start-panel-actions cliniko-import-actions">
                  <button className="ghost-action" type="button" onClick={() => setStep(2)}><ArrowLeft aria-hidden="true" size={17} /> Back</button>
                  <button className="primary-action" type="button" disabled={!selectedAppointmentId || isImportingTreatmentNotes} onClick={() => void importTreatmentNotes()}><ClipboardPaste aria-hidden="true" size={17} /> {isImportingTreatmentNotes ? 'Importing…' : 'Import treatment notes'}</button>
                </div>
              </div>
            ) : null}

            {treatmentSource === 'blank' ? (
              <div className="start-panel start-panel--action">
                <div><FilePlus2 aria-hidden="true" size={21} /><div><h3>Open the request</h3><p>Your selected patient and practitioner details will be added where available.</p></div></div>
                <div className="start-panel-actions"><button className="ghost-action" type="button" onClick={() => setStep(2)}><ArrowLeft aria-hidden="true" size={17} /> Back</button><button className="primary-action" type="button" onClick={() => onStartBlank(buildStartContext())}>Open form <ArrowRight aria-hidden="true" size={17} /></button></div>
              </div>
            ) : null}
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

function ClaimTypeSelector({ value, onChange }: { value: 'work' | 'transport'; onChange: (value: 'work' | 'transport') => void }) {
  return <div className="claim-type-section"><h2>What kind of claim is this?</h2><div className="claim-type-grid">
    <label className={`start-choice${value === 'work' ? ' is-selected' : ''}`}><input type="radio" name="victoria-claim-type" checked={value === 'work'} onChange={() => onChange('work')} /><span><strong>Work injury</strong><small>Use the WorkSafe Victoria recovery management plan.</small></span></label>
    <label className="start-choice is-disabled" aria-disabled="true"><input type="radio" name="victoria-claim-type" disabled checked={value === 'transport'} onChange={() => onChange('transport')} /><span><strong>Transport accident</strong><small>Coming soon</small></span></label>
  </div></div>;
}

function SourceChoice({ choice, name, selected, onSelect }: { choice: { id: string; label: string; note: string; icon: typeof Plug }; name: string; selected: boolean; onSelect: () => void }) {
  const Icon = choice.icon;
  return <label className={`start-choice${selected ? ' is-selected' : ''}`}>
    <input type="radio" aria-label={choice.label} name={name} value={choice.id} checked={selected} onChange={onSelect} />
    <span><Icon aria-hidden="true" size={18} /><strong>{choice.label}</strong><small>{choice.note}</small></span>
  </label>;
}

function StepActions({ backLabel, note, nextLabel, onBack, onNext, nextDisabled }: { backLabel: string | null; note: string; nextLabel: string; onBack: () => void; onNext: () => void; nextDisabled: boolean }) {
  return <div className="start-panel-actions intake-next-action"><p>{note}</p><div>{backLabel ? <button className="ghost-action" type="button" onClick={onBack}><ArrowLeft aria-hidden="true" size={17} /> {backLabel}</button> : null}<button className="primary-action" type="button" disabled={nextDisabled} onClick={onNext}>{nextLabel} <ArrowRight aria-hidden="true" size={17} /></button></div></div>;
}

function NotesPanel({ notes, draftError, isDrafting, onNotesChange, onBack, onDraft }: { notes: string; draftError: string | null; isDrafting: boolean; onNotesChange: (notes: string) => void; onBack: () => void; onDraft: () => Promise<void> }) {
  return <div className="start-panel"><label htmlFor="consult-notes">Consult notes</label><textarea id="consult-notes" rows={6} value={notes} onChange={(event) => onNotesChange(event.target.value)} placeholder="Paste subjective, objective, treatment to date and plan notes here…" />{draftError ? <p className="draft-error" role="alert">{draftError}</p> : null}<div className="start-panel-actions"><button className="ghost-action" type="button" onClick={onBack}><ArrowLeft aria-hidden="true" size={17} /> Back</button><button className="primary-action" type="button" onClick={() => void onDraft()} disabled={!notes.trim() || isDrafting}><ClipboardPaste aria-hidden="true" size={17} /> {isDrafting ? 'Drafting…' : 'Draft form'}</button></div></div>;
}

function ClinikoSelectionPanel({ title, description, icon, isLoading, error, isEmpty, emptyMessage, onRefresh, children }: { title: string; description: string; icon: ReactNode; isLoading: boolean; error: string | null; isEmpty: boolean; emptyMessage: string; onRefresh: () => void; children: ReactNode }) {
  return <div className="cliniko-selection-panel"><div className="cliniko-import-heading"><div>{icon}<div><h3>{title}</h3><p>{description}</p></div></div><button className="ghost-action" type="button" onClick={onRefresh} disabled={isLoading}><RefreshCw aria-hidden="true" size={16} /> Refresh</button></div>{error ? <p className="draft-error" role="alert">{error}</p> : null}{isLoading ? <p className="cliniko-empty">Loading Cliniko records…</p> : null}{isEmpty ? <p className="cliniko-empty">{emptyMessage}</p> : null}{!isLoading && !error ? <div className="cliniko-selection-list">{children}</div> : null}</div>;
}

function AppointmentSelectionPanel({ state, selectedAppointmentId, onSelect }: { state: AppointmentListState | null; selectedAppointmentId: string | null; onSelect: (id: string) => void }) {
  if (state?.isLoading) return <p className="cliniko-empty">Loading Cliniko treatment sessions…</p>;
  if (state?.error) return <p className="draft-error" role="alert">{state.error}</p>;
  if (state && state.appointments.length === 0) return <p className="cliniko-empty">No treatment sessions were found for this patient.</p>;
  return <div className="cliniko-appointment-list">{state?.appointments.map((appointment) => <label className={`cliniko-appointment-row${appointment.hasNotes ? '' : ' is-disabled'}`} key={appointment.id}><input type="radio" name="cliniko-treatment-appointment" disabled={!appointment.hasNotes} checked={selectedAppointmentId === appointment.id} onChange={() => onSelect(appointment.id)} /><CalendarCheck2 aria-hidden="true" size={18} /><span><strong>{formatAppointmentTitle(appointment)}</strong><small>{appointment.hasNotes ? appointment.notesPreview : 'No transcript notes recorded'}</small></span><ChevronDown aria-hidden="true" size={17} /></label>)}</div>;
}

function getStepHeading(step: 1 | 2 | 3) {
  return step === 1 ? 'Choose practitioner details' : step === 2 ? 'Choose patient details' : 'Choose treatment request details';
}

function getFormDescription(practiceState: HomeScreenProps['practiceState']) {
  if (practiceState === 'VIC') return 'Fill in the WorkSafe Victoria allied health recovery management plan through a guided form, then download the completed PDF.';
  if (practiceState === 'QLD') return 'Fill in the WorkCover Queensland provider management plan through a guided form, then download the completed PDF.';
  if (practiceState === 'WA') return 'Fill in the WorkCover WA physiotherapy treatment management plan through a guided form, then download the completed PDF.';
  if (practiceState === 'SA') return 'Fill in the ReturnToWorkSA physiotherapy management plan through a guided form, then download the completed PDF.';
  return 'Fill in the SIRA allied health treatment request through a guided form, then download the completed PDF.';
}

function formatPatientName(patient: ClinikoPatient) {
  return [patient.preferredFirstName || patient.firstName, patient.lastName].filter(Boolean).join(' ') || 'Unnamed patient';
}

function formatPatientMeta(patient: ClinikoPatient) {
  const parts = [patient.dateOfBirth ? `DOB ${formatDate(patient.dateOfBirth)}` : '', patient.phone, patient.email].filter(Boolean);
  return parts.length ? parts.join(' · ') : 'No contact details recorded';
}

function formatAppointmentTitle(appointment: ClinikoAppointmentSummary) {
  return [formatDateTime(appointment.startsAt), appointment.appointmentType].filter(Boolean).join(' · ');
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}
