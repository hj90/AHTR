import { describe, expect, it } from 'vitest';
import { demoAlliedHealthReferral } from '../../src/forms/templates/demoAlliedHealthReferral';
import { worksafeVictoriaAlliedHealthRecoveryManagementPlan } from '../../src/forms/templates/worksafeVictoriaAlliedHealthRecoveryManagementPlan';
import { workcoverQueenslandProviderManagementPlan } from '../../src/forms/templates/workcoverQueenslandProviderManagementPlan';
import { workcoverWesternAustraliaPhysiotherapyTreatmentManagementPlan } from '../../src/forms/templates/workcoverWesternAustraliaPhysiotherapyTreatmentManagementPlan';
import { returnToWorkSouthAustraliaPhysiotherapyManagementPlan } from '../../src/forms/templates/returnToWorkSouthAustraliaPhysiotherapyManagementPlan';
import {
  demoClinicId,
  demoUserId,
  emptyPractitionerSettings,
  getNewFormValues,
  settingsToClinicRow,
  settingsToPractitionerRow,
  type PractitionerSettings,
} from '../../src/utils/practitionerSettings';

describe('practitioner settings helpers', () => {
  it('keeps unrelated form fields empty while applying matching saved defaults', () => {
    const values = getNewFormValues(demoAlliedHealthReferral, {
      ...emptyPractitionerSettings,
      practitionerName: 'Alex Clinician',
      practiceEmail: 'practice@example.test',
    });

    expect(values.patientName).toBe('');
    expect(values.practitionerName).toBe('Alex Clinician');
    expect(values.practiceEmail).toBe('practice@example.test');
  });

  it('maps settings to the clinic and practitioner row shapes', () => {
    const settings: PractitionerSettings = {
      ...emptyPractitionerSettings,
      practitionerName: 'Alex Clinician',
      ahpraNumber: 'PHY0000000000',
      discipline: 'Physiotherapist',
      providerNumber: 'SIRA-123',
      practitionerEmail: 'alex@example.test',
      preferredContactTime: 'Weekday mornings',
      signature: 'Alex Clinician',
      practiceName: 'Example Allied Health',
      practicePhone: '0290000000',
      practiceEmail: 'practice@example.test',
      fax: '0290000001',
      suburb: 'Richmond',
      postcode: '3121',
      practiceState: 'VIC',
    };

    expect(settingsToClinicRow(settings)).toEqual({
      id: demoClinicId,
      practice_name: 'Example Allied Health',
      practice_email: 'practice@example.test',
      practice_phone: '0290000000',
      fax: '0290000001',
      suburb: 'Richmond',
      state: 'VIC',
      postcode: '3121',
    });

    expect(settingsToPractitionerRow(settings)).toEqual({
      id: demoUserId,
      clinic_id: demoClinicId,
      name: 'Alex Clinician',
      ahpra_number: 'PHY0000000000',
      discipline: 'Physiotherapist',
      sira_approval_number: 'SIRA-123',
      email: 'alex@example.test',
      preferred_contact_time: 'Weekday mornings',
      signature: 'Alex Clinician',
    });
  });

  it('prefills the WorkSafe Victoria form from practitioner settings', () => {
    const values = getNewFormValues(
      worksafeVictoriaAlliedHealthRecoveryManagementPlan,
      {
        ...emptyPractitionerSettings,
        practiceState: 'VIC',
        practitionerName: 'Alex Clinician',
        discipline: 'Physiotherapist',
        practiceAddress: '1 Example Street',
      },
    );

    expect(values.practitionerName).toBe('Alex Clinician');
    expect(values.practiceAddress).toBe('1 Example Street');
    expect(values.vicDisciplinePhysiotherapy).toBe(true);
    expect(values.vicInitialPlan).toBe(true);
  });

  it('prefills the WorkCover Queensland form from practitioner settings', () => {
    const values = getNewFormValues(workcoverQueenslandProviderManagementPlan, {
      ...emptyPractitionerSettings,
      practiceState: 'QLD',
      practitionerName: 'Alex Clinician',
      practiceEmail: 'alex@example.test',
      practicePhone: '07 3000 0000',
      discipline: 'Physiotherapist',
    });

    expect(values.qldServicePhysiotherapy).toBe(true);
    expect(values.qldProviderContactDetails).toBe('Alex Clinician\nalex@example.test\n07 3000 0000');
  });

  it('selects physiotherapy on the WorkCover WA form', () => {
    const values = getNewFormValues(workcoverWesternAustraliaPhysiotherapyTreatmentManagementPlan, {
      ...emptyPractitionerSettings,
      practiceState: 'WA',
      practitionerName: 'Alex Clinician',
      practiceName: 'Example Physiotherapy',
    });

    expect(values.waPhysiotherapyConsultations).toBe(true);
    expect(values.practitionerName).toBe('Alex Clinician');
    expect(values.practiceName).toBe('Example Physiotherapy');
  });

  it('prefills the ReturnToWorkSA practitioner details on both form pages', () => {
    const values = getNewFormValues(returnToWorkSouthAustraliaPhysiotherapyManagementPlan, {
      ...emptyPractitionerSettings,
      practiceState: 'SA',
      practitionerName: 'Alex Clinician',
      practiceName: 'Example Physiotherapy',
    });

    expect(values.practitionerName).toBe('Alex Clinician');
    expect(values.practiceName).toBe('Example Physiotherapy');
    expect(values.saFunctionalProviderName).toBe('Alex Clinician');
  });
});
