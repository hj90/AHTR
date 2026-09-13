import {
  ArrowRight,
  CalendarCheck2,
  ChevronDown,
  ClipboardPaste,
  FilePlus2,
  Plug,
  RefreshCw,
  UserRound,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  importClinikoAppointments,
  listClinikoAppointments,
  listClinikoPatients,
} from '../integrations/clinikoImport';
import type { ClinikoAppointmentSummary, ClinikoPatient } from '../integrations/clinikoImport';

type StartMethod = 'notes' | 'blank' | 'cliniko';

interface HomeScreenProps {
  practiceState: 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA';
  onStartBlank: () => void;
  onStartFromNotes: (notes: string) => Promise<void>;
}

const choices: Array<{ id: StartMethod; label: string; note: string }> = [
  { id: 'notes', label: 'Draft from consult notes', note: 'Paste today’s notes and open a form to review.' },
  { id: 'blank', label: 'Fill it in myself', note: 'Start the existing nine-step form with saved details prefilled.' },
  { id: 'cliniko', label: 'Import from Cliniko', note: 'Load patient appointment notes into the draft workflow.' },
];

interface AppointmentListState {
  appointments: ClinikoAppointmentSummary[];
  isLoading: boolean;
  error: string | null;
}

export function HomeScreen({ practiceState, onStartBlank, onStartFromNotes }: HomeScreenProps) {
  const [victoriaClaimType, setVictoriaClaimType] = useState<'work' | 'transport'>('work');
  const [method, setMethod] = useState<StartMethod>('blank');
  const [notes, setNotes] = useState('');
  const [consent, setConsent] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [clinikoPatients, setClinikoPatients] = useState<ClinikoPatient[]>([]);
  const [isLoadingClinikoPatients, setIsLoadingClinikoPatients] = useState(false);
  const [clinikoError, setClinikoError] = useState<string | null>(null);
  const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);
  const [appointmentsByPatientId, setAppointmentsByPatientId] = useState<Record<string, AppointmentListState>>({});
  const [selectedAppointmentIds, setSelectedAppointmentIds] = useState<Set<string>>(() => new Set());
  const [isImportingCliniko, setIsImportingCliniko] = useState(false);
  const [hasLoadedClinikoPatients, setHasLoadedClinikoPatients] = useState(false);

  const selectedAppointmentCount = selectedAppointmentIds.size;
  const selectedAppointmentLabel = useMemo(
    () => `${selectedAppointmentCount} appointment${selectedAppointmentCount === 1 ? '' : 's'} selected`,
    [selectedAppointmentCount],
  );

  useEffect(() => {
    if (method === 'cliniko' && !hasLoadedClinikoPatients && !isLoadingClinikoPatients) {
      void loadPatients();
    }
  }, [hasLoadedClinikoPatients, isLoadingClinikoPatients, method]);

  async function loadPatients() {
    setIsLoadingClinikoPatients(true);
    setClinikoError(null);
    setExpandedPatientId(null);
    setSelectedAppointmentIds(new Set());
    setAppointmentsByPatientId({});

    try {
      const patients = await listClinikoPatients();
      setClinikoPatients(patients);
      setHasLoadedClinikoPatients(true);
    } catch (error) {
      setClinikoError(error instanceof Error ? error.message : 'Unable to load Cliniko patients.');
      setHasLoadedClinikoPatients(true);
    } finally {
      setIsLoadingClinikoPatients(false);
    }
  }

  async function togglePatient(patientId: string) {
    const isExpanded = expandedPatientId === patientId;
    const nextExpandedPatientId = isExpanded ? null : patientId;

    setExpandedPatientId(nextExpandedPatientId);
    setSelectedAppointmentIds(new Set());

    if (nextExpandedPatientId && !appointmentsByPatientId[patientId]) {
      await loadAppointments(patientId);
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
          error: error instanceof Error ? error.message : 'Unable to load Cliniko appointments.',
        },
      }));
    }
  }

  function toggleAppointment(appointmentId: string, checked: boolean) {
    setSelectedAppointmentIds((current) => {
      const next = new Set(current);

      if (checked) {
        next.add(appointmentId);
      } else {
        next.delete(appointmentId);
      }

      return next;
    });
  }

  async function importSelectedAppointments() {
    setIsImportingCliniko(true);
    setClinikoError(null);

    try {
      const clinicalNote = await importClinikoAppointments([...selectedAppointmentIds]);
      setNotes(clinicalNote);
      setConsent(false);
      setDraftError(null);
      setMethod('notes');
      window.scrollTo({ top: 0 });
    } catch (error) {
      setClinikoError(error instanceof Error ? error.message : 'Unable to import Cliniko appointment notes.');
    } finally {
      setIsImportingCliniko(false);
    }
  }

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
            <label className="ai-consent">
              <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
              <span>I understand these clinical notes will be sent to OpenAI to create a draft and must be reviewed before use.</span>
            </label>
            {draftError ? <p className="draft-error" role="alert">{draftError}</p> : null}
            <div className="start-panel-actions">
              <p><strong>Experimental:</strong> automatic parsing may not fill fields yet. Anything missing remains blank.</p>
              <button
                className="primary-action"
                type="button"
                onClick={async () => {
                  setIsDrafting(true);
                  setDraftError(null);
                  try {
                    await onStartFromNotes(notes);
                  } catch (error) {
                    setDraftError(error instanceof Error ? error.message : 'Unable to draft the form.');
                  } finally {
                    setIsDrafting(false);
                  }
                }}
                disabled={!notes.trim() || !consent || isDrafting}
              >
                <ClipboardPaste aria-hidden="true" size={17} /> {isDrafting ? 'Drafting…' : 'Draft form'}
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
          <div className="start-panel cliniko-import-panel">
            <div className="cliniko-import-heading">
              <div>
                <Plug aria-hidden="true" size={21} />
                <div>
                  <h3>Import from Cliniko</h3>
                  <p>{selectedAppointmentLabel}</p>
                </div>
              </div>
              <button
                className="ghost-action"
                type="button"
                onClick={() => {
                  setHasLoadedClinikoPatients(false);
                  void loadPatients();
                }}
                disabled={isLoadingClinikoPatients}
              >
                <RefreshCw aria-hidden="true" size={16} /> Refresh
              </button>
            </div>

            {clinikoError ? <p className="draft-error" role="alert">{clinikoError}</p> : null}

            {isLoadingClinikoPatients ? <p className="cliniko-empty">Loading Cliniko patients…</p> : null}

            {!isLoadingClinikoPatients && hasLoadedClinikoPatients && clinikoPatients.length === 0 ? (
              <p className="cliniko-empty">No active Cliniko patients were found.</p>
            ) : null}

            {clinikoPatients.length > 0 ? (
              <div className="cliniko-patient-list">
                {clinikoPatients.map((patient) => {
                  const isExpanded = expandedPatientId === patient.id;
                  const appointmentState = appointmentsByPatientId[patient.id];

                  return (
                    <article className="cliniko-patient-card" key={patient.id}>
                      <button
                        className="cliniko-patient-button"
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={() => void togglePatient(patient.id)}
                      >
                        <UserRound aria-hidden="true" size={18} />
                        <span>
                          <strong>{formatPatientName(patient)}</strong>
                          <small>{formatPatientMeta(patient)}</small>
                        </span>
                        <ChevronDown aria-hidden="true" className={isExpanded ? 'is-open' : ''} size={18} />
                      </button>

                      {isExpanded ? (
                        <div className="cliniko-appointment-list">
                          {appointmentState?.isLoading ? <p className="cliniko-empty">Loading appointments…</p> : null}

                          {appointmentState?.error ? <p className="draft-error" role="alert">{appointmentState.error}</p> : null}

                          {appointmentState && !appointmentState.isLoading && appointmentState.appointments.length === 0 ? (
                            <p className="cliniko-empty">No appointments found for this patient.</p>
                          ) : null}

                          {appointmentState?.appointments.map((appointment) => (
                            <label
                              className={`cliniko-appointment-row${appointment.hasNotes ? '' : ' is-disabled'}`}
                              key={appointment.id}
                            >
                              <input
                                type="checkbox"
                                checked={selectedAppointmentIds.has(appointment.id)}
                                disabled={!appointment.hasNotes}
                                onChange={(event) => toggleAppointment(appointment.id, event.target.checked)}
                              />
                              <CalendarCheck2 aria-hidden="true" size={18} />
                              <span>
                                <strong>{formatAppointmentTitle(appointment)}</strong>
                                <small>{appointment.hasNotes ? appointment.notesPreview : 'No transcript notes recorded'}</small>
                              </span>
                            </label>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            ) : null}

            <div className="start-panel-actions cliniko-import-actions">
              <p>Selected appointment notes will be copied into the consult notes field for review.</p>
              <button
                className="primary-action"
                type="button"
                disabled={selectedAppointmentCount === 0 || isImportingCliniko}
                onClick={() => void importSelectedAppointments()}
              >
                <ClipboardPaste aria-hidden="true" size={17} /> {isImportingCliniko ? 'Importing…' : 'Import selected'}
              </button>
            </div>
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

function formatPatientName(patient: ClinikoPatient) {
  const preferredName = patient.preferredFirstName || patient.firstName;
  const name = [preferredName, patient.lastName].filter(Boolean).join(' ');

  return name || 'Unnamed patient';
}

function formatPatientMeta(patient: ClinikoPatient) {
  const parts = [
    patient.dateOfBirth ? `DOB ${formatDate(patient.dateOfBirth)}` : '',
    patient.phone,
    patient.email,
  ].filter(Boolean);

  return parts.length ? parts.join(' · ') : 'No contact details recorded';
}

function formatAppointmentTitle(appointment: ClinikoAppointmentSummary) {
  return [formatDateTime(appointment.startsAt), appointment.appointmentType].filter(Boolean).join(' · ');
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}
