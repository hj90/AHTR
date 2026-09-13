import type { FormValues, PdfTemplateDefinition } from '../forms/formTypes';
import { getInitialFormValues } from './formState';

export const demoUserId = '11111111-1111-4111-8111-111111111111';

export interface PractitionerSettings {
  practiceState: 'NSW' | 'VIC' | 'QLD' | 'WA';
  practitionerName: string;
  ahpraNumber: string;
  discipline: string;
  providerNumber: string;
  practiceName: string;
  practicePhone: string;
  practiceEmail: string;
  practiceAddress: string;
}

export interface PractitionerSettingsRow {
  id: string;
  practitioner_name: string;
  ahpra_number: string;
  discipline: string;
  provider_number: string;
  practice_name: string;
  practice_phone: string;
  practice_email: string;
  practice_address: string;
  practice_state: string;
}

export const emptyPractitionerSettings: PractitionerSettings = {
  practiceState: 'NSW',
  practitionerName: '',
  ahpraNumber: '',
  discipline: '',
  providerNumber: '',
  practiceName: '',
  practicePhone: '',
  practiceEmail: '',
  practiceAddress: '',
};

export function getNewFormValues(
  template: PdfTemplateDefinition,
  settings: PractitionerSettings,
): FormValues {
  const values: FormValues = {
    ...getInitialFormValues(template),
    discipline: settings.discipline,
    practitionerName: settings.practitionerName,
    ahpraNumber: settings.ahpraNumber,
    siraApprovalNumber: settings.providerNumber,
    practiceName: settings.practiceName,
    phoneNumber: settings.practicePhone,
    practiceEmail: settings.practiceEmail,
    treatingPractitionerEmail: settings.practiceEmail,
    practiceAddress: settings.practiceAddress,
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

  return values;
}

export function settingsToUserRow(
  settings: PractitionerSettings,
  id = demoUserId,
): PractitionerSettingsRow {
  return {
    id,
    practitioner_name: settings.practitionerName,
    ahpra_number: settings.ahpraNumber,
    discipline: settings.discipline,
    provider_number: settings.providerNumber,
    practice_name: settings.practiceName,
    practice_phone: settings.practicePhone,
    practice_email: settings.practiceEmail,
    practice_address: settings.practiceAddress,
    practice_state: settings.practiceState,
  };
}

export function userRowToSettings(row: Partial<PractitionerSettingsRow> | null): PractitionerSettings {
  if (!row) {
    return emptyPractitionerSettings;
  }

  return {
    practitionerName: row.practitioner_name ?? '',
    ahpraNumber: row.ahpra_number ?? '',
    discipline: row.discipline ?? '',
    providerNumber: row.provider_number ?? '',
    practiceName: row.practice_name ?? '',
    practicePhone: row.practice_phone ?? '',
    practiceEmail: row.practice_email ?? '',
    practiceAddress: row.practice_address ?? '',
    practiceState: row.practice_state === 'VIC' || row.practice_state === 'QLD' || row.practice_state === 'WA'
      ? row.practice_state
      : 'NSW',
  };
}
