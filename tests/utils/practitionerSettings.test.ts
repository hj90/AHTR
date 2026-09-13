import { describe, expect, it } from 'vitest';
import { demoAlliedHealthReferral } from '../../src/forms/templates/demoAlliedHealthReferral';
import { worksafeVictoriaAlliedHealthRecoveryManagementPlan } from '../../src/forms/templates/worksafeVictoriaAlliedHealthRecoveryManagementPlan';
import {
  demoUserId,
  emptyPractitionerSettings,
  getNewFormValues,
  settingsToUserRow,
  userRowToSettings,
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

  it('maps settings to the demo users table row shape', () => {
    const row = settingsToUserRow({
      practitionerName: 'Alex Clinician',
      ahpraNumber: 'PHY0000000000',
      discipline: 'Physiotherapist',
      providerNumber: 'SIRA-123',
      practiceName: 'Example Allied Health',
      practicePhone: '0290000000',
      practiceEmail: 'practice@example.test',
      practiceAddress: '1 Example Street',
      practiceState: 'VIC',
    });

    expect(row).toEqual({
      id: demoUserId,
      practitioner_name: 'Alex Clinician',
      ahpra_number: 'PHY0000000000',
      discipline: 'Physiotherapist',
      provider_number: 'SIRA-123',
      practice_name: 'Example Allied Health',
      practice_phone: '0290000000',
      practice_email: 'practice@example.test',
      practice_address: '1 Example Street',
      practice_state: 'VIC',
    });
  });

  it('maps missing database rows to empty settings', () => {
    expect(userRowToSettings(null)).toEqual(emptyPractitionerSettings);
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
});
