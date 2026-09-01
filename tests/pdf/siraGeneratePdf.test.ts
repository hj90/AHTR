import { readFile } from 'node:fs/promises';
import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import type { FormValues } from '../../src/forms/formTypes';
import { siraAlliedHealthTreatmentRequest } from '../../src/forms/templates/siraAlliedHealthTreatmentRequest';
import { generateCompletedPdf } from '../../src/pdf/generatePdf';
import { getInitialFormValues } from '../../src/utils/formState';

function syntheticSiraValues(): FormValues {
  return {
    ...getInitialFormValues(siraAlliedHealthTreatmentRequest),
    requestNumber: 'REQ-TEST-001',
    requestDate: '2026-08-13',
    servicesFirstCommenced: '2026-08-01',
    consultationsToDate: '3',
    discipline: 'Physiotherapist',
    referredBy: 'Dr Synthetic Referrer',
    requestPhone: '0400000000',
    personName: 'Test Patient',
    dateOfBirth: '1990-01-01',
    preInjuryOccupation: 'Retail assistant',
    preInjuryWorkHours: '38',
    claimNumber: 'CLAIM-001',
    injuryDate: '2026-07-10',
    compensableInjury: 'Synthetic shoulder strain',
    clinicalSigns: 'Synthetic pain and reduced range of movement.',
    riskScreeningApplied: 'yes',
    hasPositionDescription: 'no',
    workPreInjuryCapacity: 'Full ordinary duties.',
    workCurrentCapacity: 'Suitable duties with lifting restrictions.',
    activitiesPreInjuryCapacity: 'Independent daily activities.',
    activitiesCurrentCapacity: 'Reduced overhead lifting tolerance.',
    som1Measure: 'Quick Disabilities of the Arm Shoulder and Hand (QuickDASH)',
    barriersToRecovery: 'Workload and pain confidence barriers.',
    recoveryStrategies: 'Graded activity and employer communication.',
    achievedLastPlanGoals: 'partially',
    workGoal: 'Return to modified duties.',
    activityGoal: 'Resume usual household tasks.',
    selfManagement: 'Daily exercise program.',
    intervention: 'Manual therapy and exercise progression.',
    serviceRationale: 'Additional sessions support return to work.',
    additionalSessions: '6',
    anticipatedDischargeDate: '2026-10-01',
    collaborativelyDeveloped: 'yes',
    service1Type: 'Physiotherapy consultation',
    service1Sessions: '6',
    service1Frequency: '1/week',
    service1Cost: '120',
    service1Total: '720',
    overallTotal: '720',
    practitionerName: 'Alex Clinician',
    practiceEmail: 'practice@example.com',
    ahpraNumber: 'PHY0000000000',
    bestContactTime: 'Weekday mornings',
    practiceName: 'Example Allied Health',
    suburb: 'Sydney',
    state: 'NSW',
    postcode: '2000',
    treatingPractitionerEmail: 'clinician@example.com',
    phoneNumber: '0290000000',
    fax: '0290000001',
    practitionerSignature: 'Alex Clinician',
  };
}

describe('SIRA PDF generation', () => {
  it('fills key AcroForm fields in the supplied SIRA PDF', async () => {
    const sourceBytes = await readFile(
      'public/templates/sira-allied-health-treatment-request-form.pdf',
    );
    const outputBytes = await generateCompletedPdf(
      siraAlliedHealthTreatmentRequest,
      syntheticSiraValues(),
      {
        fetchTemplate: async () => new Uint8Array(sourceBytes),
      },
    );

    const outputDoc = await PDFDocument.load(outputBytes);
    const form = outputDoc.getForm();

    expect(form.getTextField('Text Field 2').getText()).toBe('REQ-TEST-001');
    expect(form.getTextField('Text Field 145').getText()).toBe('13/08/2026');
    expect(form.getDropdown('Combo Box 1').getSelected()).toEqual(['Physiotherapist']);
    expect(form.getTextField('Text Field 91').getText()).toBe('Alex Clinician');
    expect(form.getTextField('Text Field 172').getText()).toBe(
      'Quick Disabilities of the Arm Shoulder and Hand (QuickDASH)',
    );
    expect(form.getTextField('Text Field 204').getText()).toBe('720');
    expect(form.getTextField('Text Field 209').getText()).toBe('720');
    expect(form.getCheckBox('Check Box 29').acroField.getValue()?.toString()).toBe('/Yes');
    expect(form.getCheckBox('Check Box 15').acroField.getValue()?.toString()).toBe(
      '/Partially',
    );
  });
});
