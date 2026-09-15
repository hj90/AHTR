import type { FormValues, PdfTemplateDefinition } from '../forms/formTypes';
import { getInitialFormValues } from './formState';

export const demoUserId = '11111111-1111-4111-8111-111111111111';
export const demoClinicId = '22222222-2222-4222-8222-222222222222';

export interface PractitionerSettings {
  practiceState: 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA';
  practitionerName: string;
  ahpraNumber: string;
  discipline: string;
  providerNumber: string;
  practitionerEmail: string;
  preferredContactTime: string;
  signature: string;
  practiceName: string;
  practicePhone: string;
  practiceEmail: string;
  fax: string;
  suburb: string;
  postcode: string;
  practiceAddress: string;
}

export interface ClinicSettingsRow {
  id: string;
  practice_name: string;
  practice_email: string;
  practice_phone: string;
  fax: string;
  suburb: string;
  state: string;
  postcode: string;
}

export interface PractitionerSettingsTableRow {
  id: string;
  clinic_id: string;
  name: string;
  ahpra_number: string;
  discipline: string;
  sira_approval_number: string;
  email: string;
  preferred_contact_time: string;
  signature: string;
}

export const emptyPractitionerSettings: PractitionerSettings = {
  practiceState: 'NSW',
  practitionerName: '',
  ahpraNumber: '',
  discipline: '',
  providerNumber: '',
  practitionerEmail: '',
  preferredContactTime: '',
  signature: '',
  practiceName: '',
  practicePhone: '',
  practiceEmail: '',
  fax: '',
  suburb: '',
  postcode: '',
  practiceAddress: '',
};

export function getNewFormValues(
  template: PdfTemplateDefinition,
  settings: PractitionerSettings,
): FormValues {
  const practiceAddress = settings.practiceAddress || formatClinicAddress(settings);
  const practitionerEmail = settings.practitionerEmail || settings.practiceEmail;
  const values: FormValues = {
    ...getInitialFormValues(template),
    discipline: settings.discipline,
    practitionerName: settings.practitionerName,
    ahpraNumber: settings.ahpraNumber,
    siraApprovalNumber: settings.providerNumber,
    practiceName: settings.practiceName,
    phoneNumber: settings.practicePhone,
    practiceEmail: settings.practiceEmail,
    treatingPractitionerEmail: practitionerEmail,
    bestContactTime: settings.preferredContactTime,
    fax: settings.fax,
    suburb: settings.suburb,
    state: settings.practiceState,
    postcode: settings.postcode,
    practitionerSignature: settings.signature || settings.practitionerName,
    practiceAddress,
  };

  if (template.id === 'worksafe-victoria-allied-health-recovery-management-plan') {
    const disciplineFieldBySetting: Record<string, string> = {
      Physiotherapist: 'vicDisciplinePhysiotherapy',
      Osteopath: 'vicDisciplineOsteopathy',
      Chiropractor: 'vicDisciplineChiropractic',
      Podiatrist: 'vicDisciplinePodiatry',
      'Occupational Therapist': 'vicDisciplineOccupationalTherapy',
      'Accredited Exercise Physiologist': 'vicDisciplineExercisePhysiology',
    };
    const disciplineField = disciplineFieldBySetting[settings.discipline];
    if (disciplineField) values[disciplineField] = true;
    values.vicInitialPlan = true;
  }

  if (template.id === 'workcover-queensland-provider-management-plan') {
    const disciplineFieldBySetting: Record<string, string> = {
      Physiotherapist: 'qldServicePhysiotherapy',
      Osteopath: 'qldServiceOsteopathy',
      Chiropractor: 'qldServiceChiropractic',
      Podiatrist: 'qldServicePodiatry',
      'Occupational Therapist': 'qldServiceOccupationalTherapy',
      'Accredited Exercise Physiologist': 'qldServiceExercisePhysiology',
      Psychologist: 'qldServicePsychology',
    };
    const disciplineField = disciplineFieldBySetting[settings.discipline];
    if (disciplineField) values[disciplineField] = true;
    values.qldProviderContactDetails = [settings.practitionerName, settings.practiceEmail, settings.practicePhone]
      .filter(Boolean)
      .join('\n');
  }

  if (template.id === 'workcover-western-australia-physiotherapy-treatment-management-plan') {
    values.waPhysiotherapyConsultations = true;
  }

  if (template.id === 'return-to-work-south-australia-physiotherapy-management-plan') {
    values.saFunctionalProviderName = settings.practitionerName;
  }

  return values;
}

export function settingsToClinicRow(
  settings: PractitionerSettings,
  id = demoClinicId,
): ClinicSettingsRow {
  return {
    id,
    practice_name: settings.practiceName,
    practice_email: settings.practiceEmail,
    practice_phone: settings.practicePhone,
    fax: settings.fax,
    suburb: settings.suburb,
    state: settings.practiceState,
    postcode: settings.postcode,
  };
}

export function settingsToPractitionerRow(
  settings: PractitionerSettings,
  clinicId = demoClinicId,
  id = demoUserId,
): PractitionerSettingsTableRow {
  return {
    id,
    clinic_id: clinicId,
    name: settings.practitionerName,
    ahpra_number: settings.ahpraNumber,
    discipline: settings.discipline,
    sira_approval_number: settings.providerNumber,
    email: settings.practitionerEmail,
    preferred_contact_time: settings.preferredContactTime,
    signature: settings.signature,
  };
}

export function clinicAndPractitionerRowsToSettings(
  clinic: Partial<ClinicSettingsRow> | null,
  practitioner: Partial<PractitionerSettingsTableRow> | null,
): PractitionerSettings {
  if (!clinic && !practitioner) {
    return emptyPractitionerSettings;
  }

  const practiceState = normalizePracticeState(clinic?.state);
  const suburb = clinic?.suburb ?? '';
  const postcode = clinic?.postcode ?? '';

  return {
    practitionerName: practitioner?.name ?? '',
    ahpraNumber: practitioner?.ahpra_number ?? '',
    discipline: practitioner?.discipline ?? '',
    providerNumber: practitioner?.sira_approval_number ?? '',
    practitionerEmail: practitioner?.email ?? '',
    preferredContactTime: practitioner?.preferred_contact_time ?? '',
    signature: practitioner?.signature ?? '',
    practiceName: clinic?.practice_name ?? '',
    practicePhone: clinic?.practice_phone ?? '',
    practiceEmail: clinic?.practice_email ?? '',
    fax: clinic?.fax ?? '',
    suburb,
    postcode,
    practiceAddress: formatAddressParts(suburb, practiceState, postcode),
    practiceState,
  };
}

export function normalizePracticeState(value: string | undefined): PractitionerSettings['practiceState'] {
  return value === 'VIC' || value === 'QLD' || value === 'WA' || value === 'SA' ? value : 'NSW';
}

function formatClinicAddress(settings: PractitionerSettings): string {
  return formatAddressParts(settings.suburb, settings.practiceState, settings.postcode);
}

function formatAddressParts(
  suburb: string,
  state: PractitionerSettings['practiceState'],
  postcode: string,
): string {
  return [suburb, state, postcode].filter(Boolean).join(' ');
}
