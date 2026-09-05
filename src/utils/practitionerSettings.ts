import type { FormValues, PdfTemplateDefinition } from '../forms/formTypes';
import { getInitialFormValues } from './formState';

export interface PractitionerSettings {
  practitionerName: string;
  ahpraNumber: string;
  discipline: string;
  providerNumber: string;
  practiceName: string;
  practicePhone: string;
  practiceEmail: string;
  practiceAddress: string;
}

export const emptyPractitionerSettings: PractitionerSettings = {
  practitionerName: '',
  ahpraNumber: '',
  discipline: '',
  providerNumber: '',
  practiceName: '',
  practicePhone: '',
  practiceEmail: '',
  practiceAddress: '',
};

const storageKey = 'ahtr-practitioner-settings-v1';

export function loadPractitionerSettings(): PractitionerSettings {
  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored
      ? { ...emptyPractitionerSettings, ...(JSON.parse(stored) as Partial<PractitionerSettings>) }
      : emptyPractitionerSettings;
  } catch {
    return emptyPractitionerSettings;
  }
}

export function savePractitionerSettings(settings: PractitionerSettings): void {
  window.localStorage.setItem(storageKey, JSON.stringify(settings));
}

export function clearPractitionerSettings(): void {
  window.localStorage.removeItem(storageKey);
}

export function getNewFormValues(
  template: PdfTemplateDefinition,
  settings: PractitionerSettings,
): FormValues {
  return {
    ...getInitialFormValues(template),
    discipline: settings.discipline,
    practitionerName: settings.practitionerName,
    ahpraNumber: settings.ahpraNumber,
    siraApprovalNumber: settings.providerNumber,
    practiceName: settings.practiceName,
    phoneNumber: settings.practicePhone,
    practiceEmail: settings.practiceEmail,
    treatingPractitionerEmail: settings.practiceEmail,
  };
}
