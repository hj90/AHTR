import { ClinikoClient, buildPath } from '../scripts/lib/cliniko-client.mjs';
import { loadLocalEnv } from '../scripts/lib/local-env.mjs';

const MAX_IMPORT_APPOINTMENTS = 20;

export default async function handler(request, response) {
  try {
    if (request.method === 'GET') {
      return handleGet(request, response);
    }

    if (request.method === 'POST') {
      return handlePost(request, response);
    }

    response.setHeader('Allow', 'GET, POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    if (error instanceof BadRequestError) {
      return response.status(400).json({ error: error.message });
    }

    console.error('Unable to import from Cliniko', error instanceof Error ? error.message : 'Unknown error');
    return response.status(502).json({
      error: error instanceof Error ? error.message : 'Unable to reach Cliniko.',
    });
  }
}

async function handleGet(request, response) {
  const url = getRequestUrl(request);
  const action = url.searchParams.get('action');
  const cliniko = ClinikoClient.fromEnv(await loadLocalEnv());

  if (action === 'patients') {
    const patients = await cliniko.get(buildPath('/patients', {
      page: url.searchParams.get('page') || 1,
      per_page: 100,
      sort: 'updated_at:desc',
    }));

    return response.status(200).json({
      patients: (patients.patients ?? []).map(mapPatient),
      totalEntries: patients.total_entries ?? null,
      hasMore: Boolean(patients.links?.next),
    });
  }

  if (action === 'appointments') {
    const patientId = requireId(url.searchParams.get('patientId'), 'patientId');
    const appointments = await cliniko.get(buildPath('/individual_appointments', {
      per_page: 100,
      sort: 'starts_at:desc',
      'q[]': [`patient_id:=${patientId}`],
    }));

    return response.status(200).json({
      appointments: (appointments.individual_appointments ?? []).map(mapAppointmentSummary),
      totalEntries: appointments.total_entries ?? null,
      hasMore: Boolean(appointments.links?.next),
    });
  }

  return response.status(400).json({ error: 'Unknown Cliniko import action.' });
}

async function handlePost(request, response) {
  const appointmentIds = Array.isArray(request.body?.appointmentIds) ? request.body.appointmentIds : [];
  const ids = [...new Set(appointmentIds.map((id) => String(id)))];

  if (!ids.length) {
    return response.status(400).json({ error: 'Select at least one Cliniko appointment.' });
  }

  if (ids.length > MAX_IMPORT_APPOINTMENTS) {
    return response.status(400).json({ error: `Select ${MAX_IMPORT_APPOINTMENTS} or fewer appointments.` });
  }

  for (const id of ids) {
    requireId(id, 'appointmentId');
  }

  const cliniko = ClinikoClient.fromEnv(await loadLocalEnv());
  const appointments = await Promise.all(ids.map((id) => cliniko.get(`/individual_appointments/${id}`)));
  appointments.sort((left, right) => String(left.starts_at ?? '').localeCompare(String(right.starts_at ?? '')));

  const patientIds = [...new Set(appointments.map(readAppointmentPatientId).filter(Boolean))];
  if (patientIds.length > 1) {
    throw new BadRequestError('Select appointments from one Cliniko patient at a time.');
  }

  const patient = patientIds[0] ? await cliniko.get(`/patients/${patientIds[0]}`) : null;
  const patientContext = patient ? formatPatientContext(mapPatientDetail(patient)) : '';
  const importedAppointments = appointments.map(mapAppointmentDetail);
  const clinicalNote = [patientContext, ...importedAppointments.map(formatAppointmentNotes)]
    .filter(Boolean)
    .join('\n\n---\n\n');

  return response.status(200).json({
    clinicalNote,
    appointments: importedAppointments,
  });
}

function getRequestUrl(request) {
  return new URL(request.url ?? '/', 'http://localhost');
}

function requireId(value, label) {
  if (!value || !/^\d+$/.test(value)) {
    throw new BadRequestError(`Invalid Cliniko ${label}.`);
  }

  return value;
}

class BadRequestError extends Error {}

function mapPatient(patient) {
  return {
    id: String(patient.id),
    firstName: patient.first_name ?? '',
    lastName: patient.last_name ?? '',
    preferredFirstName: patient.preferred_first_name ?? '',
    dateOfBirth: patient.date_of_birth ?? null,
    email: patient.email ?? null,
    phone: patient.patient_phone_numbers?.[0]?.number ?? null,
    updatedAt: patient.updated_at ?? null,
  };
}

function mapPatientDetail(patient) {
  return {
    ...mapPatient(patient),
    occupation: patient.occupation ?? '',
    address: formatAddress(patient),
  };
}

function mapAppointmentSummary(appointment) {
  return {
    id: String(appointment.id),
    patientId: String(readAppointmentPatientId(appointment) ?? ''),
    startsAt: appointment.starts_at ?? '',
    endsAt: appointment.ends_at ?? '',
    appointmentType: appointment.appointment_type?.name ?? 'Appointment',
    practitioner: formatPersonName(appointment.practitioner),
    hasNotes: Boolean(appointment.notes?.trim()),
    notesPreview: previewText(appointment.notes),
  };
}

function mapAppointmentDetail(appointment) {
  return {
    id: String(appointment.id),
    patientId: String(readAppointmentPatientId(appointment) ?? ''),
    startsAt: appointment.starts_at ?? '',
    endsAt: appointment.ends_at ?? '',
    appointmentType: appointment.appointment_type?.name ?? 'Appointment',
    practitioner: formatPersonName(appointment.practitioner),
    business: appointment.business?.name ?? '',
    notes: appointment.notes ?? '',
  };
}

function formatPatientContext(patient) {
  return [
    'Cliniko patient context',
    `Patient name: ${formatMappedPatientName(patient)}`,
    patient.preferredFirstName ? `Preferred name: ${patient.preferredFirstName}` : '',
    patient.dateOfBirth ? `Date of birth: ${patient.dateOfBirth}` : '',
    patient.occupation ? `Cliniko occupation: ${patient.occupation}` : '',
    patient.phone ? `Phone: ${patient.phone}` : '',
    patient.email ? `Email: ${patient.email}` : '',
    patient.address ? `Address: ${patient.address}` : '',
  ].filter(Boolean).join('\n');
}

function formatAppointmentNotes(appointment) {
  return [
    `Cliniko appointment ${appointment.id}`,
    appointment.startsAt ? `Date/time: ${appointment.startsAt}` : '',
    appointment.appointmentType ? `Appointment type: ${appointment.appointmentType}` : '',
    appointment.practitioner ? `Practitioner: ${appointment.practitioner}` : '',
    appointment.business ? `Business: ${appointment.business}` : '',
    '',
    appointment.notes?.trim() || 'No appointment notes were recorded in Cliniko.',
  ].filter((line) => line !== '').join('\n');
}

function formatPersonName(person) {
  if (!person) return '';

  return [person.first_name, person.last_name].filter(Boolean).join(' ');
}

function formatMappedPatientName(patient) {
  return [patient.preferredFirstName || patient.firstName, patient.lastName].filter(Boolean).join(' ') || 'Unknown patient';
}

function formatAddress(patient) {
  return [
    patient.address_1,
    patient.address_2,
    patient.city,
    patient.state,
    patient.post_code,
    patient.country_code,
  ].filter(Boolean).join(', ');
}

function previewText(value) {
  const text = value?.replace(/\s+/g, ' ').trim();
  if (!text) return '';

  return text.length > 180 ? `${text.slice(0, 177)}...` : text;
}

function readAppointmentPatientId(appointment) {
  return readResourceId(appointment.patient?.links?.self, 'patients')
    ?? readLinkedId(appointment.attendees?.links?.self, 'patient_id')
    ?? (appointment.patient_id ? String(appointment.patient_id) : null);
}

function readResourceId(url, resourceName) {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    const match = parsedUrl.pathname.match(new RegExp(`/${resourceName}/(\\d+)(?:/|$)`));

    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

function readLinkedId(url, key) {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    const filters = parsedUrl.searchParams.getAll('q[]');
    const prefix = `${key}:=`;
    const filter = filters.find((item) => item.startsWith(prefix));

    return filter ? filter.slice(prefix.length) : null;
  } catch {
    return null;
  }
}
