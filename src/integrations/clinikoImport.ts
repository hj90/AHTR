export interface ClinikoPatient {
  id: string;
  firstName: string;
  lastName: string;
  preferredFirstName: string;
  dateOfBirth: string | null;
  email: string | null;
  phone: string | null;
  updatedAt: string | null;
}

export interface ClinikoAppointmentSummary {
  id: string;
  patientId: string;
  startsAt: string;
  endsAt: string;
  appointmentType: string;
  practitioner: string;
  hasNotes: boolean;
  notesPreview: string;
}

export interface ClinikoImportedAppointment {
  id: string;
  startsAt: string;
  endsAt: string;
  appointmentType: string;
  practitioner: string;
  business: string;
  notes: string;
}

interface PatientsResponse {
  patients?: ClinikoPatient[];
  error?: string;
}

interface AppointmentsResponse {
  appointments?: ClinikoAppointmentSummary[];
  error?: string;
}

interface ImportResponse {
  clinicalNote?: string;
  appointments?: ClinikoImportedAppointment[];
  error?: string;
}

export async function listClinikoPatients(): Promise<ClinikoPatient[]> {
  const response = await fetch('/api/cliniko-import?action=patients');
  const result = (await response.json()) as PatientsResponse;

  if (!response.ok) {
    throw new Error(result.error || 'Unable to load Cliniko patients.');
  }

  return result.patients ?? [];
}

export async function listClinikoAppointments(patientId: string): Promise<ClinikoAppointmentSummary[]> {
  const response = await fetch(`/api/cliniko-import?action=appointments&patientId=${encodeURIComponent(patientId)}`);
  const result = (await response.json()) as AppointmentsResponse;

  if (!response.ok) {
    throw new Error(result.error || 'Unable to load Cliniko appointments.');
  }

  return result.appointments ?? [];
}

export async function importClinikoAppointments(appointmentIds: string[]): Promise<string> {
  const response = await fetch('/api/cliniko-import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appointmentIds }),
  });
  const result = (await response.json()) as ImportResponse;

  if (!response.ok) {
    throw new Error(result.error || 'Unable to import Cliniko appointments.');
  }

  return result.clinicalNote ?? '';
}
